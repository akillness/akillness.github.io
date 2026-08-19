#!/usr/bin/env python3
"""0003 샘플 실행 — 주어진 예시를 거리 지도와 함께 눈으로 확인한다.

검증(_check)이 아니라 **시연**이다. 세 방법(회전 O(NM) / 브루트포스 / BFS)의
답을 나란히 출력하고, 각 빈 땅의 '모든 집과의 최대거리'를 격자로 그린다.

실행:
    python3 sample_run.py
"""

from __future__ import annotations

import time

from solution import _bfs_oracle, _brute, solution

BAR = "─" * 62


def draw(K: int, A: list[list[int]]) -> tuple[int, list[tuple[int, int]]]:
    """거리 지도를 그리고 (통과 개수, 통과 좌표) 를 반환한다."""
    n, m = len(A), len(A[0])
    houses = [(i, j) for i in range(n) for j in range(m) if A[i][j] == 1]
    passed: list[tuple[int, int]] = []

    print(f"  입력  K={K}, {n}x{m} 격자, 집 {len(houses)}개 {houses}")
    print("  거리 지도 (H=집, *=통과):")
    for i in range(n):
        cells = []
        for j in range(m):
            if A[i][j] == 1:
                cells.append("   H")
            else:
                worst = max(abs(i - hi) + abs(j - hj) for hi, hj in houses)
                if worst <= K:
                    passed.append((i, j))
                    cells.append(f"{worst:3d}*")
                else:
                    cells.append(f"{worst:3d} ")
        print("      " + " ".join(cells))
    return len(passed), passed


def run(name: str, K: int, A: list[list[int]], want: int | None) -> bool:
    print(BAR)
    print(name)
    print(BAR)
    count, passed = draw(K, A)

    fast = solution(K, A)
    brute = _brute(K, A)
    bfs = _bfs_oracle(K, A)

    print(f"  통과 좌표: {passed}")
    print(f"  회전 O(NM) : {fast}")
    print(f"  브루트포스 : {brute}")
    print(f"  BFS 오라클 : {bfs}")

    agree = fast == brute == bfs == count
    if want is None:
        verdict = "세 방법 일치" if agree else "★불일치★"
        print(f"  → {fast}  ({verdict}, 기대값 미제시)")
        return agree
    ok = agree and fast == want
    print(f"  → {fast}  기대 {want}  {'✓ 일치' if ok else '★불일치★'}")
    return ok


results = []

results.append(
    run(
        "예시 1",
        2,
        [[0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 1]],
        2,
    )
)
print()
results.append(run("예시 2", 1, [[0, 1], [0, 0]], None))
print()
results.append(
    run(
        "예시 3",
        4,
        [[0, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
        8,
    )
)

# --------------------------------------------------------------------------
# 최대 제약 성능 시연
# --------------------------------------------------------------------------
print()
print(BAR)
print("최대 제약 성능  (N=M=400, K=800)")
print(BAR)

import random

rng = random.Random(20260814)
N = M = 400
for label, house_count in (("집 5,000개", 5000), ("집 80,000개 (밀도 50%)", 80000)):
    grid = [[0] * M for _ in range(N)]
    placed = 0
    while placed < house_count:
        i, j = rng.randrange(N), rng.randrange(M)
        if grid[i][j] == 0:
            grid[i][j] = 1
            placed += 1
    started = time.perf_counter()
    got = solution(800, grid)
    elapsed = time.perf_counter() - started
    naive = house_count * N * M
    print(f"  {label:24} → {got:>7,}칸  {elapsed:.4f}초")
    print(f"  {'':24}   집마다 BFS 라면 ≈ {naive:,} 연산")

print()
print(BAR)
verdict = "샘플 전부 통과" if all(results) else "★실패 있음★"
print(f"{verdict} ({sum(results)}/{len(results)})")
print(BAR)
raise SystemExit(0 if all(results) else 1)
