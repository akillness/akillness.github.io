---
icon: fas fa-handshake
order: 7
title: Work with Me
description: Paid, scoped reviews — AI agent/RAG architecture diagnosis, Unity CI and build-automation audits, and multimodal QA design review. What's included, who it fits, and how to start.
mermaid: false
---

This is separate from [Contact](/contact/). Contact is for corrections, questions about a specific post, and quick technical exchange; that stays free. This page is for teams that want a paid, scoped review of a system, from someone who has built the adjacent systems rather than read about them.

The [Portfolio](/projects/) maps these review areas to shipped products, public repositories, research work, and the technical writing behind them.

## What I review

### AI agent / RAG architecture diagnosis

A structured read of an existing or planned agent or retrieval system: where retrieval is silently wrong, where the agent loop is missing a verify-before-done gate, where tool-calling boundaries are unclear, and where evaluation is missing rather than "just not automated yet."

Grounded in **SAGA** and **Millie** — two internal RAG/agent platforms I designed and shipped at Supercent. SAGA is a RAG-Fusion + CRAG + hybrid-search + cross-encoder-reranking search engine over 594 game-design documents (1,563 vectors) across 15 games; Millie is a per-user RAG assistant plus a Slack-driven, local-LLM autonomous-agent system. See the [agent-orchestration posts](/categories/agent-orchestration/) for how I think about this in public.

**Output:** a written findings document — architecture diagram, ranked failure modes with evidence, and a prioritised fix list. No slide deck.

### Unity CI & build-automation audit

A review of a Unity project's build pipeline: CI configuration, Editor and module version pinning, licence-activation failure modes, cache correctness, and where a build is silently non-reproducible.

Grounded in production Unity engineering at Com2uS (Unity↔Python socket tooling) and NCSOFT, plus published work on [Unity CLI production workflows](/posts/unity-cli-production-workflows/) and the [Unity CLI atomic agent](/posts/unity-cli-atomic-agent/).

**Output:** an annotated list of pipeline failure points, a reproducibility checklist specific to the project, and concrete CI configuration changes.

### Multimodal QA design review

A review of a QA or test-automation design that reads screenshots, gameplay video, or other visual state and produces a verdict or report — the pipeline design, not a one-off model recommendation.

Grounded in Ph.D. research on VLM-based bug reporting and AutoQA tooling at Hongik University, an IEEE RAAI 2024 poster on image-based game QA automation, and a 2025 publication on automated QA reporting from natural-language captions. See the [multimodal & vision posts](/categories/multimodal-computer-vision/) for the public version of this thinking.

**Output:** a design review covering data flow, model and prompt choices, failure modes specific to visual QA (rare-state false negatives, caption drift), and what to measure before trusting the output.

## What this is not

- Not a sponsored post, backlink placement, or "guest post" — the policy on the [Contact](/contact/) page covers that and has not changed.
- Not a retainer or team augmentation. Each engagement is scoped, delivered, and closed.
- Not free consulting on a system I have not seen documented first.

## Who this fits

A small team (roughly 2-15 engineers) already shipping something — a live product, an internal tool, or a research prototype with real users or players — that wants an outside, technically literate read before committing more engineering time. If you are pre-idea or looking for a co-founder, this is not the right page; try [Contact](/contact/) instead.

## Format and how to start

Reviews run async by default: you send the system — docs, scoped repo access, logs, or a recorded walkthrough — and I return a written findings document, followed by one call to walk through it. Scope and turnaround are agreed before anything starts.

**Start here:** [akillness38@gmail.com](mailto:akillness38@gmail.com), or see [Contact](/contact/) for other channels. Include what the system does, what's worrying you about it, and any timeline constraint.
