---
title: "RLM-FORGE: Why Evidence-Gated Recursion Matters More Than Recursive Hype"
description: "A practical review of Q00/rlm-forge and its core claim: recursion is only reliable when parent synthesis is constrained by deterministic evidence contracts."
date: 2026-05-01 10:00:00 +0900
categories: [AI, Systems]
tags: [RLM, Hermes, Ouroboros, TraceGuard, evaluation, hallucination, agent-runtime]
---

## The Question I Started With

Most “recursive agent” projects sound impressive, but I keep asking the same systems question:

**Does recursion itself improve trustworthiness, or do we just get more opportunities to hallucinate with a deeper call stack?**

That’s exactly why I dug into [`Q00/rlm-forge`](https://github.com/Q00/rlm-forge): not for model-size hype, but for runtime design clarity.

---

## What RLM-FORGE Actually Is

RLM-FORGE is explicitly **not** a new model architecture.  
It is a runtime scaffold that combines:

- **Ouroboros** as the outer recursion controller
- **Hermes Agent** as the bounded inner LM runtime
- **TraceGuard** as deterministic evidence validation at parent synthesis time

The architecture is simple but strict:

1. Outer scaffold decides recursion, scheduling, retries, and termination.
2. Inner Hermes calls return structured evidence.
3. Parent synthesis is accepted only if claims are backed by valid evidence handles.

That design boundary is the project’s strongest point.

---

## The Most Important Result (And Why It’s Honest)

The repo’s headline long-context fixture currently reports a **tie**:

- Vanilla single call: quality `1.00`
- Recursive RLM path: quality `1.00`
- Delta: `+0.00`

At first glance, that sounds underwhelming.  
In reality, it’s one of the most trustworthy things in this repo.

Earlier artifacts had shown a `+0.20` advantage, but the maintainers corrected the scorer: guarded statements like “LC-005 and LC-006 cannot be claimed” were previously miscounted as omitted-fact claims. The claim-aware scorer removed that false edge.

So the project does **not** hide behind inflated benchmark narrative. It reframes the contribution correctly:

> The win is runtime control and evidence enforcement, not a one-fixture quality gain.

---

## Why TraceGuard Is the Core Contribution

The strongest practical value in RLM-FORGE is **TraceGuard**.

From the documented demo:

- Safe parent synthesis → **ACCEPT**
- Omitted unsupported fact → **REJECT** (`unsupported_fact_id`)
- Chunk-only citation without fact evidence → **REJECT** (`chunk_handle_without_fact`)

This is crucial. Many pipelines only *measure* hallucination after generation.  
RLM-FORGE adds a deterministic gate that can reject unsupported parent claims **before** they become accepted state.

That turns “evaluation” into “runtime policy.”

---

## Contract Ablation: The Clean Systems Signal

The contract-ablation experiment is the most convincing part of the repository:

- `hermes_rlm_evidence_gated` → unsupported claim rate `0.0000`
- `hermes_rlm_without_gate` → unsupported claim rate `1.0000`

Same recursive shape, very different outcomes depending on evidence-gating.

This directly supports a precise claim:

**Recursion alone is insufficient.  
Evidence contracts are the mechanism that makes recursion operationally safe.**

---

## Portability Across Runtime Families

The live primary portability matrix reports 24/24 pass across three runtime families:

- Hermes+GLM
- Claude Code (Opus)
- Codex CLI (GPT-5.5 alias)

Again, this is framed as a systems portability claim, not SOTA quality bragging.  
That framing is right: it demonstrates the contract can survive adapter and provider variation.

---

## What I Like Most About This Project

1. **Boundary discipline**  
   Hermes does bounded work; Ouroboros owns recursion and state. Clear ownership reduces hidden coupling.

2. **Deterministic safety layer**  
   TraceGuard is auditable and replayable, unlike fuzzy “LLM judged itself” loops.

3. **Honest reporting**  
   Corrected tie result is retained instead of buried.

4. **Offline reproducibility path**  
   Replay and synthetic suites run without live API calls, lowering validation cost.

---

## Limits You Should Keep in Mind

- The live headline fixture is still a single controlled setup.
- Broader quality claims across tasks/models remain future work.
- Runtime safety ≠ universal factual correctness.
- Placeholder config links (e.g., custom endpoint example) are documentation scaffolding, not deployable endpoints.

---

## Practical Takeaway for Agent Engineers

If you are building recursive agent systems, copy this priority order:

1. Define evidence-bearing child outputs.
2. Make parent synthesis cite those handles.
3. Add deterministic rejection on unsupported claims.
4. Only then compare quality metrics.

RLM-FORGE’s most useful lesson is not “recursive is better.”  
It’s this:

**Recursive systems become trustworthy when recursion is constrained by enforceable evidence contracts.**

---

## Links Reviewed

- Repository: https://github.com/Q00/rlm-forge
- Architecture: https://github.com/Q00/rlm-forge/blob/master/docs/architecture.md
- Benchmark notes: https://github.com/Q00/rlm-forge/blob/master/docs/benchmark.md
- Hermes setup: https://github.com/Q00/rlm-forge/blob/master/docs/hermes-setup.md
- Live portability primary: https://github.com/Q00/rlm-forge/blob/master/experiments/live-portability-primary.md
- TraceGuard demo: https://github.com/Q00/rlm-forge/blob/master/experiments/traceguard-demo.md
- Contract ablation: https://github.com/Q00/rlm-forge/blob/master/experiments/unsupported-claim-rate-benchmark.md
- Claim-aware scorer suite: https://github.com/Q00/rlm-forge/blob/master/experiments/claim-aware-omitted-fact-suite.md
- Synthetic benchmark: https://github.com/Q00/rlm-forge/blob/master/experiments/synthetic-omitted-fact-benchmark.md
- Hermes install script: https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh
- Hermes config docs: https://hermes-agent.nousresearch.com/docs/user-guide/configuration
- OpenRouter key page: https://openrouter.ai/keys
