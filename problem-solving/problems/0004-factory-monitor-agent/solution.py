#!/usr/bin/env python3
"""0004. FactoryMonitorAgent — 스마트 공장 텔레메트리 상태 기반 에이전트 (LangGraph)

풀이 요약: assess(LLM severity 평가) → critical 이면 interrupt() 로 인간 개입,
          그 외는 LLM tool-calling 루프(ToolNode) → summarize(LLM 보고서).
          MemorySaver 체크포인터로 중단/재개.

그래프:
    START → assess ─(critical)→ await_human ──────────────→ summarize → END
                   └(low/med/high)→ auto_resolve ⇄ tools ──→ summarize
                                     (tool_calls 없으면 summarize)

검증 환경: langgraph 1.2.11 / langchain-core 1.5.4 / Python 3.14.6
LLM 은 주입한다 — 검증은 실제 BaseChatModel 계약을 만족하는 결정적
ScriptedChatModel 로 오프라인 수행한다. ChatAnthropic/ChatOpenAI 로 그대로 교체 가능.

단독 실행:
    ../../.venv/bin/python solution.py
"""

from __future__ import annotations

import operator
from typing import Annotated, Any, Literal

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import (
    AIMessage,
    AnyMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict

VALID_SEVERITIES = ("low", "medium", "high", "critical")

# 모델이 도구를 무한 호출하는 것을 막는 도메인 상한.
# LangGraph 내장 recursion_limit 은 기본 10007 이라 실질 가드가 못 된다.
MAX_TOOL_ROUNDS = 5

# 같은 모델 인스턴스가 세 단계에서 호출되므로 프롬프트에 단계 태그를 심는다.
# 실제 LLM 에는 무해한 접두사이고, 검증용 모델은 이걸 보고 응답을 고른다.
ASSESS_TAG = "[stage:assess]"
RESOLVE_TAG = "[stage:auto_resolve]"
REPORT_TAG = "[stage:summarize]"


# --------------------------------------------------------------------------
# 도구 — ToolNode 가 실제로 실행한다
# --------------------------------------------------------------------------


@tool
def schedule_maintenance(machine_id: str, urgency: str) -> str:
    """Schedule a maintenance visit for a machine. urgency is low, medium or high."""
    return f"maintenance scheduled for {machine_id} (urgency={urgency})"


@tool
def reorder_parts(part_name: str, quantity: int) -> str:
    """Reorder spare parts when the inventory level is too low."""
    return f"reordered {quantity}x {part_name}"


@tool
def log_incident(machine_id: str, description: str) -> str:
    """Write an incident record into the maintenance log."""
    return f"incident logged for {machine_id}: {description}"


TOOLS = [schedule_maintenance, reorder_parts, log_incident]


# --------------------------------------------------------------------------
# 상태
# --------------------------------------------------------------------------


class FactoryState(TypedDict):
    """그래프 공유 상태.

    리듀서 있는 필드:
      - actions_taken: operator.add — 여러 노드가 append 한다. 리듀서 없으면 덮어써진다.
      - messages: add_messages — tool-calling 루프용. ToolNode 가 ToolMessage 를 붙인다.
    리듀서 없는 필드는 최신값만 의미가 있어 덮어쓰기로 둔다.
    """

    machine_id: str
    telemetry: dict[str, Any]
    severity: str
    actions_taken: Annotated[list[str], operator.add]
    pending_human_review: bool
    human_decision: Any
    report: str
    messages: Annotated[list[AnyMessage], add_messages]


# --------------------------------------------------------------------------
# 에이전트
# --------------------------------------------------------------------------


class FactoryMonitorAgent:
    """텔레메트리를 받아 평가 → 조치 → 보고서까지 수행하는 상태 기반 에이전트."""

    def __init__(
        self,
        model: BaseChatModel,
        checkpointer: Any | None = None,
        tools: list | None = None,
    ) -> None:
        self.model = model
        self.tools = list(tools) if tools is not None else list(TOOLS)
        self.model_with_tools = model.bind_tools(self.tools)

        # 이 에이전트는 await_human 에서 interrupt() 를 쓴다. 체크포인터가 없으면
        # process_telemetry 는 조용히 통과하고 resume_after_human 에서야
        # "RuntimeError: Cannot use Command(resume=...) without checkpointer" 로 터진다.
        # 인간이 기다리는 시점에 실패하는 건 최악이라 생성 시점에 즉시 거부한다.
        # (False 는 LangGraph 에서 '체크포인트 없음'을 뜻하는 유효한 값이므로
        #  `or` 가 아니라 `is None` / falsy 검사를 분리해야 한다.)
        if checkpointer is None:
            checkpointer = MemorySaver()
        elif not checkpointer:
            raise ValueError(
                "FactoryMonitorAgent 는 interrupt()/재개를 위해 체크포인터가 필요하다. "
                f"checkpointer={checkpointer!r} 는 쓸 수 없다 — MemorySaver() 를 넘기거나 "
                "생략해서 기본값을 쓰라."
            )
        self.checkpointer = checkpointer

        # _build_graph 에 명시적으로 넘긴다. 안에서 self.checkpointer 를 읽으면
        # 속성 대입 순서에 의존하게 되고, 순서가 바뀌는 순간
        # AttributeError: '...' object has no attribute 'checkpointer' 로 터진다.
        self.graph = self._build_graph(self.checkpointer)

    # ---- 노드 ----

    def _assess(self, state: FactoryState) -> dict:
        """LLM 으로 severity 평가. actions_taken 에 'assessed' 기록.

        pending_human_review 를 여기서 정한다. await_human 노드 안에서 set 하면
        interrupt() 로 일시정지된 동안에는 아직 반환 전이라 상태에 반영되지 않는다.
        """
        response = self.model.invoke(
            [
                SystemMessage(
                    content=(
                        f"{ASSESS_TAG} You are a factory monitoring agent. "
                        f"Classify the severity as exactly one of: "
                        f"{', '.join(VALID_SEVERITIES)}. Reply with the single word only."
                    )
                ),
                HumanMessage(
                    content=f"machine_id={state['machine_id']} telemetry={state['telemetry']}"
                ),
            ]
        )
        severity = self._parse_severity(response.content)
        return {
            "severity": severity,
            "actions_taken": [f"assessed:severity={severity}"],
            "pending_human_review": severity == "critical",
        }

    @staticmethod
    def _parse_severity(text: Any) -> str:
        """LLM 자유 텍스트에서 severity 를 뽑는다.

        한계: 부분 문자열 검색이므로 "not critical, just high" 같은 문장은
        critical 로 오판한다. 위험한 쪽으로 치우치는 편향이라 의도적으로 남겼지만,
        실전에서는 structured output(with_structured_output)을 쓰는 게 맞다.
        파싱 실패 시 'high' — 조용히 low 로 떨어뜨리지 않는다.
        """
        blob = (text if isinstance(text, str) else str(text)).strip().lower()
        for level in ("critical", "high", "medium", "low"):
            if level in blob:
                return level
        return "high"

    def _auto_resolve(self, state: FactoryState) -> dict:
        """LLM tool-calling 생성. 직전이 ToolMessage 면 그 결과를 actions_taken 에 기록.

        ToolNode 는 messages 만 갱신하고 커스텀 상태 필드는 건드리지 않는다.
        그래서 도구 실행 결과를 actions_taken 에 남기는 일은 이 노드가 맡는다.
        """
        updates: dict[str, Any] = {}
        messages = state["messages"]

        if messages and isinstance(messages[-1], ToolMessage):
            tool_message = messages[-1]
            updates["actions_taken"] = [
                f"tool:{tool_message.name}:{tool_message.content}"
            ]
            new_context: list[AnyMessage] = []
        else:
            new_context = [
                SystemMessage(
                    content=(
                        f"{RESOLVE_TAG} Severity is {state['severity']}. "
                        "Call tools to remediate the issue, "
                        "or reply with plain text when no further action is needed."
                    )
                ),
                HumanMessage(
                    content=f"machine_id={state['machine_id']} telemetry={state['telemetry']}"
                ),
            ]

        response = self.model_with_tools.invoke(list(messages) + new_context)
        updates["messages"] = new_context + [response]
        return updates

    def _await_human(self, state: FactoryState) -> dict:
        """critical 이면 interrupt() 로 중단하고 인간 결정을 기다린다.

        interrupt() 앞에 부작용을 두지 않는다 — 재개 시 노드가 처음부터 재실행되므로
        앞쪽 코드는 매번 다시 돈다 (중복 기록/중복 삽입의 원인).
        """
        decision = interrupt(
            {
                "machine_id": state["machine_id"],
                "telemetry": state["telemetry"],
                "severity": state["severity"],
                "actions_taken": state["actions_taken"],
                "question": "critical severity — approve remediation?",
            }
        )
        return {
            "human_decision": decision,
            "pending_human_review": False,
            "actions_taken": [f"human_decision:{decision}"],
        }

    def _summarize(self, state: FactoryState) -> dict:
        """actions_taken, human_decision 기반으로 LLM 보고서 생성."""
        response = self.model.invoke(
            [
                SystemMessage(
                    content=(
                        f"{REPORT_TAG} Write a concise maintenance report "
                        "covering what was assessed, what actions ran, "
                        "and any human decision."
                    )
                ),
                HumanMessage(
                    content=(
                        f"machine_id={state['machine_id']}\n"
                        f"severity={state['severity']}\n"
                        f"actions_taken={state['actions_taken']}\n"
                        f"human_decision={state.get('human_decision')}"
                    )
                ),
            ]
        )
        content = response.content
        return {"report": content if isinstance(content, str) else str(content)}

    # ---- 라우터 ----

    @staticmethod
    def _route_after_assess(state: FactoryState) -> Literal["await_human", "auto_resolve"]:
        """critical 은 인간 개입으로, 나머지는 자동 조치로."""
        return "await_human" if state["severity"] == "critical" else "auto_resolve"

    @staticmethod
    def _route_after_auto_resolve(state: FactoryState) -> Literal["tools", "summarize"]:
        """tool_calls 가 있으면 도구 실행, 없으면 보고서로. 상한에 걸리면 강제 종료."""
        last = state["messages"][-1]
        rounds = sum(1 for m in state["messages"] if isinstance(m, ToolMessage))
        if getattr(last, "tool_calls", None) and rounds < MAX_TOOL_ROUNDS:
            return "tools"
        return "summarize"

    def _build_graph(self, checkpointer: Any):
        """그래프를 컴파일한다. checkpointer 를 인자로 받아 속성 대입 순서에 의존하지 않는다."""
        return (
            StateGraph(FactoryState)
            .add_node("assess", self._assess)
            .add_node("auto_resolve", self._auto_resolve)
            .add_node("tools", ToolNode(self.tools))
            .add_node("await_human", self._await_human)
            .add_node("summarize", self._summarize)
            .add_edge(START, "assess")
            .add_conditional_edges(
                "assess", self._route_after_assess, ["await_human", "auto_resolve"]
            )
            .add_conditional_edges(
                "auto_resolve", self._route_after_auto_resolve, ["tools", "summarize"]
            )
            .add_edge("tools", "auto_resolve")
            .add_edge("await_human", "summarize")
            .add_edge("summarize", END)
            .compile(checkpointer=checkpointer)
        )

    # ---- 입출력 ----

    def process_telemetry(
        self, machine_id: str, telemetry: dict[str, Any], thread_id: str | None = None
    ) -> dict:
        """텔레메트리를 처리하고 상태를 반환한다.

        critical 이면 await_human 에서 일시정지하고, 반환값에 '__interrupt__' 가 담긴다.
        그때 report 는 아직 비어 있고 pending_human_review 는 True.
        """
        config = {"configurable": {"thread_id": thread_id or machine_id}}
        initial: FactoryState = {
            "machine_id": machine_id,
            "telemetry": telemetry,
            "severity": "",
            "actions_taken": [],
            "pending_human_review": False,
            "human_decision": None,
            "report": "",
            "messages": [],
        }
        return self.graph.invoke(initial, config)

    def resume_after_human(self, thread_id: str, human_decision: Any) -> dict:
        """인간 결정을 받아 재개한다. Command(resume=...) 가 interrupt() 의 반환값이 된다."""
        config = {"configurable": {"thread_id": thread_id}}
        return self.graph.invoke(Command(resume=human_decision), config)


def build_agent(
    model: BaseChatModel, checkpointer: Any | None = None, tools: list | None = None
) -> FactoryMonitorAgent:
    """에이전트 팩토리. 모델을 주입받으므로 실제 LLM / 결정적 Fake 를 갈아끼울 수 있다."""
    return FactoryMonitorAgent(model, checkpointer=checkpointer, tools=tools)


# --------------------------------------------------------------------------
# 검증용 결정적 모델
# --------------------------------------------------------------------------


class ScriptedChatModel(BaseChatModel):
    """실제 BaseChatModel 계약을 만족하는 결정적 모델.

    프롬프트의 stage 태그를 보고 응답을 고른다. API 키 없이 오프라인·재현 가능.
    bind_tools 를 반드시 오버라이드해야 한다 — BaseChatModel 기본 구현은
    NotImplementedError 를 던진다 (실측 확인).
    """

    severity: str = "low"
    resolve_script: list = []
    report_text: str = "report"
    calls: list = []

    def _generate(self, messages, stop=None, run_manager=None, **kwargs) -> ChatResult:
        blob = " ".join(str(getattr(m, "content", "")) for m in messages)
        if ASSESS_TAG in blob:
            self.calls.append("assess")
            message = AIMessage(content=self.severity)
        elif REPORT_TAG in blob:
            self.calls.append("summarize")
            message = AIMessage(content=self.report_text)
        else:
            done = sum(1 for c in self.calls if c == "resolve")
            self.calls.append("resolve")
            if self.resolve_script:
                message = self.resolve_script[min(done, len(self.resolve_script) - 1)]
            else:
                message = AIMessage(content="no action needed")
        return ChatResult(generations=[ChatGeneration(message=message)])

    def bind_tools(self, tools, **kwargs):
        """스크립트 응답이라 tools 는 기록만 한다. 실제 모델은 프로바이더로 스키마를 보낸다."""
        return self.bind(tools=list(tools), **kwargs)

    @property
    def _llm_type(self) -> str:
        return "scripted-factory-model"


# 실제 LLM 을 쓸 때는 이렇게 갈아끼운다 (API 키 필요, 검증에서는 실행하지 않음):
#
#     from langchain_anthropic import ChatAnthropic
#     agent = build_agent(ChatAnthropic(model="claude-sonnet-4-5"))
#
# 그래프 구조는 그대로다. ScriptedChatModel 이 BaseChatModel 계약을 실제로
# 만족하므로(.bind_tools(tools).invoke(messages)) 교체가 성립한다.


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _model(severity: str, resolve_script: list | None = None, report: str = "REPORT"):
    return ScriptedChatModel(
        severity=severity,
        resolve_script=resolve_script or [AIMessage(content="no action needed")],
        report_text=report,
        calls=[],
    )


def _check() -> None:
    # ---- 1) low: 도구 호출 없이 assess → auto_resolve → summarize ----
    model = _model("low", [AIMessage(content="all nominal")], "LOW REPORT")
    agent = build_agent(model)
    out = agent.process_telemetry("M-LOW", {"temp": 41.0})
    expect(out["severity"], "low", "low severity")
    expect(out["actions_taken"], ["assessed:severity=low"], "low actions_taken")
    expect(out["report"], "LOW REPORT", "low report")
    expect(out["pending_human_review"], False, "low 은 인간 개입 없음")
    expect("__interrupt__" in out, False, "low 은 중단 없음")
    expect(model.calls, ["assess", "resolve", "summarize"], "low 모델 호출 순서")

    # ---- 2) medium: 도구 1회 실행 후 종료 ----
    model = _model(
        "medium",
        [
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "schedule_maintenance",
                        "args": {"machine_id": "M-MED", "urgency": "medium"},
                        "id": "call-1",
                    }
                ],
            ),
            AIMessage(content="scheduled, nothing else"),
        ],
        "MED REPORT",
    )
    agent = build_agent(model)
    out = agent.process_telemetry("M-MED", {"temp": 78.0, "vibration": 4.2})
    expect(
        out["actions_taken"],
        [
            "assessed:severity=medium",
            "tool:schedule_maintenance:maintenance scheduled for M-MED (urgency=medium)",
        ],
        "medium actions_taken (도구 결과 기록)",
    )
    expect(model.calls, ["assess", "resolve", "resolve", "summarize"], "medium 호출 순서")
    # ToolNode 가 실제로 ToolMessage 를 붙였는지
    kinds = [type(m).__name__ for m in out["messages"]]
    expect(kinds.count("ToolMessage"), 1, "ToolMessage 1개")
    expect("HumanMessage" in kinds and "AIMessage" in kinds, True, "메시지 종류")

    # ---- 3) high: 도구 2회 연속 (루프가 실제로 도는지) ----
    model = _model(
        "high",
        [
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "reorder_parts",
                        "args": {"part_name": "bearing", "quantity": 3},
                        "id": "call-1",
                    }
                ],
            ),
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "log_incident",
                        "args": {"machine_id": "M-HI", "description": "bearing wear"},
                        "id": "call-2",
                    }
                ],
            ),
            AIMessage(content="remediation complete"),
        ],
        "HIGH REPORT",
    )
    agent = build_agent(model)
    out = agent.process_telemetry("M-HI", {"vibration": 9.1, "parts": {"bearing": 1}})
    expect(
        out["actions_taken"],
        [
            "assessed:severity=high",
            "tool:reorder_parts:reordered 3x bearing",
            "tool:log_incident:incident logged for M-HI: bearing wear",
        ],
        "high actions_taken (도구 2회 누적 — 리듀서 검증)",
    )
    expect(
        sum(1 for m in out["messages"] if isinstance(m, ToolMessage)),
        2,
        "ToolMessage 2개",
    )

    # ---- 4) critical: interrupt() 로 중단 → 재개 ----
    model = _model("critical", [AIMessage(content="unused")], "CRIT REPORT")
    agent = build_agent(model)
    paused = agent.process_telemetry("M-CRIT", {"temp": 250.0}, thread_id="t-crit")
    expect(paused["severity"], "critical", "critical severity")
    expect(paused["pending_human_review"], True, "중단 중에는 pending_human_review=True")
    expect(paused["report"], "", "중단 중에는 report 없음")
    expect("__interrupt__" in paused, True, "__interrupt__ 존재")
    payload = paused["__interrupt__"][0].value
    expect(payload["machine_id"], "M-CRIT", "interrupt 페이로드 machine_id")
    expect(payload["severity"], "critical", "interrupt 페이로드 severity")
    expect(
        payload["question"],
        "critical severity — approve remediation?",
        "interrupt 질문",
    )
    # critical 은 auto_resolve 를 건너뛴다
    expect("resolve" not in model.calls, True, "critical 은 auto_resolve 미실행")

    decision = {"approved": True, "note": "shutdown line 3"}
    resumed = agent.resume_after_human("t-crit", decision)
    expect(resumed["human_decision"], decision, "human_decision 반영")
    expect(resumed["pending_human_review"], False, "재개 후 pending 해제")
    expect(resumed["report"], "CRIT REPORT", "재개 후 report 생성")
    expect(
        resumed["actions_taken"],
        ["assessed:severity=critical", f"human_decision:{decision}"],
        "critical actions_taken",
    )
    # assess 가 재실행되어 중복 기록되지 않았는지 (interrupt 재개 시 노드 재실행 함정)
    expect(
        sum(1 for a in resumed["actions_taken"] if a.startswith("assessed:")),
        1,
        "assessed 기록은 1개 (재개 시 중복 없음)",
    )

    # ---- 5) severity 파싱 — LLM 이 지저분하게 답할 때 ----
    for raw, want in [
        ("critical", "critical"),
        ("  HIGH  ", "high"),
        ("Severity: medium", "medium"),
        ("I think this is LOW risk", "low"),
        ("CRITICAL - shut down now", "critical"),
        ("banana", "high"),  # 파싱 실패 → 안전한 쪽
    ]:
        agent = build_agent(_model(raw))
        got = agent.process_telemetry("M", {"t": 1}, thread_id=f"t-parse-{raw}")[
            "severity"
        ]
        expect(got, want, f"severity 파싱 {raw!r}")

    # ---- 6) 안전장치: 모델이 무한히 도구를 호출해도 멈춘다 ----
    class LoopModel(ScriptedChatModel):
        """항상 tool_calls 를 반환하는 모델. MAX_TOOL_ROUNDS 가드 검증용."""

        def _generate(self, messages, stop=None, run_manager=None, **kwargs):
            blob = " ".join(str(getattr(m, "content", "")) for m in messages)
            if ASSESS_TAG in blob:
                return ChatResult(
                    generations=[ChatGeneration(message=AIMessage(content="high"))]
                )
            if REPORT_TAG in blob:
                return ChatResult(
                    generations=[
                        ChatGeneration(message=AIMessage(content="FORCED REPORT"))
                    ]
                )
            self.calls.append("resolve")
            n = len([c for c in self.calls if c == "resolve"])
            return ChatResult(
                generations=[
                    ChatGeneration(
                        message=AIMessage(
                            content="",
                            tool_calls=[
                                {
                                    "name": "log_incident",
                                    "args": {
                                        "machine_id": "M-LOOP",
                                        "description": f"round{n}",
                                    },
                                    "id": f"call-{n}",
                                }
                            ],
                        )
                    )
                ]
            )

    agent = build_agent(LoopModel(calls=[]))
    out = agent.process_telemetry("M-LOOP", {"t": 1})
    expect(
        sum(1 for m in out["messages"] if isinstance(m, ToolMessage)),
        MAX_TOOL_ROUNDS,
        f"도구 실행이 {MAX_TOOL_ROUNDS}회에서 멈춤",
    )
    expect(out["report"], "FORCED REPORT", "상한 도달 후에도 보고서 생성")

    # ---- 7) 스레드 격리 + 부분 재개 ----
    agent = build_agent(_model("critical", [AIMessage(content="unused")], "R"))
    agent.process_telemetry("M-A", {"t": 1}, thread_id="tA")
    agent.process_telemetry("M-B", {"t": 2}, thread_id="tB")
    agent.resume_after_human("tA", "ackA")
    state_a = agent.graph.get_state({"configurable": {"thread_id": "tA"}})
    state_b = agent.graph.get_state({"configurable": {"thread_id": "tB"}})
    expect(state_a.values["machine_id"], "M-A", "tA machine_id")
    expect(state_b.values["machine_id"], "M-B", "tB machine_id")
    expect(state_a.values["report"], "R", "tA 는 완료")
    expect(state_b.values["report"], "", "tB 는 아직 대기")
    expect(state_b.values["pending_human_review"], True, "tB 는 여전히 pending")

    # ---- 8) 체크포인트 이력 (중단/재개가 실제로 기록되는지) ----
    history = list(agent.graph.get_state_history({"configurable": {"thread_id": "tA"}}))
    nexts = [h.next for h in reversed(history)]
    expect(("await_human",) in nexts, True, f"await_human 체크포인트 존재 {nexts}")
    expect(("summarize",) in nexts, True, "summarize 체크포인트 존재")
    expect(nexts[-1], (), "마지막 체크포인트는 종료 상태")

    # ---- 9) interrupt 페이로드는 JSON 직렬화 가능해야 한다 ----
    import json

    agent = build_agent(_model("critical", [AIMessage(content="x")], "R"))
    nested = {
        "temp": 210.5,
        "vibration": [1.2, 3.4],
        "parts": {"bearing": "worn", "belt": "ok"},
    }
    paused = agent.process_telemetry("M-NEST", nested, thread_id="t-nest")
    json.dumps(paused["__interrupt__"][0].value)  # 실패하면 예외
    expect(
        paused["__interrupt__"][0].value["telemetry"], nested, "중첩 telemetry 보존"
    )

    # ---- 10) 잘못된 도구명 — ToolNode 가 에러를 ToolMessage 로 돌려준다 ----
    model = _model(
        "high",
        [
            AIMessage(
                content="",
                tool_calls=[{"name": "no_such_tool", "args": {}, "id": "bad-1"}],
            ),
            AIMessage(content="recovered without tools"),
        ],
        "RECOVERED",
    )
    agent = build_agent(model)
    out = agent.process_telemetry("M-BAD", {"t": 1})
    tool_messages = [m for m in out["messages"] if isinstance(m, ToolMessage)]
    expect(len(tool_messages), 1, "에러도 ToolMessage 로 돌아온다")
    expect("Error" in tool_messages[0].content, True, "에러 메시지 포함")
    expect(out["report"], "RECOVERED", "에러 후에도 보고서까지 도달")

    # ---- 11) checkpointer 계약 ----
    #  (a) 생략하면 MemorySaver 가 붙고 self.checkpointer 로 접근 가능하다.
    agent = build_agent(_model("low"))
    expect(hasattr(agent, "checkpointer"), True, "checkpointer 속성 존재")
    expect(agent.checkpointer is not None, True, "checkpointer 기본값 생성")
    #  컴파일된 그래프에도 같은 인스턴스가 실린다.
    expect(agent.graph.checkpointer is agent.checkpointer, True, "그래프에 동일 인스턴스")

    #  (b) 명시적으로 넘기면 그걸 쓴다.
    saver = MemorySaver()
    agent = build_agent(_model("low"), checkpointer=saver)
    expect(agent.checkpointer is saver, True, "주입한 checkpointer 사용")

    #  (c) falsy 체크포인터는 생성 시점에 거부한다.
    #      허용하면 process_telemetry 는 통과하고 resume_after_human 에서
    #      "RuntimeError: Cannot use Command(resume=...) without checkpointer" 가 난다.
    #      즉 인간이 기다리는 시점에 실패한다.
    for bad in (False, 0):
        try:
            build_agent(_model("critical"), checkpointer=bad)
        except ValueError as exc:
            expect("체크포인터가 필요하다" in str(exc), True, f"{bad!r} 거부 메시지")
        else:
            raise AssertionError(f"[checkpointer={bad!r}] 거부되지 않았다")

    #  (d) _build_graph 는 checkpointer 를 인자로 받는다 — 속성 대입 순서에 의존하지 않는다.
    #      self.checkpointer 를 안에서 읽으면 순서가 바뀌는 순간
    #      AttributeError: '...' object has no attribute 'checkpointer' 로 터진다.
    import inspect

    params = list(inspect.signature(FactoryMonitorAgent._build_graph).parameters)
    expect(params, ["self", "checkpointer"], "_build_graph 시그니처")

    #      실제로 순서를 뒤바꿔도 생성되는지 확인한다.
    class ReorderedAgent(FactoryMonitorAgent):
        """graph 를 먼저 만들고 checkpointer 를 나중에 대입하는 서브클래스."""

        def __init__(self, model, checkpointer=None, tools=None):
            self.model = model
            self.tools = list(tools) if tools is not None else list(TOOLS)
            self.model_with_tools = model.bind_tools(self.tools)
            saver = checkpointer if checkpointer is not None else MemorySaver()
            self.graph = self._build_graph(saver)  # checkpointer 대입 전에 호출
            self.checkpointer = saver

    reordered = ReorderedAgent(_model("low", [AIMessage(content="ok")], "REORDERED"))
    expect(
        reordered.process_telemetry("M-ORD", {"t": 1})["report"],
        "REORDERED",
        "속성 순서 뒤바뀌어도 동작",
    )


if __name__ == "__main__":
    _check()
    print("OK")
