---
title: RAG papers list newest additions
description: "The April 2024 RAG paper-list update, expanded with per-category findings pinned to landmark papers: surveys, enhancement, retrieval, comparison, domain, evaluation, embeddings, and input processing."
categories: [RAG/Search]
tags: [rag, embedding, search]
date: 2024-05-12 21:29:00 +0800
published: true
ads: false
robots: noindex, follow
sitemap: false
---
# RAG papers list: April 2024 additions with per-category findings

The original note announced an update to a 60-plus-paper RAG reading list (Aishwarya Naresh Reganti's `awesome-generative-ai-guide`, research table spanning March 2023 to June 2026 as retrieved 2026-10-14) and listed eight topic tags with one-line glosses. A bare category list is exactly what a "low value content" flag targets: pointers without findings. This rewrite keeps the list reference and adds what each category contributes — one landmark result per category, pinned to primary sources. The post stays out of search and sitemaps under the retired contract (`robots: noindex, follow`, `sitemap: false`, ledger status retired); the remediation for AdSense here is quarantine, not indexation.

## The list and its scope

- Source list: <https://github.com/aishwaryanr/awesome-generative-ai-guide/blob/main/research_updates/rag_research_table.md> — per-paper summaries with topic tags and months, updated regularly; the concept itself traces to the seminal RAG paper (Lewis et al., arXiv:2005.11401, 2020).
- Coverage as retrieved: survey, enhancement, retrieval improvement, comparison, domain-specific, evaluation, embeddings, input processing, plus a framework lane.

## One landmark finding per category

**Survey.** Start with a systematization, not the newest paper. The agentic-RAG SoK (arXiv:2603.07379) formalizes retrieval-generation loops as finite-horizon POMDPs and names systemic risks — hallucination propagation, memory poisoning, retrieval misalignment — that every category below must answer.

**Enhancement.** LatentRAG (arXiv:2605.06285) moves reasoning and retrieval into continuous latent space, matching explicit agentic-RAG quality on multi-hop QA while cutting inference latency by about 90%. The lesson: language-mediated agent loops are not mandatory; latent coordination suffices where latency dominates.

**Retrieval improvement.** Direct Corpus Interaction (arXiv:2605.05242) drops embeddings, vector index, top-k, and retrieval APIs entirely — agents grep and read raw text — and beats semantic and sparse baselines across BRIGHT, BEIR, and multi-hop QA. The lesson: for agent-driven search the best retriever may be no retriever.

**Comparison.** The cyber-threat-intelligence evaluation (arXiv:2604.11419) compares vector, graph, hybrid graph-text, and agentic graph repair on the same corpora: hybrid graph-text gains up to 35% on multi-hop over vector-only, with agentic repair adding further wins. Compare architectures on shared corpora, not on isolated leaderboards.

**Domain-specific.** The clinical extraction deployment ACIE (arXiv:2606.19602, University Medicine Essen) shows standard RAG failing on temporal reasoning, cross-document dependencies, and missing metadata — and a grounded, clinician-verified pipeline reaching 96.5% acceptance over 7,326 judgments. Domain adaptation is metadata and workflow work, not just chunking.

**Evaluation.** The rewriter-gain audit (arXiv:2606.05633) tests whether LLM-rewriter F1 gains come from curation or from the gold answer leaking into context: removing the gold span drops F1 by 28–64 points beyond placebo. Evaluate the mechanism, not the headline number.

**Embeddings.** DREAM (arXiv:2606.24667) trains dense retrievers from a frozen LLM's next-token loss instead of labeled pairs and beats baselines across BEIR/RTEB at 0.5B–3B scales. Generation supervision replaces hand-labeled pairs where annotation is scarce.

**Input processing.** MCompassRAG (arXiv:2606.18508) enriches chunks with topic metadata in the same embedding space and distills from an LLM teacher: +8.24% information efficiency at 5x lower latency than the strongest efficient baselines, with no LLM calls at inference. Preprocessing is a latency lever, not just hygiene.

## How to use the list by use-case

- Latency-bound serving: enhancement (LatentRAG) plus input processing (MCompassRAG).
- Multi-hop enterprise corpora: comparison evidence first (hybrid graph-text), then agentic repair.
- Metadata-poor domains: domain playbook (ACIE) before tuning chunk size.
- Scarce labels: embeddings via generation supervision (DREAM).
- Any rewriter claim: run the intervention audit before trusting the F1 delta.

## Limitations

- This rewrite did not re-run any benchmark; all numbers are reported source claims as retrieved 2026-10-14 from the list and its linked abstracts.
- The linked table keeps growing (now through June 2026); category assignments above reflect the table's own tags.
- Landmark picks are editorial judgment for decision value, not a citation ranking.

## References

- RAG paper list (source table) — <https://github.com/aishwaryanr/awesome-generative-ai-guide/blob/main/research_updates/rag_research_table.md>
- Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401 — <https://arxiv.org/abs/2005.11401>
- SoK: Agentic RAG taxonomy (POMDP framing) — <https://arxiv.org/abs/2603.07379>
- LatentRAG — <https://arxiv.org/abs/2605.06285>
- Direct Corpus Interaction — <https://arxiv.org/abs/2605.05242>
- Graph vs vector RAG evaluation (CTI) — <https://arxiv.org/abs/2604.11419>
- ACIE clinical agentic RAG — <https://arxiv.org/abs/2606.19602>
- Rewriter-gain intervention audit — <https://arxiv.org/abs/2606.05633>
- DREAM embeddings — <https://arxiv.org/abs/2606.24667>
- MCompassRAG — <https://arxiv.org/abs/2606.18508>

