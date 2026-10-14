---
title: "HarnessRouter Standardizes Tasks, Not Execution Guarantees"
description: "A pinned HarnessRouter audit separates instruction-based tool denial, remote cancellation and artifact delivery. Graphiti shows why memory strictness is caller-specific."
date: 2026-10-13 23:00:00 +0900
categories: [AI, Agents]
tags: [harnessrouter, agent-runtime, cancellation, graphiti, source-audit]
image_policy: source-first-fallback
image:
  path: /assets/img/posts/2026-10-13-harnessrouter-execution-contract/concept-illustration.png
  alt: "AI-generated conceptual illustration of disconnected teal cable connectors beside an amber disc, with a separate parcel conveyor behind them."
---

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-10-13-harnessrouter-execution-contract/concept-illustration.png" alt="AI-generated conceptual illustration of disconnected teal cable connectors beside an amber disc, with a separate parcel conveyor behind them." loading="lazy">
  <figcaption>AI-generated illustration by ChatGPT image generation via Aside. A disconnected-control metaphor beside a separate delivery path, not a runtime trace or an observed remote orphan. This is not source evidence.</figcaption>
</figure>

## What did the cancel button actually cancel?

An agent turn is cancelled. Is the remote worker now stopped, or did only the local driver stop waiting?

That is the sharper question behind the October 13 newsletter's introduction to HarnessRouter. A common API is useful, but the strongest finding in the inspected source is an adapter boundary: **Qoder's remote cancellation request can fail while its driver still emits a local `cancelled` result.** The diagnostic says the remote session may still be running.

That is not evidence that a remote orphan actually occurred. It is evidence that local state is not, by itself, a remote-stop receipt. A product that retries a side-effecting task needs to know the difference.

**Source Audit scope:** HarnessRouter commit `4b93d3b` and Graphiti commit `2f0fb35b`, both within the October 13 Korea-time cutoff. I inspected source, protocol documentation and selected test code. I did not start a router, call a coding provider, run the upstream tests, or execute a Graphiti ingestion pipeline. This is not a throughput or reliability benchmark.

## One endpoint, several execution owners

### The remote adapter changes the local-only story

At the pinned revision, Qoder is explicitly a remote backend. Its capability declaration sets `remote=true` and `environments=false`. The gateway's shared UHP discovery response advertises cancellation, files and environments, but an individual adapter's declaration still matters.

A useful fairness check is that HarnessRouter does not simply disregard these differences. Its model-resolution path pins a chosen harness to its backend and rejects a requested model that backend cannot serve. When no model is named, it can use the harness default. These are concrete routing checks, not proof that every displayed model is executable in a particular account.

Similarly, Responses-shaped task support is not identical to every Responses API semantic. The inspected UHP task contract accepts `tools` and `include` as reserved, ignored fields and reports ignored fields in metadata. Client-side function-tool orchestration should not be inferred from a familiar request envelope.

### A disabled tool can mean two different controls

The inspected implementation distinguishes enforcement modes. Codex and Hermes receive per-tool restrictions through standing instructions. Claude's path constructs `permissions.deny` configuration.

Those are not interchangeable controls. An instruction tells the runtime what it should avoid; a deny configuration provides a separate permission boundary. The source catalog itself distinguishes instruction-based and hard enforcement. I have not independently exercised either backend, so this audit establishes configuration construction, not successful denial under an adversarial prompt.

| Caller expectation | Pinned source finding | Evidence still needed before relying on it |
|---|---|---|
| A requested model runs | The chosen harness fixes its backend and validates the model against it | Account/provider availability and an actual selected-model receipt |
| A tool is disabled | Restriction construction differs by adapter | A test of the selected backend's actual enforcement |
| A familiar API field works | UHP reserves and ignores `tools` and `include` | Support for the specific client-side tool loop |
| A cancelled turn is stopped everywhere | The Qoder driver can finish locally after a failed remote cancel | Remote acknowledgement and a terminal-state read-back |
| Files listed are a live workspace | The normal list is built from a checkpoint; remote artifacts have their own delivery path | A receipt for the exact delivered bytes |

### Cancellation is a state transition, not a universal receipt

There is important protective code in the gateway. When the control store is enabled, response cancellation attempts a per-response monotonic terminal latch; errors from that attempt are caught. The durable-id immediate-stop branch requires the response's recorded `runner_turn_id` to match the live turn. Without the control store, a separate same-replica current-turn hint can authorize a stop. These branches aim to avoid stopping a newer turn sharing the session, but this audit did not test their runtime or cross-replica behavior.

The Qoder driver exposes a different boundary. In `cancel_remote`, a failed cancellation request returns a diagnostic containing “may still be running.” The SIGTERM handler then emits `result("cancelled", line)` with that diagnostic. The two source regions must be read together; the final state word alone loses information.

For a remote agent changing a repository or creating a cloud job, automatic re-execution while completion is unknown could duplicate work. That is a production risk inferred from the boundary, not a duplicate operation observed in this audit. The safer policy is to reconcile the same remote session before launching another side-effecting attempt.

### An artifact is not every file in the worker's scratch space

The normal session file listing returns user-visible files accumulated from the latest checkpoint. With `changed=true`, it lists captures associated with the most recent turn and distinguishes captured count from produced count. Neither mode should be described as a live filesystem scan or an unconditional inventory of everything a tool changed.

Qoder's remote files use `DeliverArtifacts`. The adapter checks for undelivered outputs and can nudge delivery. That is a deliberate delivery mechanism, not a reason to treat a remote scratch file as already present in the caller's local workspace. No remote task or artifact download was executed here.

### Graphiti adds a separate memory-admission boundary

The linked memory tutorial is relevant, but only if its promises are kept distinct from execution permissions. Remembering an instruction does not authorize a tool call.

In the inspected Graphiti resolver, `strict_edge_types` defaults to false. For a declared custom edge whose endpoint signature does not match, strict resolution drops it; non-strict resolution renames it to `RELATES_TO`. Names without a declared signature pass this particular signature check unchanged.

There is also a caller-level distinction. In `_extract_and_resolve_edges`, the flag is forwarded to extraction but not to `resolve_extracted_edges`, whose default remains false. The combined extraction path can filter relation names, and an inspected test mocks an unknown `SOLD_WITH` relation and expects only `INTEGRATES_WITH` to survive. That test was not executed and does not establish end-to-end endpoint-signature enforcement for every ingestion path.

Graphiti's temporal resolution is likewise conditional. It expires retrieved contradiction candidates only when the relevant temporal conditions are met, including an earlier `valid_at` than the new edge. Candidate retrieval, judgment and timestamps still matter. This source path does not support an unconditional “memory is never stale” guarantee.

None of this means that Graphiti is generally unsafe or that hosted Zep has the same limits and paths. It means that a typed ontology and temporal fields are inputs to a particular ingestion contract, not universal proof of truth, strictness or freshness.

## Make the execution boundary inspectable

The practical addition is a small contract carried alongside the common task response, not a second router. The following is a **proposed product record**, not HarnessRouter's existing schema:

```json
{
  "execution_owner": "remote",
  "local_turn_state": "cancelled",
  "remote_session_id": "retained-for-reconciliation",
  "cancel_requested": true,
  "remote_cancel_ack": "unknown",
  "remote_terminal_state": "unknown",
  "artifact_delivery": "not-confirmed",
  "automatic_reexecution": "blocked-pending-reconciliation"
}
```

Keep model availability, permission enforcement, task lifecycle and artifact delivery separate. For a game-build assistant, “the editor turn was cancelled” and “the remote build is stopped” are different facts. A generated archive also needs an exact-byte receipt before it can be treated as a delivered build.

![A proposed contract separates local cancellation, remote stop evidence and artifact delivery; Graphiti memory admission stays outside the permission boundary.](/assets/img/posts/2026-10-13-harnessrouter-execution-contract/execution-contract.svg)

*Original explanatory SVG. It summarizes inspected boundaries and a proposed record, not a live execution trace. It is not a qualifying source image; no source raster with verified commercial-reuse permission was obtained.*

Before adopting a backend, I would test four narrow questions:

1. Does a disabled tool fail under that adapter's actual enforcement mode?
2. After a lost cancel acknowledgement, can the same remote session be reconciled without creating a replacement task?
3. Does artifact delivery bind the selected run to complete file bytes, rather than a count or name alone?
4. For the actual Graphiti caller path, do a mismatched endpoint signature and a temporally conflicting fact behave as intended?

These are proposed acceptance tests. They were not run. A mock result would test the application's contract, not the remote provider's behavior.

This focus is deliberately different from [LLM inference rank topology](/posts/llm-inference-parallelism-layout/): routing an agent task is not partitioning model inference across GPUs. It also extends the distinction between [Jev ranking and answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/): a returned signal is not a permission or completion receipt.

## Key Takeaways

- HarnessRouter exposes useful routing and adapter distinctions; a common request shape does not erase them.
- The inspected Qoder path can report local cancellation without confirmed remote termination. No actual orphan was observed.
- Instruction-based restrictions, permission denial, checkpoint file lists and remote artifact delivery need separate tests.
- Graphiti strictness and temporal reconciliation depend on the inspected caller path. Do not generalize them to every API or hosted product.
- Record unknown remote completion as unknown. Reconcile before re-executing side-effecting work.

## New Questions

- What exact terminal-state receipt should each remote adapter expose after cancellation?
- Can permission tests distinguish instruction compliance from runtime denial without conflating the two?
- Which ingestion fixture catches a strictness flag that reaches extraction but not resolution?

## References

### Primary implementation and protocol

- [HarnessRouter pinned tree](https://github.com/HarnessRouter/harnessrouter/tree/4b93d3b25d9fc56e2e165449f6b54b2e726b1893).
- [Qoder remote cancellation diagnostic](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/runner/qoder_driver.py#L1060-L1068) and [local SIGTERM result](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/runner/qoder_driver.py#L1221-L1229).
- [Gateway response-cancellation guard](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/gateway/app.py#L10194-L10250).
- [Backend/model policy](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/gateway/app.py#L9273-L9280) and [Qoder capabilities](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/gateway/app.py#L16996-L17024).
- [Per-tool enforcement catalog](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/gateway/app.py#L16627-L16660).
- [UHP task fields and ignored-field behavior](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/protocol/versions/2026-10-04/tasks.md#L40-L55).
- [Checkpoint-based file listing](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/gateway/app.py#L10736-L10765) and [Qoder artifact delivery](https://github.com/HarnessRouter/harnessrouter/blob/4b93d3b25d9fc56e2e165449f6b54b2e726b1893/runner/qoder_driver.py#L984-L1027).
- [Graphiti pinned tree](https://github.com/getzep/graphiti/tree/2f0fb35b749f1ff17377892e099882176e453393).
- [Graphiti endpoint-signature resolution](https://github.com/getzep/graphiti/blob/2f0fb35b749f1ff17377892e099882176e453393/graphiti_core/utils/maintenance/edge_operations.py#L424-L439) and [strictness propagation](https://github.com/getzep/graphiti/blob/2f0fb35b749f1ff17377892e099882176e453393/graphiti_core/graphiti.py#L924-L984).
- [Combined extraction filtering](https://github.com/getzep/graphiti/blob/2f0fb35b749f1ff17377892e099882176e453393/graphiti_core/utils/maintenance/combined_extraction.py#L248-L260) and [conditional temporal expiration](https://github.com/getzep/graphiti/blob/2f0fb35b749f1ff17377892e099882176e453393/graphiti_core/utils/maintenance/edge_operations.py#L748-L783).

### Discovery context, not a runtime receipt

- Daily Dose of Data Science, October 13, 2026 email: HarnessRouter introduction, a Graphiti memory tutorial, and an inference-parallelism cross-promotion. Personal tracking links omitted.
- [The linked memory tutorial](https://www.dailydoseofds.com/agent-memory-is-only-as-good-as-its-structure/). Its broad reliability language is not adopted as a verified guarantee.

### Related Source Audits

- [LLM Inference Parallelism Is a Rank-Topology Problem](/posts/llm-inference-parallelism-layout/).
- [RAG vs Jev: Ranking Is Not Answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/).
