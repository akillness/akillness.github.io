#!/usr/bin/env python3
"""0001. MaxSliceSum — 최대 부분합

풀이 요약: Kadane's algorithm. 각 위치에서 "이전 구간을 이어받기 vs 여기서 새로 시작"
          둘 중 큰 쪽만 남기며 한 번 순회한다.
복잡도: 시간 O(N) / 공간 O(1)

단독 실행하면 검증 케이스가 모두 돌고 성공 시 OK를 출력한다.
    python3 solution.py
"""

from __future__ import annotations

import random
import time


def solution(a: list[int]) -> int:
    """비어있지 않은 연속 부분 수열 중 최대 합을 반환한다.

    a 는 최소 1개 원소를 가진다. 원소가 모두 음수면 그중 가장 큰(0에 가까운) 값이 답.
    """
    best = current = a[0]
    for value in a[1:]:
        # 이전 구간에 붙이는 게 손해면(current < 0) 여기서 새로 시작한다.
        current = value if current < 0 else current + value
        if current > best:
            best = current
    return best


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _brute(a: list[int]) -> int:
    """O(N^2) 정답 구현. 작은 입력에서 solution 과 교차 검증하는 용도."""
    best = a[0]
    for i in range(len(a)):
        total = 0
        for j in range(i, len(a)):
            total += a[j]
            if total > best:
                best = total
    return best


def _check() -> None:
    # 1) 기본 예제 — 문제 지문의 케이스
    expect(solution([3, 2, -6, 4, 0]), 5, "예제 1")

    # 2) 경계값
    expect(solution([5]), 5, "원소 1개 (양수)")
    expect(solution([-7]), -7, "원소 1개 (음수)")
    expect(solution([-3, -1, -9]), -1, "전부 음수 → 최대 원소")
    expect(solution([0, 0, 0]), 0, "전부 0")
    expect(solution([2, 2, 2, 2]), 8, "전부 동일한 양수")
    expect(solution([-2, 5, -1, 5, -2]), 9, "음수를 건너뛰고 이어붙이는 게 이득")
    expect(solution([10, -100, 10]), 10, "큰 음수로 구간이 끊기는 경우")
    expect(solution([-1_000_000, 1_000_000]), 1_000_000, "값 범위 상한")

    # 3) 무작위 교차 검증 — O(N^2) 브루트포스와 답이 같아야 한다.
    #    대규모 케이스에서 쓸 오라클(_slow_reference_max)도 같이 검증한다.
    rng = random.Random(20260814)
    for trial in range(300):
        n = rng.randint(1, 40)
        arr = [rng.randint(-50, 50) for _ in range(n)]
        answer = _brute(arr)
        expect(solution(arr), answer, f"무작위 교차검증 #{trial} {arr}")
        expect(_slow_reference_max(arr), answer, f"오라클 검증 #{trial} {arr}")

    # 4) 대규모 입력 성능 — N = 100,000 (Codility 제약 상한)
    big = [rng.randint(-1_000_000, 1_000_000) for _ in range(100_000)]
    started = time.perf_counter()
    got = solution(big)
    elapsed = time.perf_counter() - started
    expect(got, _slow_reference_max(big), "대규모 입력 정답 일치")
    if elapsed > 1.0:
        raise AssertionError(f"[대규모 입력 성능] O(N) 인데 {elapsed:.3f}s 소요 — 너무 느림")

    # 5) 최악 패턴 — 전부 음수 100,000개에서도 정답
    all_negative = [-(i + 1) for i in range(100_000)]
    expect(solution(all_negative), -1, "전부 음수 대규모")


def _slow_reference_max(a: list[int]) -> int:
    """대규모 입력용 독립 검산. 누적합 기반 O(N) 으로 Kadane 과 다른 방식."""
    best = a[0]
    prefix = 0
    min_prefix = 0
    for i, value in enumerate(a):
        prefix += value
        if i > 0 and prefix - min_prefix > best:
            best = prefix - min_prefix
        elif i == 0:
            best = prefix - min_prefix
        if prefix < min_prefix:
            min_prefix = prefix
    return best


if __name__ == "__main__":
    _check()
    print("OK")
