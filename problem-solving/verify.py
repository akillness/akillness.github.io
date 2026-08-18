#!/usr/bin/env python3
"""problem-solving 아래 모든 풀이의 검증 케이스를 실행한다.

사용법:
    python3 problem-solving/verify.py                # 전체
    python3 problem-solving/verify.py 0001 slug      # 이름에 인자가 포함된 문제만
    python3 problem-solving/verify.py --timeout 30   # 파일당 제한 시간(초), 기본 60

각 problems/*/solution*.py 를 별도 프로세스로 실행하고 종료 코드로 판정한다.
하나라도 실패하면 종료 코드 1.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROBLEMS = ROOT / "problems"
VENV_PYTHON = ROOT / ".venv" / "bin" / "python"


def interpreter() -> str:
    """LangGraph 등 의존성이 깔린 .venv 를 우선 사용한다. 없으면 현재 인터프리터."""
    return str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable


def collect(filters: list[str]) -> list[Path]:
    if not PROBLEMS.is_dir():
        return []
    found = sorted(PROBLEMS.glob("*/solution*.py"))
    if not filters:
        return found
    return [p for p in found if any(f in str(p.relative_to(ROOT)) for f in filters)]


def run(path: Path, timeout: int) -> tuple[bool, str, float]:
    started = time.perf_counter()
    try:
        proc = subprocess.run(
            [interpreter(), str(path)],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=path.parent,
        )
    except subprocess.TimeoutExpired:
        return False, f"TIMEOUT: {timeout}초 초과", time.perf_counter() - started
    elapsed = time.perf_counter() - started
    output = (proc.stdout + proc.stderr).strip()
    return proc.returncode == 0, output, elapsed


def main() -> int:
    parser = argparse.ArgumentParser(add_help=True)
    parser.add_argument("filters", nargs="*", help="경로에 포함될 부분 문자열")
    parser.add_argument("--timeout", type=int, default=60, help="파일당 제한 시간(초)")
    args = parser.parse_args()

    targets = collect(args.filters)
    if not targets:
        print("실행할 풀이가 없습니다. problems/ 아래에 solution*.py 를 추가하세요.")
        return 0

    if VENV_PYTHON.exists():
        print(f"interpreter: .venv ({VENV_PYTHON})\n")
    else:
        print(f"interpreter: {sys.executable} (.venv 없음 — LangGraph 풀이는 실패한다)\n")

    failed: list[Path] = []
    for path in targets:
        name = path.relative_to(ROOT)
        ok, output, elapsed = run(path, args.timeout)
        mark = "PASS" if ok else "FAIL"
        print(f"[{mark}] {name}  ({elapsed:.2f}s)")
        if not ok:
            failed.append(path)
            for line in output.splitlines():
                print(f"       {line}")

    total = len(targets)
    print(f"\n{total - len(failed)}/{total} 통과")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
