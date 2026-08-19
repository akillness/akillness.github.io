# problem-solving

문제를 받으면 **① 문제 정리·풀이방법 문서**와 **② 실행 검증까지 끝난 코드**를 한 쌍으로 남기는 작업 폴더.

블로그 빌드에는 포함되지 않는다 (`_config.yml`의 `exclude`에 등록됨).

---

## 환경

두 트랙이 있다. 문제 성격에 맞춰 고른다.

| 트랙 | 언제 | 인터프리터 | 의존성 |
| :--- | :--- | :--- | :--- |
| **순수 Python** | 알고리즘 / 코딩테스트 | 시스템 `python3` | 표준 라이브러리만 |
| **LangGraph** | 에이전트 / 워크플로 / 제어 흐름 | `.venv/bin/python` | `langgraph` 등 |

LangGraph 트랙은 venv가 필요하다 (시스템 Python은 PEP 668로 전역 설치가 막혀 있다):

```bash
python3 -m venv problem-solving/.venv
problem-solving/.venv/bin/python -m pip install -r problem-solving/requirements.txt
```

검증된 버전은 `LANGGRAPH.md` 참고 — 2026-08 기준 `langgraph 1.2.11` / Python 3.14.6.
`verify.py`는 `.venv`가 있으면 자동으로 그걸 쓴다. 두 트랙이 한 명령으로 돌아간다.

---

## 폴더 구조

```
problem-solving/
├── README.md                  # 이 문서 (작업 규칙)
├── LANGGRAPH.md               # LangGraph 2026 실측 API·함정 정리
├── requirements.txt           # LangGraph 트랙 의존성
├── verify.py                  # 모든 풀이의 검증 케이스를 한 번에 실행
├── .venv/                     # LangGraph 트랙 전용 (gitignore)
├── TEMPLATE/                  # 순수 Python 문제용 템플릿
│   ├── README.md              #   └ 문제 정리 + 풀이방법 문서 양식
│   └── solution.py            #   └ 풀이 + 검증 케이스 양식
├── TEMPLATE_LANGGRAPH/        # LangGraph 문제용 템플릿
│   ├── README.md              #   └ + 프레임워크 선택 근거, 그래프 설계 섹션
│   └── solution.py            #   └ + 상태 스키마, 노드, 엣지, 리듀서 양식
└── problems/
    └── NNNN-problem-slug/     # 문제 하나 = 폴더 하나
        ├── README.md          #   └ 문제 정리 + 풀이방법 (문서)
        └── solution.py        #   └ 풀이 + 검증 케이스 (코드)
```

- `NNNN`: 4자리 순번 (`0001`, `0002`, …)
- `problem-slug`: 영문 소문자 + 하이픈. 한글 제목은 폴더명이 아니라 문서 안에 쓴다.
- 한 문제를 여러 방법으로 풀면 `solution.py`, `solution_alt.py`처럼 `solution*.py` 규칙을 지킨다. 러너가 모두 실행한다.

기존 예제:

| 문제 | 트랙 | 무엇을 보여주는가 |
| :--- | :--- | :--- |
| `0001-max-slice-sum` | 순수 Python | 경계값·브루트포스 교차검증·대규모 성능 가드 |
| `0002-langgraph-solve-verify-loop` | LangGraph | 루프·조건분기·리듀서·체크포인터 + 변이 테스트 |
| `0003-all-houses-within-k` | 순수 Python | O(H·NM)→O(NM) 좌표회전 + BFS 오라클로 가정 검증 |
| `0004-factory-monitor-agent` | LangGraph | HITL `interrupt()`/재개 · `ToolNode` 순차 루프 · `BaseChatModel` 주입 |
| `0005-patient-slot-assignment` | 순수 Python | O(2^N)→O(N·α) 그래프 환원 · Union-Find · 적대적 성능 가드 |

---

## 새 문제 추가 절차

1. 트랙에 맞는 템플릿 복사

   ```bash
   # 순수 Python
   cp -r problem-solving/TEMPLATE problem-solving/problems/0003-problem-slug

   # LangGraph
   cp -r problem-solving/TEMPLATE_LANGGRAPH problem-solving/problems/0003-problem-slug
   ```

2. `README.md`에 **문제 정리 + 풀이방법**을 채운다 (아래 문서 규칙 참고).
   LangGraph 트랙은 **프레임워크 레이어 선택 근거**를 먼저 적는다 (`LANGGRAPH.md` 마지막 섹션).
3. `solution.py`에 **풀이 함수 + 검증 케이스**를 채운다.
4. 실행 검증 — 통과할 때까지 3번을 반복한다. 통과 못한 코드는 남기지 않는다.

   ```bash
   python3 problem-solving/problems/0003-slug/solution.py                          # 순수 Python
   problem-solving/.venv/bin/python problem-solving/problems/0003-slug/solution.py  # LangGraph
   ```

5. 전체 회귀 검증

   ```bash
   python3 problem-solving/verify.py
   ```

---

## 문서 규칙 (`problems/*/README.md`)

아래 6개 섹션을 고정으로 쓴다. 빈 섹션은 남기지 말고 "해당 없음"이라도 적는다.

**순수 Python 트랙**

| 섹션 | 내용 |
| :--- | :--- |
| `## 1. 문제` | 문제 요약, 입출력, **제약조건(N 범위, 값 범위)** |
| `## 2. 접근` | 왜 이 방법인지. 떠올린 순서대로. 버린 방법과 버린 이유도 함께 |
| `## 3. 알고리즘` | 단계별 절차. 필요하면 의사코드 |
| `## 4. 복잡도` | 시간/공간 복잡도 + 제약조건 상한에서 통과하는 근거 |
| `## 5. 검증` | 어떤 케이스를 왜 넣었는지 (기본 예제 / 경계값 / 대규모 성능) |
| `## 6. 함정 & 배운 점` | 틀렸던 지점, 놓쳤던 예외, 다시 만나면 확인할 것 |

**LangGraph 트랙** — 2·3·4번이 다르다

| 섹션 | 내용 |
| :--- | :--- |
| `## 1. 문제` | 요약, 입출력, **반복 상한·실패 처리·외부 호출 여부** |
| `## 2. 왜 LangGraph인가` | 레이어 선택 근거를 표로. LangChain / Deep Agents를 왜 안 썼는지 |
| `## 3. 그래프 설계` | 상태 스키마(**필드별 리듀서와 그 이유**), 노드 표, 엣지 다이어그램 |
| `## 4. 복잡도 / 비용` | 노드 실행 횟수, **루프 상한과 근거**, LLM 호출 횟수 |
| `## 5. 검증` | 정상 경로 / 각 분기 / 루프 상한 / 리듀서 누적 |
| `## 6. 함정 & 배운 점` | 같음 |

---

## 코드 규칙 (`problems/*/solution*.py`)

**공통**

- 진입점은 `solution(...)` 함수 하나.
- 검증은 파일 안에 `_check()`로 같이 둔다. 단독 실행으로 자동 검증되고, 성공 시 `OK`를 출력한다.
- 비교는 `expect(actual, expected, label)` 헬퍼로 한다. `assert`와 달리 `-O` 옵션에서도 살아있고 실패 메시지가 남는다.
- **검증 케이스가 실제로 무언가를 지키는지 확인한다.** 구현을 일부러 깨뜨려 테스트가 실패하는지 본다(변이 테스트). 통과하는 테스트가 아니라 깨지면 실패하는 테스트가 목적이다.

**순수 Python 트랙**

- **표준 라이브러리만.** 외부 패키지 금지 (온라인 코딩테스트 환경과 동일하게 유지).
- 검증 케이스 최소 3종류:
  1. 문제에 주어진 기본 예제
  2. 경계값 — 최소 입력, 빈 값, 0/음수/최댓값, 중복 원소, 전부 동일한 값
  3. 대규모 입력 성능 — 제약조건 상한(예: `N = 100_000`)에서 시간 내 완주 확인
- 가능하면 브루트포스 오라클과 무작위 교차 검증까지 넣는다. 오라클 자체도 검증한다.

**LangGraph 트랙**

- 상태는 `TypedDict`. 여러 노드가 쓰는 필드엔 반드시 리듀서(`Annotated[list, operator.add]`).
- 노드는 **전체 state가 아니라 바뀐 부분만 담은 dict**를 반환한다.
- 루프가 있으면 **도메인 조건으로 상한을 명시**한다. `recursion_limit` 기본값은 10007이라 가드가 못 된다.
- **LLM은 주입한다.** 노드 안에 하드코딩하지 않는다. 그래프 팩토리가 생성기를 인자로 받으면 검증 때 결정적 Fake를 넣을 수 있다 → API 키 없이 오프라인·재현 가능한 검증.
- 검증 케이스 최소 4종류:
  1. 정상 경로 — END까지 도달
  2. 각 조건 분기 — 최소 1회씩 실행
  3. 루프 상한 — 무한 루프 가드 동작
  4. 리듀서 — 누적 필드가 덮어써지지 않음
- 체크포인터를 쓰면 상태 이력·스레드 격리도 검증한다.

---

## 검증 러너 사용법

```bash
python3 problem-solving/verify.py                  # 전체 실행
python3 problem-solving/verify.py 0001             # 이름에 '0001'이 포함된 문제만
python3 problem-solving/verify.py --timeout 30     # 파일당 제한 시간(초), 기본 60
```

- 각 `solution*.py`를 별도 프로세스로 실행하고 종료 코드로 성공/실패를 판정한다.
- 실패한 파일은 stdout/stderr를 그대로 출력한다.
- 하나라도 실패하면 러너가 종료 코드 `1`을 반환한다.

---

## 샘플 실행 (`problems/*/sample_run.py`) — 선택

`solution.py` 의 `_check()` 는 **통과/실패만** 알려준다. 중간 과정이 안 보인다.
`sample_run.py` 는 같은 코드를 **눈으로 확인**하는 시연용이다.

```bash
cd problem-solving/problems/0003-all-houses-within-k && python3 sample_run.py
cd problem-solving/problems/0004-factory-monitor-agent && ../../.venv/bin/python sample_run.py
```

- 파일명이 `solution*.py` 가 아니므로 **`verify.py` 회귀에는 섞이지 않는다.**
- 알고리즘 문제: 입력 → 중간 계산(거리 지도 등) → 세 방법 비교 → 성능 실측
- LangGraph 문제: `stream(stream_mode="updates")` 로 **노드별 실행 순서와 상태 갱신**을 출력
- 실패 시 종료 코드 `1` 을 반환하게 만들어 두면 수동 점검용으로도 쓸 수 있다.
