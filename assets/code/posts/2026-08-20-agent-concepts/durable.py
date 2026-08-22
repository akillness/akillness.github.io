#!/usr/bin/env python3
"""Durable execution for agent workflows, in ~200 lines of stdlib Python.

The claim under test: for a multi-step agent run, a *retry* and a *checkpoint*
solve different problems, and only one of them is safe.

  retry      -> rerun the failed unit of work
  checkpoint -> remember the units that already succeeded

Everything here is deterministic. Steps are plain callables and "LLM calls" are
counters, so the properties below are provable rather than plausible:

  1. Naive retry re-executes completed steps        (wasted work)
  2. Naive retry re-fires completed side effects    (a correctness bug)
  3. Checkpointing replays completed steps from memo, executing only the gap
  4. Memoized replay is *not* the same as re-running a nondeterministic step
  5. An idempotency key makes an at-least-once delivery effectively once
  6. A workflow can suspend and resume in a different process

Run it and every check executes:
    python3 durable.py
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, Callable

# --------------------------------------------------------------------------
# The store: what a durable execution layer persists on your behalf
# --------------------------------------------------------------------------


@dataclass
class StepStore:
    """Completed step results, keyed by (run_id, step_id).

    A real platform puts this in Postgres and keys it by a hash of the step ID.
    The shape is what matters: the result outlives the process that made it.
    """

    memo: dict[tuple[str, str], Any] = field(default_factory=dict)
    writes: int = 0

    def get(self, run_id: str, step_id: str) -> tuple[bool, Any]:
        key = (run_id, step_id)
        return (key in self.memo, self.memo.get(key))

    def put(self, run_id: str, step_id: str, value: Any) -> None:
        # Persisting AFTER the step returns is the whole point: a crash between
        # "step finished" and "result saved" must not lose the result silently.
        self.memo[(run_id, step_id)] = value
        self.writes += 1

    def snapshot(self) -> str:
        """Serialize so a different process can pick the run back up."""
        return json.dumps({f"{r}::{s}": v for (r, s), v in self.memo.items()}, sort_keys=True)

    @classmethod
    def restore(cls, blob: str) -> StepStore:
        st = cls()
        for k, v in json.loads(blob).items():
            r, s = k.split("::", 1)
            st.memo[(r, s)] = v
        return st


class Suspend(Exception):
    """Raised when a workflow parks on an external event.

    The point of a suspend is that it releases the worker. The run is not
    "in progress on this machine" -- it is durable state waiting for input.
    """

    def __init__(self, step_id: str, waiting_for: str):
        super().__init__(f"suspended at {step_id!r} waiting for {waiting_for!r}")
        self.step_id = step_id
        self.waiting_for = waiting_for


# --------------------------------------------------------------------------
# Two runners over the same workflow: one naive, one durable
# --------------------------------------------------------------------------


@dataclass
class Ledger:
    """Observability: what actually executed, versus what was replayed."""

    executed: list[str] = field(default_factory=list)
    replayed: list[str] = field(default_factory=list)
    side_effects: list[str] = field(default_factory=list)

    @property
    def cost(self) -> int:
        """Stand-in for tokens + wall clock: only real execution costs money."""
        return len(self.executed)


class NaiveRunner:
    """Retry-from-the-top. What a plain job queue gives you."""

    def __init__(self) -> None:
        self.ledger = Ledger()

    def step(self, step_id: str, fn: Callable[[], Any]) -> Any:
        self.ledger.executed.append(step_id)
        return fn()

    def side_effect(self, name: str, key: str | None = None) -> None:
        # No dedupe anywhere: every attempt fires again.
        self.ledger.side_effects.append(name)


class DurableRunner:
    """Checkpointed execution: completed steps are memoized, not re-run."""

    def __init__(self, run_id: str, store: StepStore, events: dict[str, Any] | None = None) -> None:
        self.run_id = run_id
        self.store = store
        self.events = events or {}
        self.ledger = Ledger()
        self._delivered: set[str] = set()

    def step(self, step_id: str, fn: Callable[[], Any]) -> Any:
        hit, value = self.store.get(self.run_id, step_id)
        if hit:
            # This is the load-bearing line. A completed step is a *fact*,
            # not an instruction to recompute.
            self.ledger.replayed.append(step_id)
            return value
        self.ledger.executed.append(step_id)
        value = fn()
        self.store.put(self.run_id, step_id, value)
        return value

    def side_effect(self, name: str, key: str) -> None:
        """At-least-once delivery, made effectively-once by an idempotency key.

        The key is checkpointed like any other step, so the dedupe survives a
        process restart -- an in-memory set would not.
        """
        hit, _ = self.store.get(self.run_id, f"__effect__{key}")
        if hit or key in self._delivered:
            return
        self.ledger.side_effects.append(name)
        self._delivered.add(key)
        self.store.put(self.run_id, f"__effect__{key}", True)

    def wait_for_event(self, step_id: str, name: str) -> Any:
        """Park until `name` arrives. Completed waits are memoized too."""
        hit, value = self.store.get(self.run_id, step_id)
        if hit:
            self.ledger.replayed.append(step_id)
            return value
        if name not in self.events:
            raise Suspend(step_id, name)
        value = self.events[name]
        self.ledger.executed.append(step_id)
        self.store.put(self.run_id, step_id, value)
        return value


# --------------------------------------------------------------------------
# The workflow under test: a research agent that fails partway through
# --------------------------------------------------------------------------


def research_workflow(r, *, fail_on: str | None = None, with_wait: bool = False, nonce: int = 0):
    """retrieval -> extraction -> notify -> [approval] -> drafting -> deliver.

    `fail_on` makes exactly one step raise, the way a provider timeout would.
    `nonce` perturbs the drafting output so nondeterminism is observable.
    """

    def guard(name: str):
        if fail_on == name:
            raise RuntimeError(f"{name} timed out")

    docs = r.step("retrieval", lambda: (guard("retrieval"), ["doc-a", "doc-b", "doc-c"])[1])
    facts = r.step("extraction", lambda: (guard("extraction"), [d.upper() for d in docs])[1])

    # A real side effect: an email that must not be sent twice.
    r.side_effect("email:extraction-complete", key="extraction-complete")

    if with_wait:
        r.wait_for_event("approval", "editor.approved")

    draft = r.step("drafting", lambda: (guard("drafting"), f"draft({'+'.join(facts)})#{nonce}")[1])
    return r.step("deliver", lambda: (guard("deliver"), f"delivered:{draft}")[1])


# --------------------------------------------------------------------------
# Verification
# --------------------------------------------------------------------------


def _expect(actual, expected, label: str) -> None:
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")
    print(f"  ok  {label}")


def _check() -> None:
    print("1. Naive retry: the failure erases finished work")

    naive = NaiveRunner()
    try:
        research_workflow(naive, fail_on="drafting")
    except RuntimeError:
        pass
    _expect(naive.ledger.executed, ["retrieval", "extraction", "drafting"], "attempt 1 runs 3 steps, dies on drafting")
    _expect(naive.ledger.side_effects, ["email:extraction-complete"], "the email went out before the failure")

    # The retry is a fresh run from the top: no memory of progress.
    naive2 = NaiveRunner()
    research_workflow(naive2, fail_on=None)
    _expect(naive2.ledger.executed, ["retrieval", "extraction", "drafting", "deliver"], "attempt 2 re-runs everything")
    total_naive = naive.ledger.cost + naive2.ledger.cost
    _expect(total_naive, 7, "7 step executions for a 4-step workflow")
    _expect(
        naive.ledger.side_effects + naive2.ledger.side_effects,
        ["email:extraction-complete", "email:extraction-complete"],
        "and the customer got the email TWICE",
    )

    print("2. Durable execution: only the gap re-runs")

    store = StepStore()
    d1 = DurableRunner("run-1", store)
    try:
        research_workflow(d1, fail_on="drafting")
    except RuntimeError:
        pass
    _expect(d1.ledger.executed, ["retrieval", "extraction", "drafting"], "attempt 1 executes 3 steps")
    _expect(sorted(k[1] for k in store.memo), ["__effect__extraction-complete", "extraction", "retrieval"], "2 results + 1 effect key checkpointed")

    d2 = DurableRunner("run-1", store)          # same run_id = same lineage
    out = research_workflow(d2, fail_on=None)
    _expect(d2.ledger.replayed, ["retrieval", "extraction"], "attempt 2 replays the completed steps")
    _expect(d2.ledger.executed, ["drafting", "deliver"], "and executes only what was missing")
    _expect(d2.ledger.side_effects, [], "the email is NOT sent again")
    _expect(out, "delivered:draft(DOC-A+DOC-B+DOC-C)#0", "the workflow still produces the right answer")

    total_durable = d1.ledger.cost + d2.ledger.cost
    _expect(total_durable, 5, "5 step executions instead of 7")
    _expect(total_naive - total_durable, 2, "2 LLM-shaped steps saved on a 4-step toy")

    print("3. Replay is not re-execution (why nondeterminism matters)")

    # Same run, replayed with a different nonce. A memoized step returns the
    # ORIGINAL value; a re-executed step would return a new one. On a real LLM
    # call that difference is the whole workflow's outcome.
    s = StepStore()
    a = DurableRunner("run-2", s)
    try:
        research_workflow(a, fail_on="deliver", nonce=1)
    except RuntimeError:
        pass
    first_draft = s.memo[("run-2", "drafting")]
    b = DurableRunner("run-2", s)
    research_workflow(b, fail_on=None, nonce=999)      # nonce changed!
    _expect(s.memo[("run-2", "drafting")], first_draft, "the memoized draft is unchanged despite a new nonce")
    _expect("#1" in first_draft, True, "it kept generation 1's output, not generation 999's")
    _expect(b.ledger.executed, ["deliver"], "only the failed step ran")

    print("4. Suspend and resume across processes")

    s2 = StepStore()
    p1 = DurableRunner("run-3", s2, events={})          # approval not in yet
    try:
        research_workflow(p1, with_wait=True)
        raise AssertionError("should have suspended")
    except Suspend as susp:
        _expect(susp.waiting_for, "editor.approved", "the run parks on the approval event")
    _expect(p1.ledger.executed, ["retrieval", "extraction"], "work up to the wait is done and saved")

    # The process dies. Everything we know is in the serialized store.
    blob = s2.snapshot()
    del s2, p1
    revived = StepStore.restore(blob)

    p2 = DurableRunner("run-3", revived, events={"editor.approved": {"by": "editor@example.com"}})
    out2 = research_workflow(p2, with_wait=True)
    _expect(p2.ledger.replayed, ["retrieval", "extraction"], "a fresh process replays the saved steps")
    _expect(p2.ledger.executed, ["approval", "drafting", "deliver"], "and continues from the wait")
    _expect(p2.ledger.side_effects, [], "the email is still not re-sent, across a process boundary")
    _expect(out2.startswith("delivered:"), True, "the workflow completes after the human replies")

    print("5. Idempotency is the property, not the retry count")

    # Hammer the same effect key 50 times across 10 fresh runner objects:
    # at-least-once delivery, exactly-once observable outcome.
    s3 = StepStore()
    sends = 0
    for _ in range(10):
        r = DurableRunner("run-4", s3)
        for _ in range(5):
            before = len(r.ledger.side_effects)
            r.side_effect("email:welcome", key="welcome-user-42")
            sends += len(r.ledger.side_effects) - before
    _expect(sends, 1, "50 attempts, 1 delivery")
    _expect(s3.writes, 1, "and exactly 1 checkpoint write")

    print("6. The store is the unit of durability")

    _expect(store.writes, 5, "run-1 wrote 4 step results + 1 effect key")
    round_trip = StepStore.restore(store.snapshot())
    _expect(round_trip.memo, store.memo, "the checkpoint survives serialization intact")


if __name__ == "__main__":
    _check()
    print("OK")
