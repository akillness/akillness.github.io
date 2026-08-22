---
icon: fas fa-compass
order: 1
title: Start Here
description: A guided entry point to 294 posts on AI agents, harness engineering, RAG, models, and game AI — organised by topic and format instead of by date.
mermaid: false
---

294 posts in reverse-chronological order is an archive, not a way in. This page is the way in.

## If you have five minutes

The four posts that best show what this blog does — read one primary source properly, verify the claims, and report what actually held up:

- **[Ouroboros: The Agent OS That Hides the Answer Key From Its Own Workers](/posts/ouroboros-agent-os-spec-first-loop/)** — a spec-first agent OS where the grading command never reaches the worker. Includes a stdlib reimplementation of its two mathematical gates, plus one documentation defect found by reading the source instead of the docs.
- **[Twelve Concepts, One Missing Layer](/posts/twelve-agent-concepts-durable-execution/)** — worked through a 12-article agent curriculum and found the load-bearing layer missing from its own summary. Durable execution implemented and verified from scratch.
- **[Fable 5 Isn't a Faster Chat Model](/posts/fable-5-self-improving-agent-system/)** — the substrate for self-improving agents, read as a systems question rather than a benchmark race.
- **[Prompt Repetition: A Simple Trick That Improves LLM Accuracy](/posts/prompt-repetition-improves-llm-performance/)** — when a cheap trick genuinely works, and the narrow conditions where it stops working.

## By topic

### Agents & harness engineering — 116 posts

The main thread. Agent loops, tool dispatch, spec-first workflows, evaluation, and the scaffolding that decides whether an agent survives contact with production.

- [DeepSeek Harness: What If the Agent Loop Itself Were Just Another Plugin?](/posts/deepseek-harness-everything-is-a-plugin/)
- [jeo-code: The Harness Engine That Makes You a 10× AI Builder](/posts/jeo-code-ai-builder-harness/) — includes video
- [One Memory Setup, Every Harness: Omnigent's Hindsight Bridge](/posts/omnigent-hindsight-universal-memory/)
- [Agentic Engineering: 9 Skills](/posts/agentic-engineering-9-skills/)

→ [All agent posts](/categories/agent-orchestration/)

### RAG & retrieval — 25 posts

Retrieval that survives real corpora: reranking, hybrid search, graph memory, and the failure modes that only appear at scale.

- [Cognee: Building Persistent Memory for Multi-Agent Systems](/posts/cognee-multi-agent-memory-system/)
- [From RAG to Context Layer: Ontology, LLM Wiki, HyGRAG](/posts/ontology-graphrag-agent-memory/)
- [STORM Parse vs Google Gemini File Search](/posts/stormparse-vs-googleapi/)
- [RAG or Fine-Tuning? Fine-tuning embedding models for retrieval](/posts/finetune-embedding-model-rag/)

→ [All RAG posts](/categories/rag-search/)

### Models & papers — 62 posts

Architectures read closely enough to explain, not just cite.

- [Diffusion Models, Visually: How Noise Becomes an Image](/posts/diffusion-model-visual-breakdown/)
- [Building LLaMA 4 from Scratch: Mixture-of-Experts](/posts/building-llama-4-from-scratch-mixture-of-experts/)
- [LLM Inference Patterns](/posts/llm-inference-patterns/)
- [LLM Course — Let's build a simple LLM](/posts/llm-course-trying/)

→ [All model & paper posts](/categories/llm-model-papers/)

### Infrastructure & production systems — 11 posts

What it takes to run this material rather than demo it.

- [The Full MLOps Blueprint: Monitoring and Observability](/posts/mlops-monitoring-observability-part-a/)
- [The Production Generative AI Stack](/posts/production-generative-ai-stack-architecture-components/)
- [Signal-Decision Architecture: Semantic Routing at Scale](/posts/signal-decision-architecture/)

→ [All infrastructure posts](/categories/infrastructure-system/)

### Multimodal & vision — 10 posts

Coming from game AI, this is where I started: systems that read a screen and act on what they see.

- [3D Gaussian Splatting vs NeRFs: what is the difference?](/posts/nerf-3d-gaussian-splatting/)
- [3D Language Gaussian Splatting (LangSplat)](/posts/llm-3d-gaussian-splatting/) — includes video
- [The giant leaps of open-source vision models](/posts/vision-language-model/)

→ [All multimodal posts](/categories/multimodal-computer-vision/)

### Developer tooling — 8 posts

- [Unity CLI: From Editor Installs to Verifiable Game-Production Work](/posts/unity-cli-production-workflows/)
- [Unity CLI Atomic Agent](/posts/unity-cli-atomic-agent/)
- [Antigravity CLI Migration: a production-minded checklist](/posts/antigravity-cli-migration-agy/)

→ [All tooling posts](/categories/developer-tools/)

## By format

Different posts do different work. If you prefer one mode over another:

| Format | What it looks like | Examples |
| :--- | :--- | :--- |
| **Runnable code** | Companion `.py` files you can download and execute; every assertion in the post was produced by running them | [Ouroboros gates](/posts/ouroboros-agent-os-spec-first-loop/) · [Durable execution](/posts/twelve-agent-concepts-durable-execution/) · [Supertonic ONNX](/posts/supertonic-onnx-runtime-tts/) |
| **Video** | Embedded walkthroughs and demos — 21 posts carry video | [jeo-code harness](/posts/jeo-code-ai-builder-harness/) · [Gemini 3 multi-agent](/posts/gemini-3-multi-agent-comprehensive-guide/) · [SIMA 2 in 3D worlds](/posts/sima-2-gemini-powered-ai-agent-3d-worlds/) |
| **Diagrams** | Mermaid architecture and flow diagrams — 223 posts | [Production GenAI stack](/posts/production-generative-ai-stack-architecture-components/) · [Signal-decision architecture](/posts/signal-decision-architecture/) |
| **Deep dives** | 2,500+ words, single subject, primary sources only | [Fable 5](/posts/fable-5-self-improving-agent-system/) · [MLOps blueprint](/posts/mlops-monitoring-observability-part-a/) |
| **Async & performance** | Measurement-led, with numbers | [Why async code can be slower](/posts/async-code-performance-issues-solutions/) — includes video |

## How this blog works

A few conventions worth knowing before you read:

- **Primary sources over summaries.** When a post analyses a repository, I read the source, not only the README — and say so when the two disagree.
- **Code is executed, not illustrated.** Where a post claims code runs, the output shown is real output. Companion files are downloadable so you can check.
- **Findings are dated.** Star counts, version numbers, and benchmarks are recorded on the date noted. They will drift; the post says when it was true.
- **Mistakes get published too.** Several posts document where my own first calculation was wrong. That is the useful part.

## Publishing cadence

Active since 2024, with **294 posts** published. Recent months: 7 posts in August 2026, 2 in July, 7 in June, 12 in April, 21 in March, 43 in February. Cadence varies with a full-time engineering job and a PhD — bursts when a topic opens up, quieter when a project is consuming the week.

- [Full archive by date](/archives/)
- [All categories](/categories/)
- [All tags](/tags/)
- [RSS feed](/feed.xml)

## Who writes this

**Jang Young Jeong** — AI Product Engineer at Supercent, Ph.D. candidate in Game Engineering at Hongik University, 8 years of shipped AI at NCSOFT and Com2uS. Full background on [About](/about/); reach me via [Contact](/contact/).
