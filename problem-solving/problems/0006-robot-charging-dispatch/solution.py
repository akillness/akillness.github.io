#!/usr/bin/env python3
"""0006. 로봇 충전 스테이션 배차 — 최대 이동거리 최소화

창고 격자에 로봇 R대와 충전 스테이션 S개가 있다. 각 로봇을 서로 다른
스테이션에 1:1 배정할 때, '가장 오래 걸리는 로봇의 이동거리'를 최소화한다.

풀이 요약: 스테이션마다 다중소스 BFS 로 거리표를 만들고(장애물 우회),
          답에 대해 이분탐색 + 이분매칭(Hopcroft-Karp 없이 Kuhn) 으로 판정.
복잡도: 시간 O(S*N*M + log(N*M) * R*S*R) / 공간 O(S*N*M)

0003 과의 결정적 차이: **벽이 있으므로 맨해튼거리 회전 트릭이 통하지 않는다.**
BFS 가 반드시 필요하다. 이 문제는 그 경계를 의도적으로 다룬다.

단독 실행:
    python3 solution.py
"""

from __future__ import annotations

import random
import time
from collections import deque
from itertools import permutations

WALL = 1
FREE = 0


def _bfs_from(grid: list[list[int]], sources: list[tuple[int, int]]) -> list[list[int]]:
    """sources 에서 출발한 다중소스 BFS 거리표. 도달 불가는 -1."""
    n, m = len(grid), len(grid[0])
    dist = [[-1] * m for _ in range(n)]
    queue: deque[tuple[int, int]] = deque()
    for si, sj in sources:
        if grid[si][sj] != WALL and dist[si][sj] == -1:
            dist[si][sj] = 0
            queue.append((si, sj))
    while queue:
        i, j = queue.popleft()
        d = dist[i][j] + 1
        for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= ni < n and 0 <= nj < m and grid[ni][nj] != WALL and dist[ni][nj] == -1:
                dist[ni][nj] = d
                queue.append((ni, nj))
    return dist


def _matches_within(
    cost: list[list[int]], limit: int, n_robots: int, n_stations: int
) -> bool:
    """거리가 limit 이하인 간선만 써서 로봇 전원을 매칭할 수 있는지 (Kuhn 증가경로)."""
    match_station = [-1] * n_stations

    def try_assign(robot: int, seen: list[bool]) -> bool:
        for station in range(n_stations):
            d = cost[robot][station]
            if d < 0 or d > limit or seen[station]:
                continue
            seen[station] = True
            if match_station[station] == -1 or try_assign(match_station[station], seen):
                match_station[station] = robot
                return True
        return False

    for robot in range(n_robots):
        if not try_assign(robot, [False] * n_stations):
            return False
    return True


def solution(
    grid: list[list[int]],
    robots: list[tuple[int, int]],
    stations: list[tuple[int, int]],
) -> int:
    """모든 로봇을 서로 다른 스테이션에 배정할 때 최대 이동거리의 최소값.

    배정이 불가능하면 -1.

    핵심: 스테이션 '하나당' BFS 를 돌려 cost[robot][station] 을 채운다.
    로봇 수보다 스테이션 수가 적으면 스테이션 기준이 더 싸다.
    """
    n_robots, n_stations = len(robots), len(stations)
    if n_robots > n_stations:
        return -1
    if n_robots == 0:
        return 0

    # 스테이션별 거리표 — 장애물을 우회하는 실제 이동거리
    cost = [[-1] * n_stations for _ in range(n_robots)]
    for s_idx, station in enumerate(stations):
        dist = _bfs_from(grid, [station])
        for r_idx, (ri, rj) in enumerate(robots):
            cost[r_idx][s_idx] = dist[ri][rj]

    # 후보 거리값만 모아 이분탐색 (연속 정수 전체를 훑을 필요 없다)
    candidates = sorted({d for row in cost for d in row if d >= 0})
    if not candidates:
        return -1

    lo, hi, answer = 0, len(candidates) - 1, -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if _matches_within(cost, candidates[mid], n_robots, n_stations):
            answer = candidates[mid]
            hi = mid - 1
        else:
            lo = mid + 1
    return answer


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _brute(
    grid: list[list[int]],
    robots: list[tuple[int, int]],
    stations: list[tuple[int, int]],
) -> int:
    """모든 배정 순열을 시도하는 오라클. 작은 입력 교차검증용."""
    n_robots, n_stations = len(robots), len(stations)
    if n_robots > n_stations:
        return -1
    if n_robots == 0:
        return 0
    cost = [[-1] * n_stations for _ in range(n_robots)]
    for s_idx, station in enumerate(stations):
        dist = _bfs_from(grid, [station])
        for r_idx, (ri, rj) in enumerate(robots):
            cost[r_idx][s_idx] = dist[ri][rj]

    best = -1
    for perm in permutations(range(n_stations), n_robots):
        worst = 0
        ok = True
        for r_idx, s_idx in enumerate(perm):
            d = cost[r_idx][s_idx]
            if d < 0:
                ok = False
                break
            if d > worst:
                worst = d
        if ok and (best == -1 or worst < best):
            best = worst
    return best


def _manhattan_answer(
    robots: list[tuple[int, int]], stations: list[tuple[int, int]]
) -> int:
    """벽을 무시한 맨해튼거리 기준 답. 0003 회전트릭이 깨지는지 보이기 위한 대조군."""
    n_robots, n_stations = len(robots), len(stations)
    if n_robots > n_stations:
        return -1
    best = -1
    for perm in permutations(range(n_stations), n_robots):
        worst = max(
            abs(robots[r][0] - stations[s][0]) + abs(robots[r][1] - stations[s][1])
            for r, s in enumerate(perm)
        )
        if best == -1 or worst < best:
            best = worst
    return best


def _random_case(rng: random.Random, n: int, m: int, wall_ratio: float):
    grid = [
        [WALL if rng.random() < wall_ratio else FREE for _ in range(m)] for _ in range(n)
    ]
    free = [(i, j) for i in range(n) for j in range(m) if grid[i][j] == FREE]
    if len(free) < 3:
        return None
    rng.shuffle(free)
    n_stations = rng.randint(1, min(4, len(free) - 1))
    n_robots = rng.randint(1, n_stations)
    robots = free[:n_robots]
    stations = free[n_robots : n_robots + n_stations]
    return grid, robots, stations


def _check() -> None:
    # ---- 1) 기본 예제 ----
    grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ]
    # 로봇 (0,0), 스테이션 (0,3) — 벽을 우회해야 한다
    expect(solution(grid, [(0, 0)], [(0, 3)]), 3, "단일 로봇 직선 경로")
    # 로봇 2대, 스테이션 2개
    expect(
        solution(grid, [(0, 0), (2, 0)], [(0, 3), (2, 3)]),
        3,
        "2대 배정 — 각자 가까운 쪽",
    )

    # ---- 2) 벽 때문에 맨해튼과 답이 갈리는 케이스 (0003 트릭이 깨지는 지점) ----
    u_shape = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    expect(solution(u_shape, [(0, 0)], [(0, 2)]), 6, "U자 벽 우회 → 6")
    expect(_manhattan_answer([(0, 0)], [(0, 2)]), 2, "맨해튼은 2 (오답)")

    # ---- 3) 도달 불가 ----
    blocked = [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
    ]
    expect(solution(blocked, [(0, 0)], [(0, 2)]), -1, "완전 차단 → -1")

    # ---- 4) 경계값 ----
    expect(solution([[0]], [], []), 0, "로봇 0대")
    expect(solution([[0, 0]], [(0, 0)], [(0, 0)]), 0, "이미 스테이션 위")
    expect(solution([[0, 0]], [(0, 0), (0, 1)], [(0, 0)]), -1, "스테이션 부족")
    expect(solution([[0, 0]], [(0, 0)], [(0, 0), (0, 1)]), 0, "스테이션 여유")

    # ---- 5) 병목 배정 — 그리디가 틀리는 케이스 ----
    #  로봇A는 두 스테이션 모두 가깝고, 로봇B는 한쪽만 가깝다.
    #  그리디로 A가 가까운 쪽을 먼저 집으면 B가 멀어진다.
    corridor = [[0, 0, 0, 0, 0]]
    #  robots at 0,1 / stations at 1,4
    #  A(0)->1 = 1, A(0)->4 = 4 ; B(1)->1 = 0, B(1)->4 = 3
    #  최적: A->1(1), B->4(3) => 3   /  A->4(4), B->1(0) => 4
    expect(
        solution(corridor, [(0, 0), (0, 1)], [(0, 1), (0, 4)]),
        3,
        "병목 배정 — 최대값 최소화",
    )

    # ---- 6) 무작위 교차검증 (순열 오라클) ----
    rng = random.Random(20260820)
    checked = 0
    for _ in range(1200):
        case = _random_case(rng, rng.randint(2, 5), rng.randint(2, 5), rng.random() * 0.4)
        if case is None:
            continue
        grid, robots, stations = case
        expect(
            solution(grid, robots, stations),
            _brute(grid, robots, stations),
            f"무작위 교차 {robots} {stations}",
        )
        checked += 1
    if checked < 500:
        raise AssertionError(f"[무작위] 유효 케이스가 {checked}개뿐 — 생성기 확인")

    # ---- 7) 벽이 있으면 맨해튼과 실제로 달라지는지 (트릭 무효 확인) ----
    diverged = 0
    for _ in range(400):
        case = _random_case(rng, 4, 4, 0.3)
        if case is None:
            continue
        grid, robots, stations = case
        real = solution(grid, robots, stations)
        naive = _manhattan_answer(robots, stations)
        if real != naive:
            diverged += 1
    if diverged == 0:
        raise AssertionError("[대조군] 맨해튼과 한 번도 안 갈렸다 — 케이스가 너무 쉽다")

    # ---- 8) 성능: 100x100 격자, 스테이션 20개, 로봇 20대 ----
    n = m = 100
    big = [[WALL if rng.random() < 0.2 else FREE for _ in range(m)] for _ in range(n)]
    free = [(i, j) for i in range(n) for j in range(m) if big[i][j] == FREE]
    rng.shuffle(free)
    robots, stations = free[:20], free[20:40]
    started = time.perf_counter()
    got = solution(big, robots, stations)
    elapsed = time.perf_counter() - started
    if elapsed > 5.0:
        raise AssertionError(f"[성능] 100x100 에서 {elapsed:.2f}s — 너무 느림")
    expect(got >= -1, True, "대규모 입력 완주")


if __name__ == "__main__":
    _check()
    print("OK")
