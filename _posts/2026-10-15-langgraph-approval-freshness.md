---
title: "A LangGraph Checkpoint Won't Expire Your Approval"
description: "LangGraph persists thread state, applies the latest graph to resumed threads, and waits indefinitely at interrupts. Bind approvals to action, policy, behavior, and expiry."
date: 2026-10-15 10:29:46 +0900
categories: [AI, Agents]
tags: [langgraph, human-in-the-loop, checkpoints, authorization, source-audit]
image_policy: source-first-fallback
image:
  path: /assets/img/posts/2026-10-15-langgraph-approval-freshness/approval-freshness-cover.png
  alt: "A paused LangGraph thread approved under one behavior and policy version reaches a freshness gate after deployment; stale approval is stopped before action."
---

## Can a saved approval survive a new deployment?

A checkpoint can preserve an interrupted thread for later. That does not mean the approval inside its saved state still describes the action that will run later.

The public recap for Daily Dose of Data Science's October 14 Part 6 says its reference project expires approvals by policy and records decisions in an audit table. The page marks the implementation as members-only, so I used only the public recap and did not access or reconstruct its ZIP. Instead, I checked the surrounding behavior against LangGraph's official Python documentation. The practical question is narrower than whether approvals should expire: **what exactly must remain unchanged for an old approval to be safe to resume?**

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-10-15-langgraph-approval-freshness/approval-freshness-cover.png" alt="A paused LangGraph thread approved under one behavior and policy version reaches a freshness gate after deployment; stale approval is stopped before action." />
  <figcaption>Original illustration by Aside, hand-authored SVG rendered locally as a PNG; it explains a proposed resume-time gate and is not source evidence.</figcaption>
</figure>

[View the editable SVG source.](/assets/img/posts/2026-10-15-langgraph-approval-freshness/approval-freshness-diagram.svg)

The docs expose a consequential gap between **state durability** and **authorization durability**. LangGraph says that a newly deployed graph is applied to every thread, including those resumed from checkpoints. Its interrupt mechanism saves graph state and waits indefinitely for input. Across LangGraph's backward-compatibility and interrupts guides, I found no documented guarantee that a prior human response is automatically invalidated when the behavior, application policy, or proposed action changes. This is a bounded observation about those two pages, not a claim that every integration lacks application-owned expiry.

## The checkpoint preserves state, not the old graph

LangGraph's [backward-compatibility guide](https://docs.langchain.com/oss/python/langgraph/backward-compatibility) makes the deployment behavior explicit: the latest graph runs against persisted state for existing threads, including threads resumed from a checkpoint. A checkpoint is not a frozen copy of the old Python code.

The guide separates two compatibility questions. **Technical compatibility** asks whether new code can load old state and still find the node where execution resumes. **Business compatibility** asks whether an old thread should continue the old decision logic even though the new graph is valid and correct for newly started threads. For example, a policy check inserted into a flow may be right for new requests but not intended to retroactively change a request already past triage.

LangGraph's recommended pattern is to record a behavioral version in state at thread start and branch on it. The docs warn to stamp that version before any branch that needs it. That is a strong foundation for old-versus-new flow behavior, but it is not yet an approval contract. A saved `approved = true` can still be detached from the exact action, rule set, or person that the application meant to approve.

The guide also distinguishes graph topology from node identity. Edges between existing nodes are not persisted in a checkpoint, while renaming or removing a node that a paused thread needs can break resume. That is a compatibility failure, not an authorization failure. Both matter during a rollout, but they need separate tests.

This extends the site's [earlier durable-execution audit](/posts/twelve-agent-concepts-durable-execution/), which compares retries, checkpoints, approval waits, and state-schema migration. The additional issue here is whether a persisted approval remains current after the policy or behavior that surrounds it has changed.

## An interrupt waits; it does not set an expiry

The [interrupts guide](https://docs.langchain.com/oss/python/langgraph/interrupts) says that `interrupt()` saves state through the persistence layer and waits indefinitely until the thread is resumed. It also says that the response passed to `Command(resume=...)` becomes the return value of the interrupt inside the node.

That is a continuation mechanism. It is not a time-to-live policy. An application may store an expiry timestamp beside the pending decision, but the timestamp must be checked by application logic before the side effect. If the user returns after the deadline, resuming the thread should route to a fresh approval request, not silently treat an old response as current.

There is a second resume detail with operational consequences: LangGraph restarts the node containing the interrupt from the beginning, so code before the interrupt runs again. The guide recommends making side effects idempotent. In an approval flow, that means persisting the exact proposed action before pausing, avoiding irreversible work before the approval gate, and rechecking the approval after resume. On `langgraph>=1.2.12`, the docs say a Pydantic model, `TypedDict`, or dataclass `response_schema` validates or coerces the resume value. A JSON Schema dictionary is exposed unchanged and does not validate that value, so check the framework version before relying on typed response validation. Shape validation cannot prove that the approver is still authorized or that the action and policy are unchanged.

## Treat approval as a lease on a particular action

I use “lease” as an application-design analogy, not as a LangGraph type. A decision is not a reusable boolean. It is a time-bounded permission for one principal to allow one specific action under one behavior version and one policy version.

| Bind the decision to | Why it matters at resume | Revalidate before execution |
| --- | --- | --- |
| Thread and request ID | Prevents a decision from being replayed against another conversation or request | Match the approval's identifiers to the loaded thread and pending request |
| Canonical action digest | A changed amount, destination, recipient, or tool argument is a different action | Recompute from every effectful field and compare the digest |
| Behavior version | A code change may alter how the action is interpreted or what happens next | Resolve the version this in-flight thread is still allowed to run under from trusted application configuration; do not compare two checkpoint fields that may both be stale |
| Policy version | A changed rule can make yesterday's decision insufficient today | Resolve the currently allowed policy version from application-owned policy configuration; ask again if its meaning changed |
| Expiry | A human decision can become stale while a thread waits | Use a trusted server clock and reject at or after the deadline |
| Approver identity and single-use state | A valid decision must belong to an authorized person and must not be replayed | Verify identity server-side, then atomically consume the decision before the effect |

The action digest must use a documented canonical representation. If a tool call includes a recipient, currency, account, or scope, those fields belong in the digest; hashing only a display label is not enough. The policy version must also change when the policy's meaning changes. Version numbers that never move create the appearance of a check without the substance.

A freshness predicate should run immediately before the side effect, not only when the approval is first recorded. If any binding no longer matches, fail closed and create a new interrupt with the current action and policy. A fresh decision should not be merged into an old one by retaining the original approval flag.

## A small resume guard, tested outside LangGraph

The following standard-library predicate assumes `current_context` was resolved from application-owned configuration for this in-flight thread. It demonstrates a minimum binding check; it does not load or prove that context itself. It is not a LangGraph runtime test, a production authorization system, or an atomic single-use mechanism. The complete script is included as a [downloadable Python file](/assets/img/posts/2026-10-15-langgraph-approval-freshness/approval-freshness-contract.py), with its [run record](/assets/img/posts/2026-10-15-langgraph-approval-freshness/approval-freshness-results.json).

```python
from datetime import datetime
from hashlib import sha256
import json


def action_digest(action):
    canonical = json.dumps(action, sort_keys=True, separators=(",", ":"))
    return sha256(canonical.encode("utf-8")).hexdigest()


def approval_is_current(state, approval, current_context, now):
    # Resolve this from trusted application configuration for this thread;
    # do not copy unchanged version fields from the checkpoint.
    try:
        expires_at = datetime.fromisoformat(approval["expires_at"])
        return (
            approval["thread_id"] == state["thread_id"]
            and approval["action_sha256"] == action_digest(state["pending_action"])
            and approval["behavior_version"] == current_context["behavior_version"]
            and approval["policy_version"] == current_context["policy_version"]
            and approval["consumed_at"] is None
            and now < expires_at
        )
    except (KeyError, TypeError, ValueError):
        return False
```

Before calling this predicate, the application must resolve `current_context` from authoritative configuration immediately before the side effect. It must decide whether an older behavior version remains allowed for this specific in-flight thread; if so, that version can remain in context, while a version no longer permitted forces reapproval. Do not construct `current_context` by copying unchanged version fields from the checkpoint. The synthetic cases hold the checkpoint state and saved approval fixed while changing the separately supplied authoritative context; they do not implement or test the resolver itself.

I ran the packaged script with Python 3.13.12 on October 15, 2026, at the clean worktree's base revision. All 11 synthetic cases passed: a matching approval remained current only for explicitly allowed versions; changed action, authoritative behavior or policy context, or thread ID was rejected; expired and exact-deadline approvals were rejected; and consumed, missing-digest, malformed-expiry, or incomplete-context records failed closed. The script imported no LangGraph, LangSmith, Postgres, model provider, or course code. This tests the predicate's behavior on hand-authored inputs, not framework behavior.

The `consumed_at` comparison in that pure function is not enough to prevent two workers from using the same decision at once. A production service needs an atomic claim or transaction and an idempotency key for the downstream effect. It also needs to verify the authenticated approver and resource ownership; the example deliberately does not implement those checks. A failed or timed-out external call may have succeeded, so the action's idempotency and reconciliation policy remain separate from approval freshness.

## Release tests and approval tests answer different questions

LangSmith describes [offline evaluations](https://docs.langchain.com/langsmith/evaluation) as tests on curated datasets for comparing versions and catching regressions, and [online evaluations](https://docs.langchain.com/langsmith/evaluation) as monitoring of production interactions. Those checks are useful for agent quality. They do not, by themselves, prove that a particular interrupted thread's human approval is still valid at the moment it resumes. That distinction is an inference from the documented evaluation scope, not a limitation claim about every custom evaluator.

A practical release test should create a thread under version 1, pause it with a specific action, deploy version 2, and resume the old checkpoint. Then assert the intended business behavior rather than only checking that the state deserializes. Include cases where the action digest changes, the policy version changes, the expiry boundary is reached, the approver lacks current authority, and two workers try to consume the same decision. Also keep a migration test for paused threads at renamed or removed nodes, because technical compatibility is a separate failure mode.

This is adjacent to the site's [Cloudflare OS approval audit](/posts/cloudflare-os-mcp-approvals-still-wait/), which examined whether specific MCP integration paths actually wait for a human decision. Here, the question is not which tool call waits. It is whether an approval that already waited is still the right approval for the resumed action.

## Key Takeaways

| Finding | Practical implication | Next step |
| --- | --- | --- |
| A checkpoint stores thread state, while LangGraph applies the latest deployed graph to resumed threads | State continuity does not freeze business behavior | Store a behavior version at thread start and test old threads after deployment |
| An interrupt can wait indefinitely | Waiting is not an expiry policy | Check an application-owned expiry before the side effect |
| Approval can outlive its original action or policy | A boolean can authorize more than the person reviewed | Bind approval to thread, action digest, behavior version, policy version, approver, and expiry |
| On `langgraph>=1.2.12`, typed response validation covers input shape, not authorization freshness | A valid payload may still be stale or unauthorized | Revalidate identity and decision bindings server-side on every resume |
| The local 11/11 result tests a synthetic predicate with a separately supplied context | It does not test LangGraph runtime, context resolution, or the members-only course project | Resolve authoritative in-flight policy before the effect, then test against the application's own persistence and approval service |

## New Questions

- Which business changes should preserve an old approval, and which should force a new decision even when the action digest is unchanged?
- Should an approval expire by elapsed time, policy version, risk tier, or a combination of all three?
- How should a service reconcile an external side effect when the approval was consumed but the response timed out?
- Can a release pipeline automatically find and resume representative interrupted threads from the previous graph version before deployment?

## References

### Primary documentation

- [LangGraph backward compatibility](https://docs.langchain.com/oss/python/langgraph/backward-compatibility), live documentation read October 15, 2026.
- [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts), live documentation read October 15, 2026.
- [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence), live documentation read October 15, 2026.
- [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), live documentation read October 15, 2026.
- [LangSmith evaluation](https://docs.langchain.com/langsmith/evaluation), live documentation read October 15, 2026.

### Discovery context and related articles

- [Daily Dose of Data Science, “Durable Agents with LangGraph and LangSmith”](https://www.dailydoseofds.com/ai-agents-with-langgraph-course-part-6-with-implementation/), published October 14, 2026. Public recap only; the member-only implementation and ZIP were not accessed.
- [Which of the Twelve Is Load-Bearing?](/posts/twelve-agent-concepts-durable-execution/), on durable execution and checkpoint/retry trade-offs.
- [Does the approve-later trick reach your MCP servers?](/posts/cloudflare-os-mcp-approvals-still-wait/), on integration-specific approval behavior.
