#!/usr/bin/env python3
"""0003. 모든 집과의 거리가 K 이하인 빈 땅 개수

풀이 요약: 장애물이 없으므로 거리 = 맨해튼거리.
          u=i+j, v=i-j 로 회전하면 맨해튼거리가 체비쇼프거리가 되어
          '모든 집과의 최대거리'가 집 집합의 u,v 최소·최대 4개 값으로 결정된다.
복잡도: 시간 O(N*M) / 공간 O(1) 추가

단독 실행하면 검증 케이스가 모두 돌고 성공 시 OK를 출력한다.
    python3 solution.py
"""

from __future__ import annotations

import random
import time
from collections import deque


def solution(K: int, A: list[list[int]]) -> int:
    """빈 땅(0) 중 '모든 집(1)과의 거리'가 K 이하인 칸의 개수.

    거리는 상하좌우 이동 거리이고 통과 불가 칸이 없으므로 맨해튼거리와 같다.

    핵심 변환:
        d = |i-hi| + |j-hj|
        u = i+j, v = i-j  로 두면  d = max(|u-hu|, |v-hv|)
    따라서 모든 집에 대한 최대거리는
        max( u-min_u, max_u-u, v-min_v, max_v-v )
    집이 몇 개든 4개 값만 알면 된다. 집 개수와 무관하게 O(1) 판정.
    """
    n = len(A)
    m = len(A[0])

    # 1패스: 집들의 u, v 범위만 구한다 (집 좌표를 따로 저장할 필요 없음)
    min_u = min_v = 10**9
    max_u = max_v = -10**9
    for i in range(n):
        row = A[i]
        for j in range(m):
            if row[j] == 1:
                u = i + j
                v = i - j
                if u < min_u:
                    min_u = u
                if u > max_u:
                    max_u = u
                if v < min_v:
                    min_v = v
                if v > max_v:
                    max_v = v

    # 집이 하나도 없는 경우. 문제 조건상 발생하지 않지만, 발생한다면
    # "모든 집과의 거리가 K 이하"는 공허참(vacuous truth)이므로
    # 빈 땅 전부가 조건을 만족한다. 0 을 반환하면 논리적으로 틀린다.
    if max_u == -(10**9):
        return sum(1 for i in range(n) for j in range(m) if A[i][j] == 0)

    # 2패스: 빈 땅마다 최대거리를 O(1) 로 판정
    count = 0
    for i in range(n):
        row = A[i]
        for j in range(m):
            if row[j] != 0:
                continue
            u = i + j
            v = i - j
            worst = u - min_u
            t = max_u - u
            if t > worst:
                worst = t
            t = v - min_v
            if t > worst:
                worst = t
            t = max_v - v
            if t > worst:
                worst = t
            if worst <= K:
                count += 1
    return count


# --------------------------------------------------------------------------
# 검증
# --------------------------------------------------------------------------


def expect(actual, expected, label: str) -> None:
    """actual != expected 면 AssertionError. `assert`와 달리 -O 에서도 동작한다."""
    if actual != expected:
        raise AssertionError(f"[{label}] expected={expected!r} actual={actual!r}")


def _brute(K: int, A: list[list[int]]) -> int:
    """정의 그대로 구현한 O(빈땅 * 집) 오라클. 작은 입력 교차검증용."""
    n, m = len(A), len(A[0])
    houses = [(i, j) for i in range(n) for j in range(m) if A[i][j] == 1]
    total = 0
    for i in range(n):
        for j in range(m):
            if A[i][j] != 0:
                continue
            if max(abs(i - hi) + abs(j - hj) for hi, hj in houses) <= K:
                total += 1
    return total


def _bfs_oracle(K: int, A: list[list[int]]) -> int:
    """집마다 BFS 를 돌리는 독립 오라클 O(H*N*M).

    '상하좌우 이동'을 실제로 시뮬레이션한다 — 맨해튼거리 가정 자체를 검증한다.
    느려서 본 풀이로는 못 쓰지만, 작은 입력에서 회전 트릭의 근거가 된다.
    """
    n, m = len(A), len(A[0])
    houses = [(i, j) for i in range(n) for j in range(m) if A[i][j] == 1]
    # 0 이 아니라 -1 로 시작해야 한다. 0 으로 두면 '도달 불가(-1)' 칸이
    # -1 > 0 == False 로 갱신을 건너뛰어 거리 0 인 것처럼 통과해버린다.
    worst = [[-1] * m for _ in range(n)]
    for hi, hj in houses:
        dist = [[-1] * m for _ in range(n)]
        dist[hi][hj] = 0
        queue = deque([(hi, hj)])
        while queue:
            i, j = queue.popleft()
            d = dist[i][j] + 1
            for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if 0 <= ni < n and 0 <= nj < m and dist[ni][nj] == -1:
                    dist[ni][nj] = d
                    queue.append((ni, nj))
        for i in range(n):
            for j in range(m):
                if A[i][j] != 0:
                    continue
                if dist[i][j] == -1:
                    # 도달 불가 = 거리 무한. 이 칸은 절대 조건을 만족할 수 없다.
                    worst[i][j] = 10**9
                elif worst[i][j] != 10**9 and dist[i][j] > worst[i][j]:
                    worst[i][j] = dist[i][j]
    return sum(
        1
        for i in range(n)
        for j in range(m)
        if A[i][j] == 0 and 0 <= worst[i][j] <= K
    )


def _random_grid(rng: random.Random, n: int, m: int) -> list[list[int]]:
    """집이 최소 1개인 무작위 격자."""
    grid = [[0] * m for _ in range(n)]
    cells = [(i, j) for i in range(n) for j in range(m)]
    for i, j in rng.sample(cells, rng.randint(1, n * m)):
        grid[i][j] = 1
    return grid


def _check() -> None:
    # 1) 지문 예제 3종
    expect(solution(2, [[0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 1]]), 2, "예시1 K=2 → 2")
    expect(solution(1, [[0, 1], [0, 0]]), 2, "예시2 K=1 → 2 (집 1개, 대각 코너는 거리 2)")
    expect(
        solution(4, [[0, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]]),
        8,
        "예시3 K=4 → 8 (5x4 비정방, 집 4개 대각 배치)",
    )

    # 2) 경계값 — 격자 최소 크기 2x2
    expect(solution(1, [[1, 0], [0, 0]]), 2, "2x2 집 1개 K=1")
    expect(solution(1, [[1, 0], [0, 1]]), 2, "2x2 집 2개 대각")
    expect(solution(1, [[1, 1], [1, 1]]), 0, "빈 땅이 하나도 없음")
    expect(solution(800, [[1, 0], [0, 0]]), 3, "K 최대 → 빈 땅 전부")

    # 3) K 하한 — K=1 이면 집에 인접한 칸만 가능
    expect(solution(1, [[0, 0, 0], [0, 1, 0], [0, 0, 0]]), 4, "집 1개 중앙 K=1 → 4방향")

    # 4) 집이 한 줄로 늘어선 경우 — 양 끝 집이 최대거리를 지배.
    #    [[1,0,0,1]] 의 빈 땅 (0,1),(0,2) 는 양쪽 집까지 각각 1과 2 → 최대 2.
    expect(solution(1, [[1, 0, 0, 1]]), 0, "1행 양끝 집 K=1 → 최대거리 2 초과")
    expect(solution(2, [[1, 0, 0, 1]]), 2, "1행 양끝 집 K=2 → 경계에서 통과")

    # 4-b) 비정방 격자 + 마지막 행/열에 통과 칸이 있는 케이스.
    #      예시3(5x4)은 마지막 행이 전부 K 초과라서 '마지막 행을 안 보는 버그'가
    #      드러나지 않는다. 행/열 경계 off-by-one 을 잡으려면 아래가 필요하다.
    edge = [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0]]
    expect(solution(3, edge), 10, "5x4 마지막 행에 통과 칸 존재 K=3")
    expect(solution(4, edge), 16, "5x4 마지막 행/열 통과 K=4")

    # 5) 무작위 교차검증 — 정의대로 구현한 브루트포스와 일치
    rng = random.Random(20260814)
    for trial in range(2000):
        n, m = rng.randint(2, 7), rng.randint(2, 7)
        grid = _random_grid(rng, n, m)
        k = rng.randint(1, 20)
        expect(solution(k, grid), _brute(k, grid), f"브루트포스 교차 #{trial} K={k} {grid}")

    # 6) BFS 오라클 교차검증 — '상하좌우 이동'을 실제 시뮬레이션한 값과 일치.
    #    맨해튼거리로 치환한 가정 자체를 검증한다.
    for trial in range(200):
        n, m = rng.randint(2, 6), rng.randint(2, 6)
        grid = _random_grid(rng, n, m)
        k = rng.randint(1, 12)
        expect(solution(k, grid), _bfs_oracle(k, grid), f"BFS 교차 #{trial} K={k} {grid}")

    # 7) 오라클끼리도 일치해야 한다 (오라클이 틀리면 통과 신호가 거짓이 된다)
    for trial in range(200):
        n, m = rng.randint(2, 6), rng.randint(2, 6)
        grid = _random_grid(rng, n, m)
        k = rng.randint(1, 12)
        expect(_brute(k, grid), _bfs_oracle(k, grid), f"오라클 검증 #{trial}")

    # 8) 최대 제약 성능 — N=M=400, K=800
    n = m = 400
    grid = [[0] * m for _ in range(n)]
    for _ in range(5000):
        grid[rng.randrange(n)][rng.randrange(m)] = 1
    started = time.perf_counter()
    got = solution(800, grid)
    elapsed = time.perf_counter() - started
    if elapsed > 2.0:
        raise AssertionError(f"[성능] 400x400 에서 {elapsed:.3f}s — O(N*M) 이 깨졌다")
    expect(got >= 0, True, "대규모 입력 완주")

    # 9) 최악 밀도 — 집이 절반. 집 개수에 무관하게 같은 시간이어야 한다
    dense = [[1 if rng.random() < 0.5 else 0 for _ in range(m)] for _ in range(n)]
    started = time.perf_counter()
    solution(800, dense)
    dense_elapsed = time.perf_counter() - started
    if dense_elapsed > 2.0:
        raise AssertionError(
            f"[성능] 집 밀집({sum(map(sum, dense))}개)에서 {dense_elapsed:.3f}s"
        )

    # 10) 집이 모서리에만 있는 최악 배치 — 대각 반대편이 최대거리
    corner = [[0] * m for _ in range(n)]
    corner[0][0] = corner[0][m - 1] = corner[n - 1][0] = corner[n - 1][m - 1] = 1
    # 네 모서리 집 → 중앙이 최대거리 최소. (n-1)+(m-1) 이 최대 필요거리
    expect(solution((n - 1) + (m - 1), corner), n * m - 4, "네 모서리 집, K 충분")
    expect(solution(1, corner), 0, "네 모서리 집, K=1 → 없음")


if __name__ == "__main__":
    _check()
    print("OK")
