# LangGraph 참고 (2026-08 실측)

이 문서의 모든 버전·시그니처는 이 저장소 `.venv`에서 **직접 실행해 확인한 값**이다.
블로그 글이나 기억에 의존한 내용은 넣지 않았다.

---

## 검증된 환경

```
Python              3.14.6   (homebrew)
langgraph                    1.2.11   (2026-08-11 릴리스)
langgraph-checkpoint         4.2.0
langgraph-checkpoint-sqlite  3.1.1
langchain-core               1.5.4
```

설치:

```bash
python3 -m venv problem-solving/.venv
problem-solving/.venv/bin/python -m pip install -r problem-solving/requirements.txt
```

> 이 저장소의 시스템 Python은 **PEP 668 (EXTERNALLY-MANAGED)** 이라 전역 설치가 막혀 있다.
> venv가 선택이 아니라 필수다. `verify.py`는 `.venv`가 있으면 자동으로 그걸 쓴다.

---

## 버전 맥락

- **v1.0** (2025-10) 이 안정화 기준점. **2.0까지 breaking change 없음**을 약속한 릴리스.
- 그래서 `>=1.2,<2.0` 으로 잡으면 안전하다.
- v1.0에서 정리된 것들:
  - `create_react_agent` **deprecated** → LangChain의 `create_agent` 사용
  - `AgentState`에서 Pydantic 모델·dataclass 지원 deprecated → **`TypedDict` 권장**
  - `AgentStateWithStructuredResponse` 등 레거시 상태 클래스가 `AgentState`로 통합
- 1.1~1.2에서 추가된 것: functional API 정리, 체크포인터 백엔드 확장,
  `add_node`의 `trace_policy`.

---

## 실측 시그니처

기억이 아니라 `inspect.signature`로 뽑은 값. 스킬 문서에 안 나오는 파라미터가 여럿 있다.

### `StateGraph.add_node(...)`

```
node, action, defer, metadata, input_schema, retry_policy, cache_policy,
error_handler, destinations, timeout, trace_policy, **kwargs
```

문서에 잘 안 나오지만 유용한 것:

| 파라미터 | 용도 |
| :--- | :--- |
| `retry_policy` | 일시적 오류 재시도 (`RetryPolicy`) |
| `cache_policy` | 노드 결과 캐싱 (`CachePolicy(key_func, ttl)`) |
| `error_handler` | 노드 단위 에러 처리 훅 |
| `timeout` | 노드 실행 제한 시간 |
| `defer` | 실행 지연 |
| `trace_policy` | 트레이싱 제어 (1.2.x 추가) |

### `StateGraph.compile(...)`

```
checkpointer, cache, store, interrupt_before, interrupt_after,
debug, name, transformers
```

### `CompiledGraph.invoke(...)`

```
input, config, context, stream_mode, print_mode, output_keys,
interrupt_before, interrupt_after, durability, control, version, **kwargs
```

`durability`가 1.x에서 추가된 지속성 제어 파라미터.

### `CompiledGraph.stream(...)`

`invoke`와 동일 + `subgraphs`, `debug`.

### `RetryPolicy(...)`

```
initial_interval, backoff_factor, max_interval, max_attempts, jitter, retry_on
```

### `CachePolicy(...)`

```
key_func, ttl
```

---

## import 경로 (실측 확인)

```python
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, Send, RetryPolicy, CachePolicy, interrupt
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver     # langgraph-checkpoint-sqlite 필요
from langgraph.store.memory import InMemoryStore
from langgraph.cache.memory import InMemoryCache
from langgraph.runtime import Runtime
from langgraph.func import entrypoint, task            # functional API
from langgraph.prebuilt import ToolNode
from langgraph.config import get_stream_writer
```

---

## 직접 확인한 함정

### 1. `recursion_limit` 기본값은 10007 — 안전망이 아니다

루프 상한 가드를 빼고 돌려본 실측 결과:

```
langgraph.errors.GraphRecursionError:
Recursion limit of 10007 reached without hitting a stop condition.
```

10007번을 돈 뒤에야 터진다. **루프 상한은 도메인 조건으로 직접 걸어야 한다.**

```python
def route(state) -> Literal["repair", "__end__"]:
    if state["passed"]:
        return END
    if state["attempts"] >= MAX_ATTEMPTS:   # 이게 실질 가드
        return END
    return "repair"
```

### 2. 리듀서 없는 리스트는 조용히 덮어써진다

에러가 안 난다. 그래서 제일 위험하다.

```python
# 잘못: 여러 노드가 log 에 쓰는데 마지막 것만 남는다
class State(TypedDict):
    log: list[str]

# 맞음
class State(TypedDict):
    log: Annotated[list[str], operator.add]
```

여러 노드가 같은 필드에 쓰면 무조건 리듀서를 확인한다. `Send`로 팬아웃할 때도 필수.

### 3. 노드는 부분 업데이트 dict 를 반환한다

```python
# 잘못: state 를 수정해서 반환
def node(state):
    state["x"] = 1
    return state

# 맞음: 바뀐 부분만
def node(state):
    return {"x": 1}
```

### 4. `compile()` 없이는 실행할 수 없다

빈 그래프를 `compile()` 하면 이렇게 터진다 (실측):

```
ValueError: Graph must have an entrypoint:
add at least one edge from START to another node
```

### 5. `Command(goto=...)` 는 static edge 를 대체하지 않는다

`add_edge("a","b")`가 있는데 `a`가 `Command(goto="c")`를 반환하면 **`b`와 `c` 둘 다** 실행된다.

### 6. `START` 로 되돌아가는 엣지는 못 만든다

`add_edge("node_a", START)` 는 불가. 별도 진입 노드를 만들어 그쪽으로 보낸다.

### 7. `update_state` 는 리듀서를 통과한다

```python
# items: Annotated[list, operator.add], 현재 ["A","B"]
graph.update_state(config, {"items": ["C"]})              # → ["A","B","C"] 누적됨
graph.update_state(config, {"items": Overwrite(["C"])})   # → ["C"] 교체
```

### 8. 체크포인터 없이는 상태가 안 남는다 + `thread_id` 필수

```python
config = {"configurable": {"thread_id": "session-1"}}   # 없으면 영속 안 됨
graph = builder.compile(checkpointer=InMemorySaver())
```

`thread_id`가 다르면 상태가 격리된다 (실측: 다른 스레드의 `get_state().values == {}`).

---

## 검증 전략: LLM 호출 없이 그래프를 검증한다

이 폴더의 규칙은 **실행 검증된 코드**다. 그런데 LLM 호출이 노드 안에 박혀 있으면:

- API 키 없이 못 돌린다 → 검증 자체가 불가능
- 응답이 매번 달라진다 → 결정적 검증이 불가능
- 비용과 지연이 붙는다 → 회귀 검증을 자주 못 돈다

**생성기를 주입한다.** 그래프 구조는 그대로 두고 LLM 자리만 결정적 Fake로 바꾼다:

```python
def make_graph(solver, *, checkpointer=None):
    def solve(state):
        return {"code": solver(state["problem"], None), "attempts": 1}
    ...

# 검증: 결정적 Fake
make_graph(FakeSolver([WRONG, GOOD]))
# 실제: LLM
make_graph(real_llm_solver)
```

이러면 **제어 흐름(루프·분기·상한·리듀서)을 정확히 검증**할 수 있다.
실제로 검증되는 건 LLM의 출력 품질이 아니라 내가 짠 그래프 로직이고, 그게 버그가 나는 지점이다.

앞쪽 후보를 일부러 틀리게 두면 루프가 진짜 도는지도 확인된다.

### 변이 테스트로 검증을 검증한다

통과하는 테스트는 의미가 없다. **깨졌을 때 실패하는지**가 중요하다.
구현을 일부러 망가뜨려 검증 케이스가 잡아내는지 확인한다 — `0002` 문서 5번 섹션이 실례.

---

## 프레임워크 레이어 선택

문제를 받으면 **코드 쓰기 전에** 이걸 먼저 판단한다. 잘못 고르면 나머지가 다 틀어진다.

| 질문 | 예 → |
| :--- | :--- |
| 계획 수립, 세션 간 파일 관리, 영속 메모리, 온디맨드 스킬이 필요한가? | **Deep Agents** |
| 루프, 동적 분기, 병렬 워커, HITL, 커스텀 상태가 필요한가? | **LangGraph** |
| 고정 툴셋으로 입력 받아 결과 내는 단일 목적 에이전트인가? | **LangChain** `create_agent` |
| 에이전트 루프 없는 순수 모델 호출·체인·검색인가? | **LangChain** 체인 |

세 층은 경쟁 관계가 아니라 **쌓인 구조**다. 위층을 골라도 아래층 프리미티브를 그대로 쓴다.
`create_react_agent`는 deprecated — `create_agent`를 쓴다.
