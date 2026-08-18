#!/usr/bin/env python3
"""0005. 환자 진료 시간대 배정 가능성 판정

풀이 요약: 시간대=정점, 환자=간선으로 보면 "각 간선을 한쪽 끝점에 배정,
          정점당 최대 1개"가 된다. 이는 각 연결 요소에서 간선수 <= 정점수
          (= 요소당 사이클 최대 1개, pseudoforest)와 동등하다.
복잡도: 시간 O((N + S) * α) / 공간 O(S)

단독 실행하면 검증 케이스가 모두 돌고 성공 시 OK를 출력한다.
    python3 solution.py
"""

from __future__ import annotations

import itertools
import random
import time


def solution(A: list[int], B: list[int], S: int) -> bool:
    """모든 환자를 선호 시간대 중 하나에 배정할 수 있으면 True.

    그래프 환원:
        시간대 -> 정점, 환자 i -> 간선 (A[i], B[i])
        배정   -> 각 간선을 두 끝점 중 하나에 '방향 부여'
        제약   -> 정점마다 들어오는 간선 최대 1개

    가능 조건: 모든 연결 요소에서 |간선| <= |정점|.
        - 트리(E = V-1): 루트를 잡고 각 간선을 자식 쪽으로 → 루트만 빈다
        - 단일 사이클 포함(E = V): 사이클을 한 방향으로 돌리고 매달린 트리는 바깥으로
        - E > V: 비둘기집 원리로 불가능

    구현은 "요소당 사이클 최대 1개"를 Union-Find 로 직접 추적한다.
    E <= V 와 동등하면서 마지막에 S 개 정점을 다시 훑지 않아도 된다.
    """
    # 정점 인덱스는 1..S. 0 번은 쓰지 않는다.
    parent = list(range(S + 1))
    has_cycle = [False] * (S + 1)

    def find(x: int) -> int:
        # 경로 압축. 재귀를 쓰면 S=100,000 에서 재귀 한도에 걸린다.
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root

    for a, b in zip(A, B):
        ra, rb = find(a), find(b)
        if ra == rb:
            # 같은 요소 안의 간선 → 사이클이 하나 늘어난다.
            if has_cycle[ra]:
                return False  # 사이클 2개 = E > V
            has_cycle[ra] = True
        else:
            # 사이클을 가진 두 요소를 잇는 간선 → E = V + 1
            if has_cycle[ra] and has_cycle[rb]:
                return False
            parent[rb] = ra
            has_cycle[ra] = has_cycle[ra] or has_cycle[rb]
    return True


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _brute(A: list[int], B: list[int], S: int) -> bool:
    """정의 그대로 모든 배정 조합을 시도하는 O(2^N) 오라클."""
    n = len(A)
    for choice in itertools.product((0, 1), repeat=n):
        used: set[int] = set()
        ok = True
        for i, c in enumerate(choice):
            slot = A[i] if c == 0 else B[i]
            if slot in used:
                ok = False
                break
            used.add(slot)
        if ok:
            return True
    return False


def _component_oracle(A: list[int], B: list[int], S: int) -> bool:
    """요소별 |간선| <= |정점| 을 직접 세는 독립 오라클.

    본 풀이(사이클 추적)와 다른 논리라서 교차검증 가치가 있다.
    """
    parent = list(range(S + 1))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    verts = [1] * (S + 1)
    edges = [0] * (S + 1)
    for a, b in zip(A, B):
        ra, rb = find(a), find(b)
        if ra == rb:
            edges[ra] += 1
        else:
            parent[rb] = ra
            verts[ra] += verts[rb]
            edges[ra] += edges[rb] + 1
    return all(
        edges[v] <= verts[v] for v in range(1, S + 1) if find(v) == v
    )


def _random_case(rng: random.Random, max_s: int, max_n: int):
    s = rng.randint(2, max_s)
    n = rng.randint(1, max_n)
    a_list, b_list = [], []
    for _ in range(n):
        a = rng.randint(1, s)
        b = rng.randint(1, s)
        while b == a:  # A[i] != B[i] 제약
            b = rng.randint(1, s)
        a_list.append(a)
        b_list.append(b)
    return a_list, b_list, s


def _check() -> None:
    # ---- 1) 기본 케이스 ----
    expect(solution([1], [2], 2), True, "환자 1명")
    expect(solution([1, 2], [2, 3], 3), True, "사슬 (트리)")
    expect(solution([1, 2, 3], [2, 3, 1], 3), True, "삼각형 = 단일 사이클 → 가능")
    expect(solution([1, 1], [2, 2], 2), True, "같은 쌍 2명, 시간대 2개 → 가능")

    # ---- 2) 불가능 케이스 ----
    expect(solution([1, 1, 1], [2, 2, 2], 3), False, "같은 쌍 3명 → 시간대 2개에 3명")
    expect(solution([1, 2, 3, 1], [2, 3, 1, 2], 3), False, "삼각형 + 간선 1개")

    # ---- 3) 전역 N <= S 만 보면 틀리는 케이스 (핵심 함정) ----
    #      N=3 <= S=4 이지만 세 환자가 모두 {1,2} 만 선호 → 불가능.
    expect(solution([1, 1, 1], [2, 2, 2], 4), False, "N<=S 인데 불가능")
    expect(solution([1, 1, 1], [2, 2, 2], 100_000), False, "S 가 아무리 커도 불가능")

    # ---- 4) 요소가 여러 개 ----
    expect(solution([1, 2, 3, 4], [2, 1, 4, 3], 4), True, "사이클 2개 (분리된 요소)")
    expect(solution([1, 1, 3, 3], [2, 2, 4, 4], 4), True, "독립 요소 각각 E=V")
    expect(
        solution([1, 1, 1, 3, 3], [2, 2, 2, 4, 4], 4),
        False,
        "한 요소만 초과해도 False",
    )

    # ---- 5) 경계값 ----
    expect(solution([1], [2], 100_000), True, "S 최대, 환자 1명")
    expect(solution([1, 2], [2, 1], 2), True, "S 최소=2, 두 환자가 같은 쌍")
    expect(solution([1, 2, 1], [2, 1, 2], 2), False, "S=2 에 환자 3명")

    # ---- 6) 무작위 교차검증 — 브루트포스 + 독립 오라클 3자 일치 ----
    rng = random.Random(20260814)
    for trial in range(4000):
        a_list, b_list, s = _random_case(rng, max_s=6, max_n=7)
        want = _brute(a_list, b_list, s)
        expect(solution(a_list, b_list, s), want, f"브루트포스 교차 #{trial} {a_list} {b_list} S={s}")
        expect(
            _component_oracle(a_list, b_list, s),
            want,
            f"오라클 검증 #{trial} {a_list} {b_list} S={s}",
        )

    # ---- 7) 전수 검증 — 작은 S 의 모든 간선 조합 ----
    total = 0
    for s in (2, 3, 4):
        pairs = [(a, b) for a in range(1, s + 1) for b in range(1, s + 1) if a < b]
        for n in range(1, 5):
            for combo in itertools.product(pairs, repeat=n):
                a_list = [p[0] for p in combo]
                b_list = [p[1] for p in combo]
                want = _brute(a_list, b_list, s)
                expect(solution(a_list, b_list, s), want, f"전수 {a_list} {b_list} S={s}")
                total += 1
    expect(total > 1500, True, f"전수 케이스 수 (실제 {total})")

    # ---- 8) 최대 제약 성능 — N = S = 100,000 ----
    n = s = 100_000
    a_list = [rng.randint(1, s) for _ in range(n)]
    b_list = []
    for a in a_list:
        b = rng.randint(1, s)
        while b == a:
            b = rng.randint(1, s)
        b_list.append(b)
    started = time.perf_counter()
    solution(a_list, b_list, s)
    elapsed = time.perf_counter() - started
    if elapsed > 2.0:
        raise AssertionError(f"[성능] N=S=100,000 에서 {elapsed:.3f}s — 너무 느림")

    # ---- 9) 최악 형태 — 거대 사슬 / 스타 ----
    #      주의: (1,2),(2,3),... 사슬은 union 방향 때문에 트리가 평평해져서
    #      경로 압축이 없어도 빠르다. 성능 가드로 쓸 수 없다 (실측 확인).
    chain_a = list(range(1, s))
    chain_b = list(range(2, s + 1))
    expect(solution(chain_a, chain_b, s), True, "거대 사슬 N=S-1 → 가능")

    # 정점 1 에 전부 몰린 스타: E = S-1, V = S → 가능
    star_a = [1] * (s - 1)
    star_b = list(range(2, s + 1))
    expect(solution(star_a, star_b, s), True, "거대 스타 E=S-1 → 가능")
    # 여기에 간선 하나 더 → E = S → 여전히 가능 (사이클 1개)
    expect(solution(star_a + [2], star_b + [3], s), True, "스타 + 간선 1개 → E=S 가능")
    # 두 개 더 → E = S+1 → 불가능
    expect(solution(star_a + [2, 4], star_b + [3, 5], s), False, "스타 + 간선 2개 → 불가능")

    # ---- 10) 경로 압축 성능 가드 (적대적 입력) ----
    #      깊은 사슬을 먼저 만들고, 그 사슬의 '가장 깊은' 노드(1)를 반복 조회한다.
    #      압축이 없으면 매 조회가 O(depth) → 전체 O(N*S).
    #      실측: S=20,000 에서 압축없음 2.56s vs 압축있음 0.006s (420배).
    #            S=100,000 에서는 압축없음이 30초를 넘긴다.
    half = s // 2
    deep_a = list(range(2, half + 1))
    deep_b = list(range(1, half))
    for x in range(half + 1, s + 1):
        deep_a.append(1)
        deep_b.append(x)
    started = time.perf_counter()
    expect(solution(deep_a, deep_b, s), True, "깊은 트리 + 반복 조회 → 가능")
    elapsed = time.perf_counter() - started
    if elapsed > 2.0:
        raise AssertionError(
            f"[성능] 깊은 트리에서 {elapsed:.3f}s — 경로 압축이 빠졌다"
        )


if __name__ == "__main__":
    _check()
    print("OK")
