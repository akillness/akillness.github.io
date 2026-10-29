---
icon: fas fa-briefcase
order: 6
title: Portfolio
permalink: /projects/
description: A compact evidence map of AI products, agent tooling, multimodal QA, and game AI, with clear links to inspectable work and a visual portfolio.
---

The [visual portfolio](/portfolio/) is the gallery; this page is the evidence map. Each thread connects the problem, what I built, and evidence readers can inspect. Private data and unpublished work are clearly separated from public evidence.
{: .project-evidence-intro }

<nav class="project-quick-links" aria-label="Related pages">
  <a href="/portfolio/">Visual portfolio</a>
  <a href="/about/">About</a>
  <a href="/start-here/">Technical archive</a>
  <a href="/work-with-me/">Work with me</a>
</nav>

<p class="project-evidence-note"><strong>Evidence boundary.</strong> Shipped internal systems, public repositories, and published technical analysis are different evidence types.</p>

## Project map

<table class="project-evidence-table">
<thead>
<tr><th scope="col">Project thread</th><th scope="col">Problem, contribution, and evidence</th></tr>
</thead>
<tbody>
<tr>
<th scope="row"><a href="#project-side-projects">Recent side projects</a></th>
<td><strong>Problem:</strong> Apply evidence-aware workflows to distinct creative, game, and discovery problems.<br><strong>Built:</strong> Five independent projects developed alongside a shared agent-harness and skills practice.<br><strong>Evidence:</strong> <a href="#project-side-projects">Project details</a> and the <a href="/portfolio/">visual portfolio</a>.</td>
</tr>
<tr>
<th scope="row"><a href="#project-ai-products">AI products &amp; RAG</a></th>
<td><strong>Problem:</strong> Make private studio knowledge searchable, grounded, and operable.<br><strong>Built:</strong> Retrieval pipelines, agent workflows, product surfaces, and operational controls.<br><strong>Evidence:</strong> <a href="#project-ai-products">Project details</a>, <a href="/start-here/#retrieval--agent-memory">retrieval writing</a>, and the <a href="/portfolio/">visual portfolio</a>.</td>
</tr>
<tr>
<th scope="row"><a href="#project-agent-harness">Agent harness</a></th>
<td><strong>Problem:</strong> Help tool-using agents finish bounded work without hiding failure.<br><strong>Built:</strong> Execution loops, edit integrity, critic gates, reusable skills, and verification contracts.<br><strong>Evidence:</strong> <a href="https://github.com/akillness">Public repositories</a> and <a href="/categories/agents/">agent writing</a>.</td>
</tr>
<tr>
<th scope="row"><a href="#project-multimodal-qa">Multimodal QA</a></th>
<td><strong>Problem:</strong> Turn gameplay screenshots and video into reviewable QA signals.<br><strong>Built:</strong> CV, OCR, detection, VLM interpretation, and report workflows.<br><strong>Evidence:</strong> <a href="#project-multimodal-qa">Research details</a> and <a href="/start-here/#multimodal-video--game-ai">multimodal writing</a>.</td>
</tr>
<tr>
<th scope="row"><a href="#project-game-ai">Game AI &amp; automation</a></th>
<td><strong>Problem:</strong> Make game evaluation and production workflows reproducible.<br><strong>Built:</strong> Simulation agents, procedural systems, Unity tooling, and agent-driven builds.<br><strong>Evidence:</strong> <a href="#project-game-ai">Project details</a> and playable projects below.</td>
</tr>
</tbody>
</table>

## Recent side projects: one development practice, distinct products
{: #project-side-projects }

These five separate projects share a development-system context: **jeo** and **jeopi** explore spec-first planning and verification harnesses, while **jeo-skills** packages reusable skill contracts. That shared practice does not mean every runtime or provider is connected, or that every project is production-verified. The [visual portfolio](/portfolio/) includes their images and captured demonstrations.

### FrameForge Studio

A local/admin video-production hub carrying source-backed research through versioned storyboards, layout, optional generation, rendering, and human review. Its bounded workflows include version and paid-generation guards, output hashing, and approval tied to the reviewed output. The visual portfolio shows fixture-data UI captures; no public deployment is claimed.

### Ttoktak Brain (Echo Turn)

A portrait Unity puzzle where P follows the current command and Q repeats the previous accepted command; A/B plates open the exit. I built the turn-based puzzle with undo, restart, and optional guidance. Its visual portfolio image is a Unity Editor capture, not evidence of a device build.

### Wonder Scanner

A browser camera collection game that runs object recognition locally and turns everyday objects into 80 collectible Wonders. The scan, resonance, and capture loop includes a codex, album, quests, and a mobile-friendly fallback. [Open Wonder Scanner](https://wonderscanner.vercel.app/); the visual portfolio's UI sequence does not show a live camera scan.

### TRACE-RPG — The Sealed Lighthouse

A Godot turn-based investigation micro-RPG where generated events are proposals and deterministic symbolic commit gates decide canonical state. The work includes parsing, validation, bounded repair, and hash-linked receipts. The [dashboard](https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/) and [repository](https://github.com/akillness/neural_symbolic_in_game) provide public engineering evidence, not player efficacy or usability results.

### Notchima (놓치마)

A Korea-wide family-event discovery service with map search, five-axis filters, and source-backed listings. Its file-first pipeline ingests public APIs and web search, normalizes events, and builds JSON and SQLite indexes for a static UI. Explore the [app](https://happy-our-planning.vercel.app/) and [repository](https://github.com/akillness/happy-our-planning).

## AI products: retrieval in real workflows
{: #project-ai-products }

![SAGA RAG search engine operations interface](/assets/img/pages/portfolio/saga.jpg){: .w-100 .shadow .rounded-10 }
_SAGA connects retrieval quality to a product surface that a game studio can actually operate._
{: .project-image-caption }

At Supercent, I built AI products where retrieval was only the middle of the system. **SAGA** indexes 594 game-design documents and 1,563 vectors across 15 games, combining RAG-Fusion, CRAG, hybrid search, cross-encoder reranking, and a grounding-oriented generation pattern. **Millie** extends that direction into per-user knowledge operations and a Slack-driven local-agent system. **Brain** focuses on citation-first knowledge operations with incremental ingestion and connected editing workflows.

I extended retrieval into operational workflows: cited answers, incremental knowledge updates, connected sources, and agent-assisted actions. I see this progression from RAG search to a system teams can operate as groundwork for productizing AI agents, rather than a claim that retrieval alone makes an autonomous product.

The portfolio shows these as shipped products. The related writing explains the reusable engineering questions:

- [LLM2Vec, Two Years On](/posts/llm2vec-embedding-models/) checks an embedding paper's SOTA claim against its own leaderboard placement and two years of download data.
- [One Memory Setup, Every Harness](/posts/omnigent-hindsight-universal-memory/) reads a memory bridge at the seam where retrieval becomes shared agent state.

The practical lesson is that retrieval quality, permissions, observability, and user experience cannot be reviewed independently. A good answer is not enough if nobody can trace its source, correct the knowledge, or understand why the system chose a tool.

## Agent tooling: verification is part of the product
{: #project-agent-harness }

![jeo-code coding-agent harness](/assets/img/pages/portfolio/jeo-code.jpg){: .w-100 .shadow .rounded-10 }
_jeo-code is one part of a public tool family built around bounded execution and verification._
{: .project-image-caption }

My open-source agent work is public enough to inspect directly:

- [jeo-code](https://github.com/akillness/jeo-code) is a Bun-based coding-agent harness with a multi-provider tool loop, anchored-edit integrity, and a verify-before-done contract.
- [jeopi](https://github.com/akillness/jeopi) explores a critic-gated plan, execute, and verify spine.
- [jeo-skills](https://github.com/akillness/jeo-skills) packages reusable workflows across agent runtimes.
- [oh-my-jeo](https://github.com/akillness/oh-my-jeo) provides a spec-first workflow layer around chat agents.
- [jeo-claw](https://github.com/akillness/jeo-claw) connects Discord commands to bounded repository work.

The associated articles are not release announcements. They document design pressure and failure boundaries:

- [jeo-code Puts Skills and Approval Gates Around Coding Agents](/posts/jeo-code-ai-builder-harness/)
- [DeepSeek Harness: What If the Agent Loop Itself Were Just Another Plugin?](/posts/deepseek-harness-everything-is-a-plugin/)

I treat agent orchestration as earned complexity. One capable agent with clear tools and a visible completion contract is usually better than a large cast of agents with vague authority.

## Multimodal QA: evidence, not verdict
{: #project-multimodal-qa }

![AutoQA tooling running against a game screen](/assets/img/pages/portfolio/autoqa.jpg){: .w-100 .shadow .rounded-10 }
_AutoQA work combines classical vision, learned detectors, and language-based reporting rather than assuming one model can own the whole verdict._
{: .project-image-caption }

My graduate research and personal tooling connect image-based QA, OCR, multi-scale template matching, fine-tuned detection models, video context, and VLM-assisted bug reporting. The interesting problem is not whether a model can describe a frame. It is whether a team can turn visual observations into a reproducible QA workflow with known false negatives and reviewable evidence.

This thread includes an IEEE RAAI 2024 poster on image-based game QA automation and a 2025 publication on automated QA reporting from natural-language captions. The [multimodal, video and game AI section of Start Here](/start-here/#multimodal-video--game-ai) provides the wider technical context behind that work.

Internal data and unpublished research artifacts are not public evidence. Where I cannot share a dataset, customer document, or source repository, I state the boundary instead of replacing it with a stronger claim.
{: .prompt-warning }

## Game AI and automation: repeatable production
{: #project-game-ai }

![Castle War physics siege gameplay](/assets/img/pages/portfolio/castle-war.jpg){: .w-100 .shadow .rounded-10 }
_Castle War is a playable project, but the main experiment was the coding-agent-driven production workflow behind it._
{: .project-image-caption }

At NCSOFT and Com2uS, I worked on simulation-based difficulty evaluation, cellular-automata and GAN-based generation, reinforcement-learning prototypes, Unity-to-Python systems, and internal production tools. That experience shaped a simple bias: an AI feature is unfinished until the surrounding workflow is measurable and reproducible.

Recent public work carries that idea into build automation and agent-driven game production:

- [MCP for Unity Ships a Drift Check No Workflow Ever Runs](/posts/unity-mcp-release-notes-drift-audit/)
- [Castle War, playable build](https://jellyggumi.github.io/games/castle-war/)
- [Abyssal Lantern, playable build](https://akillness.github.io/hongT/)

The games matter, but so does the method: explicit build contracts, generated assets with review boundaries, repeatable verification, and honest reporting when the environment cannot complete a native build.

## How I make the writing inspectable

Search rankings, GitHub stars, and a polished screenshot are weak substitutes for evidence. My editorial contract is more specific:

1. **Who:** Every article is published under my name and links back to [About](/about/), where my production and research background is explicit.
2. **How:** Repository articles start from primary sources. When I claim code runs, I execute it or label the limitation. Version-sensitive findings are dated.
3. **Why:** The goal is to help engineers make a decision, reproduce a result, or avoid a failure mode. It is not to summarize every trending repository.
4. **Corrections:** Readers can report a mistake through [Contact](/contact/). I verify concrete corrections and update the article rather than silently preserving a stronger claim.

This does not make every post equally useful to every reader. It does make the origin, method, and boundary of the work visible.

## Further reading

<nav class="project-more-links" aria-label="More pages">
  <a href="/start-here/">Start Here</a>
  <a href="/resume_eng/">Resume</a>
  <a href="https://github.com/akillness">Public repositories</a>
  <a href="/work-with-me/">Work with Me</a>
  <a href="/contact/">Contact</a>
</nav>

<p class="project-evidence-closing">The visual portfolio records what I built; this page and the technical writing expose the reasoning, evidence, and open questions behind that work.</p>
