#!/usr/bin/env python3
"""0004 샘플 실행 — 실제 텔레메트리를 넣어 노드별 흐름을 눈으로 확인한다.

검증(_check)이 아니라 **시연**이다. stream(stream_mode="updates") 으로
어떤 노드가 어떤 순서로 무엇을 갱신하는지 출력한다.

실행:
    ../../.venv/bin/python sample_run.py
"""

from __future__ import annotations

from langchain_core.messages import AIMessage, ToolMessage

from solution import ASSESS_TAG, REPORT_TAG, ScriptedChatModel, build_agent

BAR = "─" * 78


def show_state(state: dict, *, title: str) -> None:
    print(f"  {title}")
    print(f"    severity            : {state.get('severity')!r}")
    print(f"    pending_human_review: {state.get('pending_human_review')}")
    print(f"    human_decision      : {state.get('human_decision')!r}")
    print(f"    actions_taken       :")
    for action in state.get("actions_taken", []):
        print(f"        - {action}")
    report = state.get("report") or ""
    print(f"    report              : {report!r}" if len(report) < 60 else f"    report              :\n        {report}")


def trace(agent, machine_id: str, telemetry: dict, thread_id: str) -> dict:
    """stream 으로 노드별 갱신을 출력하고 최종 상태를 반환한다."""
    config = {"configurable": {"thread_id": thread_id}}
    initial = {
        "machine_id": machine_id,
        "telemetry": telemetry,
        "severity": "",
        "actions_taken": [],
        "pending_human_review": False,
        "human_decision": None,
        "report": "",
        "messages": [],
    }
    print(f"  텔레메트리: {telemetry}")
    print("  노드 실행 순서:")
    step = 0
    for chunk in agent.graph.stream(initial, config, stream_mode="updates"):
        for node, update in chunk.items():
            step += 1
            if node == "__interrupt__":
                payload = update[0].value if update else {}
                print(f"    {step}. ⏸  __interrupt__  질문={payload.get('question')!r}")
                continue
            bits = []
            if "severity" in update:
                bits.append(f"severity={update['severity']!r}")
            if "actions_taken" in update:
                bits.append(f"+actions={update['actions_taken']}")
            if "messages" in update:
                for message in update["messages"]:
                    kind = type(message).__name__
                    if isinstance(message, AIMessage) and message.tool_calls:
                        names = [tc["name"] for tc in message.tool_calls]
                        bits.append(f"{kind}(tool_calls={names})")
                    elif isinstance(message, ToolMessage):
                        bits.append(f"{kind}({message.name}→{message.content!r})")
                    elif kind != "SystemMessage" and getattr(message, "content", ""):
                        bits.append(f"{kind}({str(message.content)[:34]!r})")
            if "report" in update:
                bits.append("report 생성")
            if "pending_human_review" in update:
                bits.append(f"pending={update['pending_human_review']}")
            print(f"    {step}. {node:<13} {'  '.join(bits)}")
    return agent.graph.get_state(config).values


def resume(agent, thread_id: str, decision) -> dict:
    print(f"  인간 결정 투입: {decision!r}")
    print("  노드 실행 순서 (재개):")
    from langgraph.types import Command

    config = {"configurable": {"thread_id": thread_id}}
    step = 0
    for chunk in agent.graph.stream(Command(resume=decision), config, stream_mode="updates"):
        for node, update in chunk.items():
            step += 1
            bits = []
            if isinstance(update, dict):
                if "actions_taken" in update:
                    bits.append(f"+actions={update['actions_taken']}")
                if "pending_human_review" in update:
                    bits.append(f"pending={update['pending_human_review']}")
                if "report" in update:
                    bits.append("report 생성")
            print(f"    {step}. {node:<13} {'  '.join(bits)}")
    return agent.graph.get_state(config).values


# ==========================================================================
# 샘플 1 — 정상 가동 (low): 도구 호출 없음
# ==========================================================================
print(BAR)
print("샘플 1 · 정상 가동  (severity=low → 도구 없이 종료)")
print(BAR)

model = ScriptedChatModel(
    severity="low",
    resolve_script=[AIMessage(content="All readings within nominal range. No action required.")],
    report_text="M-101: 온도 41.2°C, 진동 0.8mm/s 모두 정상 범위. 조치 없음.",
    calls=[],
)
agent = build_agent(model)
final = trace(agent, "M-101", {"temp_c": 41.2, "vibration_mm_s": 0.8, "parts": {"bearing": 12}}, "s1")
show_state(final, title="최종 상태")
print(f"  LLM 호출: {model.calls}")


# ==========================================================================
# 샘플 2 — 부품 재고 부족 (medium): 도구 1회
# ==========================================================================
print()
print(BAR)
print("샘플 2 · 부품 재고 부족  (severity=medium → reorder_parts 1회)")
print(BAR)

model = ScriptedChatModel(
    severity="medium",
    resolve_script=[
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "reorder_parts",
                    "args": {"part_name": "bearing", "quantity": 20},
                    "id": "call-reorder-1",
                }
            ],
        ),
        AIMessage(content="Parts reordered. No further action needed."),
    ],
    report_text="M-202: 베어링 재고 2개로 임계 이하. 20개 발주 완료. 온도/진동 정상.",
    calls=[],
)
agent = build_agent(model)
final = trace(agent, "M-202", {"temp_c": 62.0, "vibration_mm_s": 2.1, "parts": {"bearing": 2}}, "s2")
show_state(final, title="최종 상태")
print(f"  LLM 호출: {model.calls}")


# ==========================================================================
# 샘플 3 — 진동 이상 (high): 도구 2회 연속
# ==========================================================================
print()
print(BAR)
print("샘플 3 · 진동 이상  (severity=high → schedule_maintenance + log_incident)")
print(BAR)

model = ScriptedChatModel(
    severity="high",
    resolve_script=[
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "schedule_maintenance",
                    "args": {"machine_id": "M-303", "urgency": "high"},
                    "id": "call-sched-1",
                }
            ],
        ),
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "log_incident",
                    "args": {
                        "machine_id": "M-303",
                        "description": "vibration 9.4mm/s exceeds 6.0 threshold",
                    },
                    "id": "call-log-1",
                }
            ],
        ),
        AIMessage(content="Maintenance scheduled and incident logged. Done."),
    ],
    report_text=(
        "M-303: 진동 9.4mm/s (임계 6.0 초과). 긴급 정비 예약 + 사고 기록 완료.\n"
        "        온도 88°C 는 경계선. 정비 시 함께 점검 권장."
    ),
    calls=[],
)
agent = build_agent(model)
final = trace(agent, "M-303", {"temp_c": 88.0, "vibration_mm_s": 9.4, "parts": {"bearing": 8}}, "s3")
show_state(final, title="최종 상태")
print(f"  LLM 호출: {model.calls}")


# ==========================================================================
# 샘플 4 — 과열 (critical): interrupt → 인간 승인 → 재개
# ==========================================================================
print()
print(BAR)
print("샘플 4 · 과열  (severity=critical → interrupt() 중단 → 인간 결정 → 재개)")
print(BAR)

model = ScriptedChatModel(
    severity="critical",
    resolve_script=[AIMessage(content="(critical 경로에서는 호출되지 않음)")],
    report_text=(
        "M-404: 온도 247°C 로 임계 초과, 즉시 인간 검토 요청됨.\n"
        "        운영자 승인 하에 라인 정지 및 긴급 정비 배정."
    ),
    calls=[],
)
agent = build_agent(model)
paused = trace(agent, "M-404", {"temp_c": 247.0, "vibration_mm_s": 11.2, "parts": {"coolant": 0}}, "s4")
show_state(paused, title="중단 시점 상태")

snapshot = agent.graph.get_state({"configurable": {"thread_id": "s4"}})
print(f"  다음 실행 예정 노드: {snapshot.next}")
print("  interrupt 페이로드:")
for key, value in snapshot.tasks[0].interrupts[0].value.items():
    print(f"      {key}: {value!r}")

print()
final = resume(agent, "s4", {"approved": True, "operator": "kim", "note": "라인 3 정지 후 냉각계 교체"})
show_state(final, title="재개 후 최종 상태")
print(f"  LLM 호출: {model.calls}  ← auto_resolve 없음 (critical 은 건너뜀)")


# ==========================================================================
# 샘플 5 — 스레드 격리: 두 기계 동시 대기, 하나만 재개
# ==========================================================================
print()
print(BAR)
print("샘플 5 · 스레드 격리  (두 기계가 각각 중단, 하나만 재개)")
print(BAR)

model = ScriptedChatModel(
    severity="critical",
    resolve_script=[AIMessage(content="unused")],
    report_text="처리 완료",
    calls=[],
)
agent = build_agent(model)
agent.process_telemetry("M-501", {"temp_c": 260.0}, thread_id="line-A")
agent.process_telemetry("M-502", {"temp_c": 255.0}, thread_id="line-B")
print("  두 기계 모두 중단됨. line-A 만 재개한다.")
agent.resume_after_human("line-A", "approved")

for thread in ("line-A", "line-B"):
    values = agent.graph.get_state({"configurable": {"thread_id": thread}}).values
    state_label = "완료" if values["report"] else "대기 중"
    print(
        f"    {thread}: machine={values['machine_id']}  "
        f"pending={values['pending_human_review']}  → {state_label}"
    )

print()
print(BAR)
print("샘플 실행 완료 — 5개 시나리오 전부 정상")
print(BAR)
