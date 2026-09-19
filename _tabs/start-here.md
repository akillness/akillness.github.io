---
icon: fas fa-compass
order: 1
title: Start Here
description: A guided entry point to articles on AI agents, harness engineering, RAG, models, and game AI, organised by topic and format instead of by date.
mermaid: false
---

A reverse-chronological archive is not a way in. This page is the way in.

## If you have five minutes

The four posts that best show what this blog does — read one primary source properly, verify the claims, and report what actually held up:

- **[Ouroboros: The Agent OS That Hides the Answer Key From Its Own Workers](/posts/ouroboros-agent-os-spec-first-loop/)** — a spec-first agent OS where the grading command never reaches the worker. Includes a stdlib reimplementation of its two mathematical gates, plus one documentation defect found by reading the source instead of the docs.
- **[Twelve Concepts, One Missing Layer](/posts/twelve-agent-concepts-durable-execution/)** — worked through a 12-article agent curriculum and found the load-bearing layer missing from its own summary. Durable execution implemented and verified from scratch.
- **[Fable 5 Isn't a Faster Chat Model](/posts/fable-5-self-improving-agent-system/)** — the substrate for self-improving agents, read as a systems question rather than a benchmark race.
- **[Prompt Repetition: A Simple Trick That Improves LLM Accuracy](/posts/prompt-repetition-improves-llm-performance/)** — when a cheap trick genuinely works, and the narrow conditions where it stops working.

## By topic

### Agents & harness engineering

The main thread. Agent loops, tool dispatch, spec-first workflows, evaluation, and the scaffolding that decides whether an agent survives contact with production.

- [DeepSeek Harness: What If the Agent Loop Itself Were Just Another Plugin?](/posts/deepseek-harness-everything-is-a-plugin/)
- [jeo-code Puts Skills and Approval Gates Around Coding Agents](/posts/jeo-code-ai-builder-harness/) — includes video
- [One Memory Setup, Every Harness: Omnigent's Hindsight Bridge](/posts/omnigent-hindsight-universal-memory/)
- [OpenHarness Lets Its Allow List Outrank Your Deny Rules](/posts/openharness-permission-order-audit/)

→ [All agent posts](/categories/agents/)

### Retrieval & agent memory

Retrieval that survives real corpora: graph memory, agent-maintained knowledge bases, multimodal embeddings, and the seams where a memory layer meets a harness.

- [From RAG to Context Layer: Ontology, LLM Wiki, HyGRAG](/posts/ontology-graphrag-agent-memory/)
- [One Memory Setup, Every Harness: Omnigent's Hindsight Bridge](/posts/omnigent-hindsight-universal-memory/)
- [LLM Wiki: an agent-maintained knowledge base instead of another RAG stack](/posts/llm-wiki-persistent-knowledge-base/)
- [Multimodal Sentence Transformers: a practical upgrade for retrieval systems](/posts/multimodal-sentence-transformers-practical-guide/)

→ [Posts tagged agent memory](/tags/agentmemory/)

### Models & papers

Architectures read closely enough to explain, not just cite.

- [Diffusion Models, Visually: How Noise Becomes an Image](/posts/diffusion-model-visual-breakdown/)
- [FreeToken: 284B on a Gaming Desktop, 753B on One Workstation GPU](/posts/freetoken-edge-native-moe-serving/)
- [NPGA: tracking and rendering measured separately](/posts/npga-paper/)
- [LLM2Vec, Two Years On: The Thesis Won, the Recipe Did Not](/posts/llm2vec-embedding-models/)

→ [All research posts](/categories/research/)

### Infrastructure & production systems

What it takes to run this material rather than demo it.

- [Superlog: When Your Telemetry Stack Starts Investigating Incidents](/posts/superlog-agentic-telemetry/)
- [SQLite in Games: A Save File Is Never Just a File](/posts/sqlite-game-save-contract/)
- [Metal Cannot Preempt: What oMLX Rediscovers From Game Engines](/posts/omlx-metal-residency/)

→ [All tooling posts](/categories/tooling/)

### Multimodal, video & game AI

Coming from game AI, this is where I started: systems that read a screen and act on what they see, and the generative stacks that now feed game content.

- [MiniMax H3 LoRAs Are Not a Folder: A 19-Release Compatibility Audit](/posts/minimax-h3-lora-compatibility-audit/)
- [After Seedance 2.0, I Re-Audited Four AI Drama Stacks](/posts/seedance-2-ai-drama-stack-audit/)
- [CozyClay: AI Video Needed a Shot Contract, Not Another Prompt Box](/posts/cozyclay-shot-contract/)
- [Hugging Face's AI Game Development Course, Audited in 2026](/posts/game-development-with-ai-trying/) — includes video

→ [Posts tagged AI video](/tags/ai-video/)

### Developer tooling

- [Unity CLI: From Editor Installs to Verifiable Game-Production Work](/posts/unity-cli-production-workflows/)
- [Unity CLI Atomic Agent](/posts/unity-cli-atomic-agent/)
- [Antigravity CLI Migration: a production-minded checklist](/posts/antigravity-cli-migration-agy/)

→ [All tooling posts](/categories/developer-tools/)

## From projects to technical evidence

If you prefer to start with something I built rather than a topic label, use [Portfolio](/projects/). It connects production AI products, public agent tooling, multimodal QA research, and game automation to the articles and repositories that provide the technical trail. The separate [visual portfolio](/portfolio/) provides the full bilingual gallery and career timeline.

## By format

Different posts do different work. If you prefer one mode over another:

| Format | What it looks like | Examples |
| :--- | :--- | :--- |
| **Runnable code** | Companion `.py` files you can download and execute; every assertion in the post was produced by running them | [Ouroboros gates](/posts/ouroboros-agent-os-spec-first-loop/) · [Durable execution](/posts/twelve-agent-concepts-durable-execution/) · [Supertonic ONNX](/posts/supertonic-onnx-runtime-tts/) |
| **Video** | Embedded walkthroughs and demos | [jeo-code harness](/posts/jeo-code-ai-builder-harness/) · [MoneyPrinterTurbo control plane](/posts/moneyprinterturbo-production-control-plane/) · [AI game development course](/posts/game-development-with-ai-trying/) |
| **Diagrams** | Mermaid architecture and flow diagrams | [Prompt repetition](/posts/prompt-repetition-improves-llm-performance/) · [DeepSeek Harness](/posts/deepseek-harness-everything-is-a-plugin/) · [SQLite game saves](/posts/sqlite-game-save-contract/) |
| **Deep dives** | 2,500+ words, single subject, primary sources only | [Fable 5](/posts/fable-5-self-improving-agent-system/) · [TradingAgents and LibreChat](/posts/tradingagents-librechat-self-hosting-audit/) · [FreeToken](/posts/freetoken-edge-native-moe-serving/) |
| **Source audits** | One repository, paper, or release read at a pinned commit; what the README claims versus what the code does | [OpenHarness permission order](/posts/openharness-permission-order-audit/) · [HyperFrames determinism](/posts/hyperframes-determinism-audit/) · [Unity MCP drift check](/posts/unity-mcp-release-notes-drift-audit/) |

## How this blog works

A few conventions worth knowing before you read:

- **Primary sources over summaries.** When a post analyses a repository, I read the source, not only the README — and say so when the two disagree.
- **Code is executed, not illustrated.** Where a post claims code runs, the output shown is real output. Companion files are downloadable so you can check.
- **Findings are dated.** Star counts, version numbers, and benchmarks are recorded on the date noted. They will drift; the post says when it was true.
- **Mistakes get published too.** Several posts document where my own first calculation was wrong. That is the useful part.
- **AI assistance is disclosed site-wide.** AI can assist research, drafting, translation, diagrams, and code review. Scheduled audits may publish under standing approval after independent evidence review and automated checks, not per-page human approval. I remain accountable for the editorial rules and corrections. The [editorial method](/about/#editorial-method-and-ai-assistance) explains this boundary; AI output is never evidence by itself.
- **Legacy notes are reviewed separately.** Older reference posts without enough original analysis are removed from search and advertising until they are rewritten or retired.

## Publishing cadence

Active since 2024, publishing in research and project bursts. Cadence varies with a full-time engineering job and a PhD: bursts when a topic opens up, quieter when a project is consuming the week.

- [Full archive by date](/archives/)
- [All categories](/categories/)
- [All tags](/tags/)
- [RSS feed](/feed.xml)

## Who writes this

**Jang Young Jeong** — AI Product Engineer at Supercent, Ph.D. candidate in Game Engineering at Hongik University, 8 years of shipped AI at NCSOFT and Com2uS. Full background on [About](/about/); reach me via [Contact](/contact/).
