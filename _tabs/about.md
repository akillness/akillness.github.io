---
# the default layout is 'page'
icon: fas fa-info-circle
order: 5
mermaid: false
---

## AI Product Engineer Growing Out of Games, Research, and Real Systems

```text
AI Product Developer @ Supercent
Ph.D. Candidate in Game Engineering @ Hongik University
8 years across NCSOFT + Com2uS
```

![Overview](/assets/img/cover.png){: .light .shadow .rounded-10 }


---

### Curiosity -> Retrieve -> Innovation

I started in games because games force systems to be interactive, measurable, and brutally honest. If the AI is weak, players feel it. If the pipeline is slow, the team feels it. That environment shaped how I still build today.

My work began with game AI, procedural systems, digital humans, and computer-vision-based QA. Over time, that naturally expanded into a broader question: how do you turn research and experimentation into AI products people can actually use? That question is what now drives my work as an AI product engineer.

I still like the same loop:

- Start with a hard question.
- Retrieve signal from papers, product constraints, user behavior, and experiments.
- Turn that signal into a system that can survive production.

---

### What I Build Now

I am currently focused on AI products that need more than a good demo. I care about systems that can use tools, work with multimodal inputs, stay inspectable under failure, and improve through evaluation rather than intuition alone.

At Supercent I design and ship end-to-end AI products on top of multimodal-embedding RAG and agentic workflows. Two recent examples are internal Firebase/Genkit SaaS platforms I built in a matter of weeks:

- **SAGA** — a game-studio "AI brain": a RAG search engine over game design docs using RAG-Fusion, CRAG, hybrid search, Cross-Encoder reranking, and a Grounding-Guardian generation pattern, indexing 594 documents / 1,563 vectors across 15 games.
- **Millie** — a per-user RAG assistant plus a Slack-bot-driven, local-LLM "ClawTeam" autonomous-agent system, with an admin control hub for knowledge sources (Notion/Drive/Calendar), credentials, agent assignment, and LLM call-quality monitoring.

Beyond shipped products, I spend time on problems like:

- agent workflows that combine reasoning, tool use, and clear product boundaries
- multimodal QA pipelines that read gameplay, images, or video and turn them into useful reports
- harness engineering, tracing, and human-in-the-loop checks for agent reliability
- product surfaces where AI feels legible, not magical
- the overlap between interactive systems, wellness, robotics, and AI-native user experiences

---

### Why This Path Makes Sense

My background is not separate from this work. It is the reason I fit it.

At NCSOFT and Com2uS, I worked on game AI, balancing agents, procedural generation, and automation problems where feedback loops were tight and product quality mattered every day. In graduate research, I kept moving toward systems that observe what happened on screen, interpret it, and generate useful action from it. That line continues directly into current work on AI products, agents, and multimodal workflows.

The common thread is simple: build systems that can perceive context, make useful decisions, and help teams move faster without losing control.

---

### Current Direction

At Supercent, I am continuing that shift from specialized game AI into broader AI product development — owning internal AI products from concept to operation, improving reliability and discoverability, and establishing the AI-native collaboration standards used by product teams. Publicly visible work and activity around my profile also reflect where I am spending time now: context engineering, harness engineering, MCP-connected tools, local and open-model experiments, and practical multi-agent orchestration.

I am especially interested in the part of the ecosystem that is becoming more real and less theoretical:

- production agent stacks built around tools, tracing, and evals
- MCP as a standard way to connect models to tools, data, and workflows
- A2A-style interoperability for agent-to-agent collaboration
- interfaces that keep human review in the loop for higher-risk actions

I prefer starting with one capable agent and adding orchestration only when the problem truly earns the extra complexity.

---

### Open Source

I build and maintain a small family of agent-tooling projects in public:

- **[oh-my-jeo](https://github.com/akillness/oh-my-jeo)** — a spec-first workflow pack and deterministic contract layer wrapped around chat agents (Hermes runtime).
- **[jeo-code](https://github.com/akillness/jeo-code)** — a Bun-based coding-agent harness / CLI framework with a uniform multi-provider tool loop, anchored-edit integrity, and a verify-before-done loop.
- **[jeopi](https://github.com/akillness/jeopi)** — a spec-first fork of oh-my-pi/pi-mono with a critic-gated plan/execute/verify spine.
- **[jeo-skills](https://github.com/akillness/jeo-skills)** — a cross-platform agent-skills catalog for harness engineering, packaging reusable skills for coding agents.
- **[jeo-claw](https://github.com/akillness/jeo-claw)** — a Discord-controlled, dual-runtime agentic agent that updates repositories from chat commands.

---

### Selected Work

**AI Product Developer, Supercent (Dec 2025 - Present)**  
Shipped SAGA and Millie — two Firebase/Genkit internal SaaS platforms — built on multimodal-embedding RAG and agentic AI workflows, plus on-premise AI product operation and team-wide AI-native collaboration standards.

**AI Manager, SmartHome Tech, SK Intelix (Jul 2025 - Dec 2025)**  
Established AI feature compliance frameworks, tracked and shared Vision/LLM trends for NAMUHx Airsolution, owned TTS/STT collaboration, and delivered a real-time device-monitoring web frontend.

**Ph.D. Candidate, Hongik University (Sep 2024 - Present)**  
Researching game engineering with a focus on AutoQA tooling, VLM-based bug reporting, agentic workflows, RAG assistants, and lightweight on-device chatbots — the final twenty percent that turns a research concept into a working system.

**Recent research and publications**

- IEEE RAAI 2024 poster on image-based game QA automation
- 2025 publication on automated game QA reporting based on natural language captions
- patents in emotional computing and game difficulty determination

**Previous industry path**

- AI Programmer, NCSOFT (match-3 difficulty agents, CA/GAN level generation, 4D digital human pipelines)
- Game Programmer, Com2uS (DQN reinforcement-learning prototypes, Unity↔Python socket systems, internal tooling)

This path gave me a strong bias toward systems that are measurable, iterative, and useful under real constraints.

---

### How I Work

- I prototype early to learn where the real constraints are.
- I use research to sharpen direction, not to avoid shipping.
- I treat evaluation, traces, and failure analysis as product work, not cleanup.
- I care about clear interfaces because trust in AI systems is a UX problem as much as a model problem.
- I like fast feedback loops, small experiments, and systems that get better with use.

### Editorial Method and AI Assistance

I write and approve every page published under my name. I use AI tools for transcription, translation, first-pass diagrams, and code-review support, but I do not treat generated text as evidence. For technical claims I prefer primary documentation, tagged source code, runnable checks, and dated measurements. When a claim cannot be reproduced or sourced, I remove it or label it as an opinion or limitation.

Older reference notes are reviewed under the same standard. A post without enough original analysis is removed from search and advertising until it is rewritten or retired. Corrections can be reported through [Contact](/contact/) or the public Git history.

---

### Personal Activity

Outside formal work, I actively write and experiment in public.

- I run this AI tech blog as a place to connect research, tooling, and product practice.
- I have been exploring wellness, robotics, and AI through Wellflix and adjacent personal projects.
- I regularly study and document topics like Claude Code, Codex, context engineering, MCP, ACP, LSP, harness engineering, and long-running agent workflows.
- I also build and test multi-agent prototypes with local models, semantic routing, query expansion, and retrieval-heavy workflows.

This site is where those threads come together.

---

### Tech I Reach For

**Languages & ML**
Python | C | C++ | C# | Dart | PyTorch | TensorFlow | Transformers | OpenCV

**AI Stack**
LangGraph | LlamaIndex | RAG | Qdrant | ColBERT | PEFT/LoRA | ONNX | MCP

**Product & Infra**
Docker | Linux | GCP | AWS | Firebase | Genkit | WebSocket | PyQt | Flutter

**Current AI/Product Themes**
Agents | MCP | A2A | Evals | Tracing | Multimodal QA | Tool Use | Product Engineering

---

### Links

- [Portfolio guide](/projects/)
- [Visual portfolio](/portfolio/)
- [Resume](/resume_eng/)
- [LinkedIn](https://www.linkedin.com/in/akillness38/)
- [GitHub](https://github.com/akillness)
- [AI Tech Blog](https://akillness.github.io)
- [Naver Blog (Korean edition)](https://blog.naver.com/akillness)

If you are building AI products that need to be grounded in real workflows, multimodal inputs, or interactive systems, I am always interested in comparing notes.
