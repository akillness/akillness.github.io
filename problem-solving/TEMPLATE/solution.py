#!/usr/bin/env python3
"""NNNN. 문제 제목

풀이 요약: (한 줄로 접근 방법)
복잡도: 시간 O(?) / 공간 O(?)

단독 실행하면 검증 케이스가 모두 돌고 성공 시 OK를 출력한다.
    python3 solution.py
"""

from __future__ import annotations


def solution(data):
    """문제의 정답을 반환한다."""
    raise NotImplementedError


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _check() -> None:
    # 1) 기본 예제 — 문제 지문에 주어진 케이스
    # expect(solution([...]), ..., "예제 1")

    # 2) 경계값 — 최소 입력 / 0·음수·최댓값 / 중복 / 전부 동일한 값
    # expect(solution([...]), ..., "최소 입력")

    # 3) 대규모 입력 성능 — 제약조건 상한에서 시간 내 완주
    # expect(solution([...] * 100_000), ..., "대규모 입력")

    raise NotImplementedError("검증 케이스를 채우세요")


if __name__ == "__main__":
    _check()
    print("OK")
