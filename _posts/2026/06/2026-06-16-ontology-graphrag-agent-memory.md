---
published: true
title: "GraphRAG, Agent Memory, and Business Ontology Do Different Jobs"
description: "HyGRAG retrieves evidence, an LLM Wiki preserves synthesized knowledge, and Genie Ontology supplies governed business semantics; their update and trust boundaries differ."
categories: [AI, Agents]
tags: [graphrag, agent-memory, genie-ontology, context-engineering]
date: 2026-06-16 10:00:00 +0900
last_modified_at: 2026-10-17 21:57:12 +0900
archive_developed: 2026-10-17
archive_development_note: "Re-read the June claims against dated AAIF and Databricks announcements, arXiv v1, and current Genie documentation. Corrected the date premise and separated retrieval, durable knowledge, and governed business semantics."
image:
  path: /assets/img/posts/2026-06-16-ontology-graphrag-agent-memory/context-layers.png
  alt: "Three distinct context jobs shown as evidence retrieval, persistent knowledge, and governed business semantics."
image_policy: source-first-fallback
mermaid: false
math: false
---
## What changes when a graph retrieves evidence, stores memory, or governs business terms?

HyGRAG, an LLM Wiki, and Databricks Genie Ontology can all be described as ways to give a model more context. That label hides the operational difference. HyGRAG builds a hierarchical index for finding evidence, as its [paper](https://arxiv.org/abs/2606.18075v1) describes. An LLM Wiki keeps synthesized knowledge available across sessions, a framing explored by the [Agentic AI Foundation](https://aaif.io/blog/karpathys-llm-wiki-as-agent-memory/). Genie Ontology combines inferred context with governed business definitions and permissions, according to [Databricks' current documentation](https://docs.databricks.com/aws/en/genie/genie-ontology). These are separate jobs with different update and trust boundaries, not three steps in one stack.

A team can compose them, but buying or building one does not automatically provide the other two. The useful design question is: **what artifact must stay authoritative after the model answers?** The answer points toward retrieval, persistent knowledge, governed semantics, or a separate action system.

<figure class="explanatory-image" width="1200" height="675">
<img src="/assets/img/posts/2026-06-16-ontology-graphrag-agent-memory/context-layers.png" alt="Three distinct context jobs shown as evidence retrieval, persistent knowledge, and governed business semantics." width="1200" height="675" loading="lazy" decoding="async">
<figcaption>Original illustration by Codex; not source evidence.</figcaption>
</figure>

[Editable SVG source](/assets/img/posts/2026-06-16-ontology-graphrag-agent-memory/context-layers.svg).

## What changed since the June 16 note

The restored note framed the three projects as evidence that separate teams had shipped the same idea on June 16. The source dates do not support that story. The [Agentic AI Foundation article](https://aaif.io/blog/karpathys-llm-wiki-as-agent-memory/) is dated June 8, 2026. [Databricks' announcement](https://www.databricks.com/blog/introducing-genie-one-genie-ontology-and-genie-agents) is dated June 16. HyGRAG's [arXiv v1 record](https://arxiv.org/abs/2606.18075v1) was submitted on June 16, but the paper is part of the [WWW '26 proceedings](https://doi.org/10.1145/3774904.3792720), whose conference dates were April 13–17.

Two June 16 timestamps are not evidence of coordination or a phase change. More importantly, the sources describe different problems. The LLM Wiki article is an interpretation of a persistent knowledge practice; HyGRAG is a retrieval method; Genie Ontology is a product context and semantics layer. Their dates do not turn those differences into a progression.

## How HyGRAG separates retrieval from index updates

HyGRAG organizes chunks and entity representations into a hierarchy. At query time, its context-aware and relation-aware retrieval assembles evidence for multi-hop questions. The paper describes a separate dynamic-update procedure that uses attachment-based local re-summarization to update affected index areas. The [v1 paper](https://arxiv.org/abs/2606.18075v1) and [pinned repository commit](https://github.com/zjunet/HyGRAG/tree/fa1a57e0e22e22e0dfd8da0676d36be4bbc52497) document these distinct retrieval and update paths. Retrieved evidence answers the current query; it is not a maintained record that an agent automatically remembers after the query ends.

The paper reports a 9.7% average gain on its multi-hop question-answering evaluation and a 12.2% gain on HotpotQA. These are author-reported results on public QA datasets, not measurements on game-support tickets or live-operations data. In a separate small check, the authors found hallucinated facts in 17 of 100 sampled MuSiQue summaries; with GPT-4o-mini re-summarization, that count fell to 7. This does not estimate an error rate on game content.

The [pinned repository README](https://github.com/zjunet/HyGRAG/tree/fa1a57e0e22e22e0dfd8da0676d36be4bbc52497) shows an incremental evaluation with a controlled 0.2 corpus-expansion ratio. That experiment helps inspect update behavior, but it does not establish readiness for ingesting weekly game patches.

## What an LLM Wiki preserves across sessions

Karpathy's [versioned gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f/ac46de1ad27f92b28ac95459c782c07f6b8c964a) describes a small knowledge-compilation loop: keep source material, update a wiki from it, and maintain a schema for the resulting pages. The [AAIF article](https://aaif.io/blog/karpathys-llm-wiki-as-agent-memory/) published June 8 interprets that pattern as persistent agent memory and discusses indexes and logs as navigation and maintenance aids.

The artifact that persists is synthesized knowledge with links back to source material. That can help an agent or teammate avoid rebuilding the same context on every session. It is not the same as a query-time retrieval index, and it does not by itself establish that a remembered statement is current, authorized, or correct. Those properties depend on source tracking, review, and the rules for updating the wiki.

The existing [LLM Wiki review](/posts/llm-wiki-persistent-knowledge-base/) covers the maintenance workflow in more depth. Here, the narrower point is that persistent knowledge answers a different question from graph retrieval: what should remain available after this task ends?

## Genie Ontology adds business semantics, not agent actions

Databricks [Genie Ontology documentation](https://docs.databricks.com/aws/en/genie/genie-ontology) describes a context layer that combines inferred snippets with governed semantics from Unity Catalog; the feature is marked Public Preview. Its [Pages documentation](https://docs.databricks.com/aws/en/uc-semantics/pages) describes human-modeled Pages with definitions and links to related assets that Genie Ontology can use. Automatic context assembly therefore does not mean the semantic layer exists without curation.

That distinction matters for trust. Databricks documentation describes inferred snippets, authority scores, and access controls. Pages contribute human-modeled definitions and links to related assets, while Unity Catalog governs access to data. Databricks [Genie Agents documentation](https://docs.databricks.com/aws/en/genie-agents/) describes curated datasets, SQL examples, and instructions, with external tools connected separately. Its [Genie MCP documentation](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp) says Unity Catalog permissions are enforced for the conversational tool. These related product surfaces do not make Genie Ontology a transaction system or an authorization boundary for arbitrary game actions.

Databricks [Genie One launch blog](https://www.databricks.com/blog/introducing-genie-one-genie-ontology-and-genie-agents) reports 84.5% first-attempt accuracy versus 52.4% for the strongest anonymized general-purpose coding agent, and 2× faster responses than that agent, on its internal 28-question suite. The questions, anonymized comparator, and evaluation setup are not public enough to reproduce this as an independent raw-RAG benchmark. Treat the figures as vendor-reported context for the announcement, not proof that Genie Ontology will improve a different workload by the same amount.

## Choose the layer by the artifact that must stay correct

The following map turns the source differences into a design choice. It is a selection aid, not a benchmark or a claim that one product can replace another.

| If the system must… | Start with… | The artifact to verify | Boundary to keep explicit |
|---|---|---|---|
| Find connected evidence across source documents | Graph retrieval such as HyGRAG | Retrieved passages, entity links, and index refresh results | Retrieval quality does not make the result durable memory |
| Carry accepted knowledge across sessions | A source-backed wiki or memory store | The maintained page, its source links, and its update history | Persistence does not guarantee freshness or permission |
| Interpret business data using stable terms and access rules | A governed semantic layer such as Genie Ontology | Curated definitions, governed data references, and permission checks | Semantics do not grant an agent permission to perform a separate action |
| Change player or account state | A separately governed action service or tool | Authorization decision, validated command, and audit record | A context source is not a write-control boundary |

For a game-studio support assistant, these layers could be composed: retrieve evidence from patch notes and resolved tickets, preserve reviewed operational knowledge in a wiki, and read authoritative player or season data through a governed semantic layer. If the assistant can grant currency, change entitlements, or ban an account, that write path still needs an explicit action service and audit boundary. Those are design proposals derived from the documented interfaces; they are not results from a deployed game system.

A practical pilot can start with three tests: does retrieval find the right evidence, does the maintained knowledge stay current after a source changes, and do permissions block a query that should not see a record? Measure those separately. A single answer-accuracy score can hide whether failure came from stale memory, weak retrieval, or access policy.

The earlier [GraphRAG overview](/posts/graphrag-opensource/) explains the graph-retrieval family. Read it alongside this comparison when the hard part is finding connected evidence; use the LLM Wiki review when the hard part is maintaining knowledge across sessions.

## Key Takeaways

- HyGRAG is a query-time retrieval method; its benchmark results do not predict performance on a game corpus.
- An LLM Wiki preserves synthesized knowledge, with freshness and correctness depending on its source and update process.
- Genie Ontology supplies business context and governed semantics; Databricks documents agent tools and actions as separate surfaces.
- A graph-shaped representation does not establish one architecture, shared release, or common permission model.
- Keep retrieval, persistence, semantic authority, and write permissions as separate testable decisions.

## New Questions

- Which source remains authoritative when a wiki summary conflicts with a live game database?
- How will a retrieval index expose stale or superseded patch notes?
- Which service owns authorization and audit for an agent's write action?
- Can the pilot report retrieval quality, knowledge freshness, and permission failures separately?

## References

### Papers and original technical artifacts

- HyGRAG, “A Unified Framework for Context-Aware and Relation-Aware Graph Retrieval-Augmented Generation,” arXiv v1, submitted June 16, 2026; WWW '26 proceedings. [arXiv v1](https://arxiv.org/abs/2606.18075v1); [ACM DOI](https://doi.org/10.1145/3774904.3792720). Retrieved 2026-10-17.
- HyGRAG repository, README and incremental-evaluation instructions at commit fa1a57e0e22e22e0dfd8da0676d36be4bbc52497. [Pinned commit](https://github.com/zjunet/HyGRAG/tree/fa1a57e0e22e22e0dfd8da0676d36be4bbc52497). Retrieved 2026-10-17.
- Andrej Karpathy, [LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f/ac46de1ad27f92b28ac95459c782c07f6b8c964a), revision ac46de1ad27f92b28ac95459c782c07f6b8c964a. Retrieved 2026-10-17.

### Official product sources

- Agentic AI Foundation, [Karpathy's LLM Wiki as Agent Memory](https://aaif.io/blog/karpathys-llm-wiki-as-agent-memory/), June 8, 2026. Retrieved 2026-10-17.
- Databricks, [Genie One announcement](https://www.databricks.com/blog/introducing-genie-one-genie-ontology-and-genie-agents), June 16, 2026. Internal 28-question evaluation and vendor-reported results. Retrieved 2026-10-17.
- Databricks, [Genie Ontology documentation](https://docs.databricks.com/aws/en/genie/genie-ontology), last updated September 11, 2026; Public Preview. Retrieved 2026-10-17.
- Databricks, [Pages documentation](https://docs.databricks.com/aws/en/uc-semantics/pages), last updated October 13, 2026. Retrieved 2026-10-17.
- Databricks, [Genie Agents documentation](https://docs.databricks.com/aws/en/genie-agents/), last updated October 7, 2026. Retrieved 2026-10-17.
- Databricks, [Genie One MCP documentation](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp), last updated October 16, 2026. Retrieved 2026-10-17.

### Related coverage

- [LLM Wiki: persistent knowledge and maintenance](/posts/llm-wiki-persistent-knowledge-base/), published 2026-04-05.
- [Open-source GraphRAG overview](/posts/graphrag-opensource/), published 2024-07-05.
