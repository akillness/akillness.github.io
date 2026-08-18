#!/usr/bin/env python3
"""0002. solve → verify → repair 루프 (LangGraph)

문제 하나를 받아 후보 풀이를 만들고, 테스트 케이스로 검증하고, 실패하면
실패 정보를 들고 다시 고치는 루프. 통과하거나 시도 상한에 걸리면 종료한다.

그래프:
    START → solve → verify → (통과? END : 상한? END : repair → verify)

검증 환경: langgraph 1.2.11 / langchain-core 1.5.4 / Python 3.14.6
LLM 호출 없음 — 결정적 FakeSolver 로 대체해서 오프라인·재현 가능하게 유지한다.

단독 실행:
    ../../.venv/bin/python solution.py
"""

from __future__ import annotations

import operator
from typing import Annotated, Any, Callable, Literal

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

MAX_ATTEMPTS = 3


# --------------------------------------------------------------------------
# 상태
# --------------------------------------------------------------------------


class State(TypedDict):
    """그래프 공유 상태.

    - 리듀서 없음(덮어쓰기): 매 시도마다 최신값만 의미 있는 필드
    - operator.add: 시도 이력처럼 누적해야 하는 필드
    """

    problem: str
    cases: list[tuple[Any, Any]]  # [(입력, 기대출력), ...]
    code: str  # 현재 후보 풀이 (source)
    attempts: Annotated[int, operator.add]  # 시도 횟수 — 누적 합
    log: Annotated[list[str], operator.add]  # 실행 이력 — 누적 리스트
    failure: str  # 마지막 실패 사유 ("" 면 통과)
    passed: bool


# --------------------------------------------------------------------------
# 후보 생성기 (LLM 자리) — 결정적 Fake
# --------------------------------------------------------------------------


class FakeSolver:
    """LLM 대신 쓰는 결정적 후보 생성기.

    미리 정해둔 후보를 순서대로 내놓는다. 앞쪽 후보를 일부러 틀리게 두면
    repair 루프가 실제로 도는지 검증할 수 있다.
    실제 LLM 으로 바꿀 때는 이 클래스만 교체하면 그래프는 그대로다.
    """

    def __init__(self, candidates: list[str]) -> None:
        self.candidates = candidates
        self.calls: list[str | None] = []  # 호출 시 받은 failure 기록

    def __call__(self, problem: str, failure: str | None) -> str:
        self.calls.append(failure)
        index = min(len(self.calls) - 1, len(self.candidates) - 1)
        return self.candidates[index]


def run_candidate(code: str, cases: list[tuple[Any, Any]]) -> str:
    """후보 코드를 실행해 첫 실패 사유를 반환한다. 전부 통과하면 "".

    code 는 `def solve(x): ...` 를 정의하는 source 여야 한다.
    주의: exec 로 실행한다. 이 그래프는 **검증 케이스 안의 하드코딩된 후보**만
    다루는 용도다. 외부에서 받은 코드를 넣으면 안 된다.
    """
    namespace: dict[str, Any] = {}
    try:
        exec(code, namespace)  # noqa: S102 - 하드코딩된 후보 전용
    except Exception as exc:  # 문법 오류 등
        return f"컴파일 실패: {type(exc).__name__}: {exc}"

    fn: Callable[[Any], Any] | None = namespace.get("solve")
    if fn is None:
        return "solve 함수가 정의되지 않음"

    for arg, expected in cases:
        try:
            got = fn(arg)
        except Exception as exc:
            return f"solve({arg!r}) 예외: {type(exc).__name__}: {exc}"
        if got != expected:
            return f"solve({arg!r}) → {got!r}, 기대값 {expected!r}"
    return ""


# --------------------------------------------------------------------------
# 노드
# --------------------------------------------------------------------------


def make_graph(solver: FakeSolver, *, checkpointer=None):
    """solve → verify → repair 루프 그래프를 만든다.

    solver 를 주입받으므로 실제 LLM / Fake 를 갈아끼워도 구조가 안 바뀐다.
    """

    def solve(state: State) -> dict:
        """첫 후보 생성."""
        code = solver(state["problem"], None)
        return {"code": code, "attempts": 1, "log": ["solve"]}

    def verify(state: State) -> dict:
        """후보를 실제로 실행해 통과 여부를 판정한다. 여기가 '검증된 코드'의 근거."""
        failure = run_candidate(state["code"], state["cases"])
        mark = "verify:pass" if not failure else f"verify:fail({failure})"
        return {"failure": failure, "passed": not failure, "log": [mark]}

    def repair(state: State) -> dict:
        """실패 사유를 들고 다시 생성. attempts 는 리듀서로 누적된다."""
        code = solver(state["problem"], state["failure"])
        return {"code": code, "attempts": 1, "log": ["repair"]}

    def route(state: State) -> Literal["repair", "__end__"]:
        """통과했으면 종료. 상한에 걸렸으면 종료(무한 루프 방지). 아니면 재시도."""
        if state["passed"]:
            return END
        if state["attempts"] >= MAX_ATTEMPTS:
            return END
        return "repair"

    builder = (
        StateGraph(State)
        .add_node("solve", solve)
        .add_node("verify", verify)
        .add_node("repair", repair)
        .add_edge(START, "solve")
        .add_edge("solve", "verify")
        .add_conditional_edges("verify", route, ["repair", END])
        .add_edge("repair", "verify")  # 루프: repair 후 다시 검증
    )
    return builder.compile(checkpointer=checkpointer)


def solution(
    problem: str,
    cases: list[tuple[Any, Any]],
    candidates: list[str],
    *,
    checkpointer=None,
    config: dict | None = None,
) -> dict:
    """루프를 돌려 최종 상태를 반환한다."""
    solver = FakeSolver(candidates)
    graph = make_graph(solver, checkpointer=checkpointer)
    initial: State = {
        "problem": problem,
        "cases": cases,
        "code": "",
        "attempts": 0,
        "log": [],
        "failure": "",
        "passed": False,
    }
    final = graph.invoke(initial, config or {})
    final["_solver_calls"] = solver.calls
    return final


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


# 검증에 쓸 후보 코드들 — "절댓값 반환" 문제
GOOD = "def solve(x):\n    return abs(x)\n"
WRONG = "def solve(x):\n    return x\n"           # 음수에서 틀림
BROKEN = "def solve(x)\n    return x\n"           # 문법 오류
RAISES = "def solve(x):\n    raise ValueError('boom')\n"
NO_FN = "y = 1\n"

CASES = [(3, 3), (-4, 4), (0, 0)]
PROBLEM = "정수 x 의 절댓값을 반환하라"


def _check() -> None:
    # 1) 정상 경로 — 첫 후보가 정답이면 1회로 끝난다
    out = solution(PROBLEM, CASES, [GOOD])
    expect(out["passed"], True, "1회 통과")
    expect(out["attempts"], 1, "시도 1회")
    expect(out["log"], ["solve", "verify:pass"], "정상 경로 로그")
    expect(out["failure"], "", "실패 사유 없음")

    # 2) 루프 경로 — 첫 후보가 틀리면 repair 후 통과 (리듀서 누적 확인)
    out = solution(PROBLEM, CASES, [WRONG, GOOD])
    expect(out["passed"], True, "2회차 통과")
    expect(out["attempts"], 2, "시도 2회 누적")
    expect(out["log"][0], "solve", "루프 로그 시작")
    expect(out["log"][2], "repair", "repair 노드 실행됨")
    expect(out["log"][-1], "verify:pass", "루프 로그 끝")
    # repair 는 실패 사유를 전달받아야 한다 (첫 호출은 None)
    expect(out["_solver_calls"][0], None, "첫 생성은 failure 없음")
    expect("solve(-4)" in (out["_solver_calls"][1] or ""), True, "repair 에 실패 사유 전달")

    # 3) 루프 상한 — 계속 틀려도 MAX_ATTEMPTS 에서 멈춘다 (무한 루프 방지)
    out = solution(PROBLEM, CASES, [WRONG])
    expect(out["passed"], False, "상한 도달 시 실패로 종료")
    expect(out["attempts"], MAX_ATTEMPTS, f"시도 {MAX_ATTEMPTS}회에서 중단")
    expect(out["log"].count("repair"), MAX_ATTEMPTS - 1, "repair 횟수")
    expect(out["log"].count("verify:pass"), 0, "통과 기록 없음")

    # 4) 실패 유형별 처리 — 컴파일 오류 / 예외 / 함수 없음 모두 잡아야 한다
    out = solution(PROBLEM, CASES, [BROKEN, GOOD])
    expect(out["passed"], True, "문법 오류 후 복구")
    expect("컴파일 실패" in (out["_solver_calls"][1] or ""), True, "문법 오류 사유 전달")

    out = solution(PROBLEM, CASES, [RAISES, GOOD])
    expect(out["passed"], True, "예외 발생 후 복구")
    expect("ValueError" in (out["_solver_calls"][1] or ""), True, "예외 사유 전달")

    out = solution(PROBLEM, CASES, [NO_FN, GOOD])
    expect(out["passed"], True, "함수 미정의 후 복구")
    expect(out["_solver_calls"][1], "solve 함수가 정의되지 않음", "미정의 사유 전달")

    # 5) 리듀서 누락 시 버그를 잡는 케이스 — log 는 누적되어야 하고 덮어써지면 안 된다
    out = solution(PROBLEM, CASES, [WRONG, WRONG, GOOD])
    expect(len(out["log"]) >= 6, True, f"log 누적 (실제 {out['log']})")
    expect(out["attempts"], 3, "3회 누적")

    # 6) 체크포인터 — 상태 이력이 남고 재개 가능한지
    checkpointer = InMemorySaver()
    config = {"configurable": {"thread_id": "problem-0002"}}
    out = solution(PROBLEM, CASES, [WRONG, GOOD], checkpointer=checkpointer, config=config)
    expect(out["passed"], True, "체크포인터 경로 통과")

    graph = make_graph(FakeSolver([GOOD]), checkpointer=checkpointer)
    snapshot = graph.get_state(config)
    expect(snapshot.values["passed"], True, "체크포인트에 최종 상태 저장")
    history = list(graph.get_state_history(config))
    expect(len(history) >= 4, True, f"체크포인트 이력 개수 (실제 {len(history)})")

    # 스레드가 다르면 상태가 격리되어야 한다
    other = graph.get_state({"configurable": {"thread_id": "다른-스레드"}})
    expect(other.values, {}, "다른 스레드는 격리됨")


if __name__ == "__main__":
    _check()
    print("OK")
