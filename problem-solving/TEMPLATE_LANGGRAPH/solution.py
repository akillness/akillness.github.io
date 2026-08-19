#!/usr/bin/env python3
"""NNNN. 문제 제목 (LangGraph)

풀이 요약: (그래프 구조 한 줄로)
검증 환경: langgraph 1.2.11 / langchain-core 1.5.4 / Python 3.14.6

단독 실행하면 검증 케이스가 모두 돌고 성공 시 OK를 출력한다.
    ../../.venv/bin/python solution.py
"""

from __future__ import annotations

import operator
from typing import Annotated, Literal

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class State(TypedDict):
    """그래프 공유 상태.

    리듀서 없는 필드는 덮어쓰기. 누적이 필요한 필드는 Annotated[..., operator.add].
    """

    query: str
    steps: Annotated[list[str], operator.add]  # 누적 — 리듀서 필수
    result: str


def node_a(state: State) -> dict:
    """전체 state 가 아니라 '바뀐 부분만' 담은 dict 를 반환한다."""
    return {"steps": ["node_a"], "result": state["query"]}


def route(state: State) -> Literal["node_b", "__end__"]:
    """조건 분기. 반환값은 실제 존재하는 노드 이름이어야 한다."""
    return "node_b" if state["result"] else END


def node_b(state: State) -> dict:
    return {"steps": ["node_b"], "result": state["result"].upper()}


def build_graph():
    """컴파일된 그래프를 반환한다. compile() 하지 않으면 invoke 할 수 없다."""
    return (
        StateGraph(State)
        .add_node("node_a", node_a)
        .add_node("node_b", node_b)
        .add_edge(START, "node_a")
        .add_conditional_edges("node_a", route, ["node_b", END])
        .add_edge("node_b", END)
        .compile()
    )


def solution(query: str) -> dict:
    """그래프를 실행하고 최종 상태를 반환한다."""
    return build_graph().invoke({"query": query, "steps": [], "result": ""})


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _check() -> None:
    # 1) 정상 경로 — END 까지 도달
    # out = solution("hello")
    # expect(out["result"], "HELLO", "정상 경로")

    # 2) 분기 경로 — 각 조건이 최소 1회 실행되는지
    # expect(solution("")["steps"], ["node_a"], "빈 입력은 조기 종료")

    # 3) 리듀서 — 누적 필드가 덮어써지지 않는지
    # expect(solution("x")["steps"], ["node_a", "node_b"], "steps 누적")

    # 4) 루프 상한 — 무한 루프 가드 동작 (루프가 있다면)

    raise NotImplementedError("검증 케이스를 채우세요")


if __name__ == "__main__":
    _check()
    print("OK")
