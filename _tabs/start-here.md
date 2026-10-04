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
- **[In my rerun, Headroom saved 0 tokens on its GSM8K eval prompts](/posts/headroom-gsm8k-prompts-saved-zero-tokens/)** — the seeded savings table reproduced to the last token, but the requests Headroom's own GSM8K and TruthfulQA eval generates passed through the default proxy byte-identical.
- **[diagram-design Hash-Locks Its Screenshots, Not Its Storefront](/posts/diagram-design-drift-audit/)** — all 78 screenshot digests recomputed byte-exactly against the pinned manifest, and the one drift no in-repo verifier can reach: a GitHub description that still says 38 types while the tree ships 39.

## By topic

### Agents & harness engineering

The main thread. Agent loops, tool dispatch, spec-first workflows, evaluation, and the scaffolding that decides whether an agent survives contact with production.

- [DeepSeek Harness: What If the Agent Loop Itself Were Just Another Plugin?](/posts/deepseek-harness-everything-is-a-plugin/)
- [jeo-code Puts Skills and Approval Gates Around Coding Agents](/posts/jeo-code-ai-builder-harness/) — includes video
- [One Memory Setup, Every Harness: Omnigent's Hindsight Bridge](/posts/omnigent-hindsight-universal-memory/)
- [OpenHarness Lets Its Allow List Outrank Your Deny Rules](/posts/openharness-permission-order-audit/)

→ [All agent posts](/categories/agents/)

### Retrieval & agent memory

Memory that has to survive real use: a shared memory layer across harnesses, concurrent agents writing to shared knowledge, and a forgetting fix checked against what its benchmark actually measured.

- [Twelve Concepts, One Missing Layer: graph memory and durable execution](/posts/twelve-agent-concepts-durable-execution/)
- [One Memory Setup, Every Harness: Omnigent's Hindsight Bridge](/posts/omnigent-hindsight-universal-memory/)
- [mini-AGI's forgetting fix is measured on reading, not on chat](/posts/mini-agi-forgetting-fix-reading-not-chat/)

### Models & papers

Architectures read closely enough to explain, not just cite.

- [LongCat-Video: The Continuation State Is the Product](/posts/longcat-video-stateful-continuation/)
- [FreeToken: 284B on a Gaming Desktop, 753B on One Workstation GPU](/posts/freetoken-edge-native-moe-serving/)
- [NPGA: tracking and rendering measured separately](/posts/npga-paper/)
- [LLM2Vec, Two Years On: The Thesis Won, the Recipe Did Not](/posts/llm2vec-embedding-models/)

→ [All research posts](/categories/research/)

### Infrastructure & production systems

What it takes to run this material rather than demo it.

- [TradingAgents and LibreChat Are Not Drop-In Replacements](/posts/tradingagents-librechat-self-hosting-audit/)
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

- [MCP for Unity Ships a Drift Check No Workflow Ever Runs](/posts/unity-mcp-release-notes-drift-audit/)
- [MEX on macOS Broke Before Project Memory Even Loaded](/posts/mex-macos-command-collision/)
- [CodeBurn's $15 hard cap denies tools when it could stop Claude](/posts/codeburn-guard-hard-cap-audit/)

→ [Posts tagged CI](/tags/ci/)

## From projects to technical evidence

If you prefer to start with something I built rather than a topic label, use [Portfolio](/projects/). It connects production AI products, public agent tooling, multimodal QA research, and game automation to the articles and repositories that provide the technical trail. The separate [visual portfolio](/portfolio/) provides the full bilingual gallery and career timeline.

## By format

Different posts do different work. If you prefer one mode over another:

| Format | What it looks like | Examples |
| :--- | :--- | :--- |
| **Runnable code** | Companion `.py` files you can download and execute; every assertion in the post was produced by running them | [Ouroboros gates](/posts/ouroboros-agent-os-spec-first-loop/) · [Durable execution](/posts/twelve-agent-concepts-durable-execution/) |
| **Video** | Embedded walkthroughs and demos | [jeo-code harness](/posts/jeo-code-ai-builder-harness/) · [MoneyPrinterTurbo control plane](/posts/moneyprinterturbo-production-control-plane/) · [AI game development course](/posts/game-development-with-ai-trying/) |
| **Diagrams** | Mermaid architecture and flow diagrams | [LongCat-Video continuation](/posts/longcat-video-stateful-continuation/) · [DeepSeek Harness](/posts/deepseek-harness-everything-is-a-plugin/) · [SQLite game saves](/posts/sqlite-game-save-contract/) |
| **Deep dives** | 2,500+ words, single subject, primary sources only | [Moli benchmark provenance](/posts/moli-benchmark-provenance-audit/) · [TradingAgents and LibreChat](/posts/tradingagents-librechat-self-hosting-audit/) · [FreeToken](/posts/freetoken-edge-native-moe-serving/) |
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
