---
title: "jeo-code: The Harness Engine That Makes You a 10× AI Builder"
description: "How a Bun-based AI coding agent plus 136 battle-tested skills turns any developer into a production AI builder — philosophy, workflow, and the full jeo-skills ecosystem."
categories: [AI, Agents]
tags: [jeo-code, jeo-skills, HarnessEngineering, AIBuilder, AgentWorkflow, ClaudeCode, OpenAI]
date: 2026-06-22 10:00:00 +0900
pin: true
mermaid: false
math: false
image:
  path: /assets/img/jeo-code/cover.png
  alt: "jeo-code — AI builder harness engine"
---

## ⚡ What If Your Coding Agent Had Its Own Skill Tree?

**The bottleneck is never raw intelligence — it's always the harness.** [jeo-code](https://github.com/akillness/jeo-code) is a spec-first, Bun-based AI coding agent that ships with **[jeo-skills](https://github.com/akillness/jeo-skills)** — 136 battle-tested skill modules that turn any developer into a 10× AI builder by encoding exactly what experts do, not just what LLMs guess.

> **Core question:** Can a coding agent with a built-in skill tree outperform raw LLM APIs by an order of magnitude? Yes — and this post shows exactly how.
{: .prompt-tip}

---

## 🏗️ jeo-code: The Engine

![jeo-code hero illustration](/assets/img/jeo-code/hero.png){: .w-100 .shadow .rounded-10 }

**jeo-code** (`jeo` on the CLI) is a pure-TypeScript, Bun-based AI coding agent with zero native dependencies. Run it inside any repository — it reads files, edits them, executes commands, and drives tasks to completion while streaming every step live in an inline TUI.

### The Five Harness Principles

<div style="margin:1.5rem 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 205" style="width:100%;border-radius:12px;display:block;">
  <rect width="900" height="205" fill="#0a0a14" rx="12"/>
  <defs>
    <marker id="h-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
    </marker>
    <marker id="h-loop" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#334155"/>
    </marker>
  </defs>
  <!-- Node A -->
  <rect x="12" y="58" width="150" height="72" rx="9" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <text x="87" y="86" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">🎯 Spec-First</text>
  <text x="87" y="106" text-anchor="middle" fill="#93c5fd" font-size="11" font-family="ui-monospace,monospace">deep-interview</text>
  <!-- Arrow A→B -->
  <line x1="162" y1="94" x2="178" y2="94" stroke="#475569" stroke-width="2" marker-end="url(#h-arr)"/>
  <!-- Node B -->
  <rect x="178" y="58" width="150" height="72" rx="9" fill="#4c1d95" stroke="#8b5cf6" stroke-width="2"/>
  <text x="253" y="86" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">📋 Reviewed Plans</text>
  <text x="253" y="106" text-anchor="middle" fill="#c4b5fd" font-size="11" font-family="ui-monospace,monospace">ralplan</text>
  <!-- Arrow B→C -->
  <line x1="328" y1="94" x2="344" y2="94" stroke="#475569" stroke-width="2" marker-end="url(#h-arr)"/>
  <!-- Node C -->
  <rect x="344" y="58" width="150" height="72" rx="9" fill="#78350f" stroke="#f59e0b" stroke-width="2"/>
  <text x="419" y="86" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">🔒 Gated Exec</text>
  <text x="419" y="106" text-anchor="middle" fill="#fde68a" font-size="11" font-family="ui-monospace,monospace">jeo approve</text>
  <!-- Arrow C→D -->
  <line x1="494" y1="94" x2="510" y2="94" stroke="#475569" stroke-width="2" marker-end="url(#h-arr)"/>
  <!-- Node D -->
  <rect x="510" y="58" width="150" height="72" rx="9" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
  <text x="585" y="86" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">✅ Honest Verify</text>
  <text x="585" y="106" text-anchor="middle" fill="#6ee7b7" font-size="11" font-family="ui-monospace,monospace">ultragoal</text>
  <!-- Arrow D→E -->
  <line x1="660" y1="94" x2="676" y2="94" stroke="#475569" stroke-width="2" marker-end="url(#h-arr)"/>
  <!-- Node E -->
  <rect x="676" y="58" width="150" height="72" rx="9" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
  <text x="751" y="86" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">🔄 Self-Correct</text>
  <text x="751" y="106" text-anchor="middle" fill="#fca5a5" font-size="11" font-family="ui-monospace,monospace">post-edit hooks</text>
  <!-- Loopback -->
  <path d="M 751 130 Q 751 172 450 172 Q 149 172 87 130" stroke="#334155" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#h-loop)"/>
  <text x="450" y="188" text-anchor="middle" fill="#475569" font-size="10" font-family="ui-sans-serif,sans-serif" letter-spacing="1">↻ new task cycle</text>
</svg>
</div>

| Principle | What It Means | Why It Matters |
|:----------|:--------------|:---------------|
| **Spec-First** | `deep-interview` Socratic gate before any code | No wasted cycles on ambiguous tasks |
| **Reviewed Plans** | `ralplan` critic subagent whose `[OKAY]` is persisted and *required* | Real consensus, not theater |
| **Gated Execution** | `jeo approve` blocks until you explicitly confirm | You stay in control |
| **Honest Verification** | `ultragoal` runs real suites — never fabricates passes | Trust the output |
| **Self-Correcting Loop** | Post-edit hooks (tsc / eslint / tests) feed diagnostics back | Bugs fixed in-loop |

### Multi-Provider, One Loop

<div style="margin:1.5rem 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 280" style="width:100%;border-radius:12px;display:block;">
  <rect width="820" height="280" fill="#0a0a14" rx="12"/>
  <defs>
    <marker id="mp-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
    </marker>
  </defs>
  <!-- jeo box -->
  <rect x="18" y="100" width="118" height="72" rx="10" fill="#1e3a5f" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="77" y="130" text-anchor="middle" fill="#fff" font-size="18" font-weight="900" font-family="ui-sans-serif,sans-serif">🤖 jeo</text>
  <text x="77" y="150" text-anchor="middle" fill="#93c5fd" font-size="11" font-family="ui-monospace,monospace">agent</text>
  <!-- Providers -->
  <rect x="192" y="14" width="160" height="46" rx="8" fill="#1e1040" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="272" y="34" text-anchor="middle" fill="#c4b5fd" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">Anthropic Claude</text>
  <text x="272" y="52" text-anchor="middle" fill="#8b5cf6" font-size="10" font-family="ui-monospace,monospace">claude-3.5 / claude-4</text>
  <rect x="192" y="78" width="160" height="46" rx="8" fill="#052e16" stroke="#22c55e" stroke-width="1.5"/>
  <text x="272" y="98" text-anchor="middle" fill="#86efac" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">OpenAI + Codex</text>
  <text x="272" y="116" text-anchor="middle" fill="#4ade80" font-size="10" font-family="ui-monospace,monospace">gpt-4o / o3</text>
  <rect x="192" y="142" width="160" height="46" rx="8" fill="#1c1917" stroke="#f97316" stroke-width="1.5"/>
  <text x="272" y="162" text-anchor="middle" fill="#fed7aa" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">Antigravity</text>
  <text x="272" y="180" text-anchor="middle" fill="#fb923c" font-size="10" font-family="ui-monospace,monospace">agy CLI</text>
  <rect x="192" y="206" width="160" height="46" rx="8" fill="#0f172a" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="272" y="226" text-anchor="middle" fill="#bfdbfe" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">Ollama (local)</text>
  <text x="272" y="244" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="ui-monospace,monospace">free · no API key</text>
  <!-- jeo → providers -->
  <line x1="136" y1="124" x2="192" y2="37" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="136" y1="132" x2="192" y2="101" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="136" y1="148" x2="192" y2="165" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="136" y1="156" x2="192" y2="229" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <!-- Tool Loop -->
  <rect x="408" y="96" width="152" height="82" rx="10" fill="#312e81" stroke="#6366f1" stroke-width="2.5"/>
  <text x="484" y="130" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">🛠️ Uniform</text>
  <text x="484" y="150" text-anchor="middle" fill="#a5b4fc" font-size="12" font-family="ui-sans-serif,sans-serif">JSON Tool Loop</text>
  <!-- providers → Tool Loop -->
  <line x1="352" y1="37" x2="408" y2="118" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="352" y1="101" x2="408" y2="130" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="352" y1="165" x2="408" y2="148" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="352" y1="229" x2="408" y2="158" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <!-- Tools -->
  <rect x="616" y="14" width="130" height="46" rx="8" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="681" y="41" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">✏️ Edit Files</text>
  <rect x="616" y="78" width="130" height="46" rx="8" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="681" y="105" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">▶ Run Commands</text>
  <rect x="616" y="142" width="130" height="46" rx="8" fill="#4c1d95" stroke="#8b5cf6" stroke-width="1.5"/>
  <text x="681" y="169" text-anchor="middle" fill="#c4b5fd" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">📖 Read Codebase</text>
  <rect x="616" y="206" width="130" height="46" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.5"/>
  <text x="681" y="233" text-anchor="middle" fill="#fca5a5" font-size="13" font-weight="bold" font-family="ui-sans-serif,sans-serif">✅ Verify Results</text>
  <!-- Tool Loop → tools -->
  <line x1="560" y1="118" x2="616" y2="37" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="560" y1="130" x2="616" y2="101" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="560" y1="148" x2="616" y2="165" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
  <line x1="560" y1="158" x2="616" y2="229" stroke="#475569" stroke-width="1.5" marker-end="url(#mp-arr)"/>
</svg>
</div>

One agent loop, every major LLM. Switch providers with `/provider login <name>` from the input box — the choice persists as the new default.

### The TUI That Doesn't Get in Your Way

```bash
jeo                                    # interactive agent in your repo
jeo "refactor auth module + run tests" # one-shot
jeo --tmux                             # isolated tmux session
jeo doctor                             # check config + model connection
```

| Action | Shortcut |
|--------|----------|
| Slash command palette | `/` + Tab |
| Run a skill workflow | `$<skill> [intent]` |
| Direct shell command | `!<command>` |
| Recall previous queries | `↑ / ↓` (persisted in `.jeo/input-history`) |
| Expand last response | `Ctrl+O` |
| Paste clipboard image | `Ctrl+V` |

---

## 📺 See It In Action

<video src="/assets/img/jeo-code/jeo-code-promo.mp4" controls muted playsinline width="100%" style="border-radius:12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); margin: 1.5rem 0;"></video>

> Full demo and install guide → [docs/usage-guide.md](https://github.com/akillness/jeo-code/blob/main/docs/usage-guide.md)

And here is the **Remotion-animated promo** rendered as React code — 4 scenes, 300 frames at 30fps, 1920×1080:

<video src="/assets/img/jeo-code/jeo-promo-remotion.mp4" controls muted playsinline width="100%" style="border-radius:12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); margin: 1.5rem 0;"></video>

> Remotion source → [`tools/jeo-promo-video/src/JeoPromo.tsx`](https://github.com/akillness/akillness.github.io/tree/main/tools/jeo-promo-video)

---

## 🚀 jeo-skills: Where It Gets Formidable

![jeo skills ecosystem](/assets/img/jeo-code/skills-ecosystem.png){: .w-100 .shadow .rounded-10 }

The harness engine alone is powerful. **[jeo-skills](https://github.com/akillness/jeo-skills)** is a curated library of **136 installable skill folders**. Each skill is a `SKILL.md` that tells the agent exactly which tools to use, which patterns to apply, and which route-outs to respect — so the agent stops guessing and starts shipping.

> **[⭐ Star jeo-skills on GitHub →](https://github.com/akillness/jeo-skills)**

### Install Any Skill in One Command

```bash
# Install a specific skill
npx skills add https://github.com/akillness/jeo-skills --skill scrapling

# Install the whole library at once
git clone https://github.com/akillness/jeo-skills.git && bash jeo-skills/install.sh
```

### The Skill Ecosystem Map

<div style="margin:1.5rem 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 490" style="width:100%;border-radius:12px;display:block;">
  <rect width="900" height="490" fill="#0a0a14" rx="12"/>
  <defs>
    <marker id="eco-arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
      <polygon points="0 0, 7 2.5, 0 5" fill="#334155"/>
    </marker>
  </defs>

  <!-- Row 1: Core, Research, Build -->

  <!-- Core -->
  <rect x="15" y="15" width="265" height="200" rx="10" fill="#0d1f3c" stroke="#3b82f6" stroke-width="2"/>
  <text x="147" y="44" text-anchor="middle" fill="#60a5fa" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">🏗️ Core Orchestration</text>
  <line x1="30" y1="54" x2="265" y2="54" stroke="#1e3a8a" stroke-width="1"/>
  <text x="30" y="78" fill="#93c5fd" font-size="12" font-family="ui-monospace,monospace">ooo         spec-first workflow</text>
  <text x="30" y="100" fill="#93c5fd" font-size="12" font-family="ui-monospace,monospace">bmad        planning agent</text>
  <text x="30" y="122" fill="#93c5fd" font-size="12" font-family="ui-monospace,monospace">plannotator review &amp; annotate</text>
  <text x="30" y="144" fill="#93c5fd" font-size="12" font-family="ui-monospace,monospace">team        parallel executors</text>
  <text x="30" y="166" fill="#93c5fd" font-size="12" font-family="ui-monospace,monospace">ultrawork   deep work mode</text>
  <text x="30" y="188" fill="#93c5fd" font-size="12" font-family="ui-monospace,monospace">autopilot   hands-free loop</text>

  <!-- Research -->
  <rect x="318" y="15" width="265" height="200" rx="10" fill="#0a2318" stroke="#10b981" stroke-width="2"/>
  <text x="450" y="44" text-anchor="middle" fill="#34d399" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">🔬 Research &amp; Knowledge</text>
  <line x1="333" y1="54" x2="568" y2="54" stroke="#064e3b" stroke-width="1"/>
  <text x="333" y="78" fill="#6ee7b7" font-size="12" font-family="ui-monospace,monospace">deep-dive   causal hypotheses</text>
  <text x="333" y="100" fill="#6ee7b7" font-size="12" font-family="ui-monospace,monospace">llm-wiki    durable memory</text>
  <text x="333" y="122" fill="#6ee7b7" font-size="12" font-family="ui-monospace,monospace">autoresearch  ML search</text>
  <text x="333" y="144" fill="#6ee7b7" font-size="12" font-family="ui-monospace,monospace">scrapling   adaptive scraping</text>
  <text x="333" y="166" fill="#6ee7b7" font-size="12" font-family="ui-monospace,monospace">graphify    knowledge graph</text>

  <!-- Build -->
  <rect x="621" y="15" width="265" height="200" rx="10" fill="#1a0e3c" stroke="#8b5cf6" stroke-width="2"/>
  <text x="753" y="44" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">⚙️ Build &amp; Verify</text>
  <line x1="636" y1="54" x2="871" y2="54" stroke="#4c1d95" stroke-width="1"/>
  <text x="636" y="78" fill="#c4b5fd" font-size="12" font-family="ui-monospace,monospace">tdd          test-driven dev</text>
  <text x="636" y="100" fill="#c4b5fd" font-size="12" font-family="ui-monospace,monospace">ultraqa      honest test suite</text>
  <text x="636" y="122" fill="#c4b5fd" font-size="12" font-family="ui-monospace,monospace">debugging    root-cause loops</text>
  <text x="636" y="144" fill="#c4b5fd" font-size="12" font-family="ui-monospace,monospace">code-review  critic subagent</text>
  <text x="636" y="166" fill="#c4b5fd" font-size="12" font-family="ui-monospace,monospace">spec-kit     acceptance gates</text>

  <!-- Row 2: Media, Platform, Game -->

  <!-- Media -->
  <rect x="15" y="258" width="265" height="200" rx="10" fill="#271607" stroke="#f59e0b" stroke-width="2"/>
  <text x="147" y="287" text-anchor="middle" fill="#fbbf24" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">🎬 Media &amp; Visual</text>
  <line x1="30" y1="297" x2="265" y2="297" stroke="#78350f" stroke-width="1"/>
  <text x="30" y="321" fill="#fde68a" font-size="12" font-family="ui-monospace,monospace">remotion-video  React video</text>
  <text x="30" y="343" fill="#fde68a" font-size="12" font-family="ui-monospace,monospace">god-tibo-imagen AI images</text>
  <text x="30" y="365" fill="#fde68a" font-size="12" font-family="ui-monospace,monospace">slides-grab     capture slides</text>
  <text x="30" y="387" fill="#fde68a" font-size="12" font-family="ui-monospace,monospace">open-design     design export</text>

  <!-- Platform -->
  <rect x="318" y="258" width="265" height="200" rx="10" fill="#091624" stroke="#60a5fa" stroke-width="2"/>
  <text x="450" y="287" text-anchor="middle" fill="#7dd3fc" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">☁️ Platform &amp; Deploy</text>
  <line x1="333" y1="297" x2="568" y2="297" stroke="#0c2a4a" stroke-width="1"/>
  <text x="333" y="321" fill="#bae6fd" font-size="12" font-family="ui-monospace,monospace">supabase     db + auth</text>
  <text x="333" y="343" fill="#bae6fd" font-size="12" font-family="ui-monospace,monospace">firebase     ai-logic</text>
  <text x="333" y="365" fill="#bae6fd" font-size="12" font-family="ui-monospace,monospace">vercel-deploy  serverless</text>
  <text x="333" y="387" fill="#bae6fd" font-size="12" font-family="ui-monospace,monospace">git-workflow  branch guard</text>

  <!-- Game -->
  <rect x="621" y="258" width="265" height="200" rx="10" fill="#160e2a" stroke="#a78bfa" stroke-width="2"/>
  <text x="753" y="287" text-anchor="middle" fill="#c4b5fd" font-size="14" font-weight="bold" font-family="ui-sans-serif,sans-serif">🎮 Game Dev</text>
  <line x1="636" y1="297" x2="871" y2="297" stroke="#2e1065" stroke-width="1"/>
  <text x="636" y="321" fill="#e9d5ff" font-size="12" font-family="ui-monospace,monospace">unity-gamedev  skill pack</text>
  <text x="636" y="343" fill="#e9d5ff" font-size="12" font-family="ui-monospace,monospace">game-perf      profiler</text>
  <text x="636" y="365" fill="#e9d5ff" font-size="12" font-family="ui-monospace,monospace">game-ci-cd     pipeline</text>

  <!-- Connecting arrows (Core → Build, Research → Build, Core → Research) -->
  <line x1="280" y1="110" x2="318" y2="110" stroke="#334155" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#eco-arr)"/>
  <line x1="583" y1="110" x2="621" y2="110" stroke="#334155" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#eco-arr)"/>
  <line x1="280" y1="358" x2="318" y2="358" stroke="#334155" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#eco-arr)"/>
  <line x1="583" y1="358" x2="621" y2="358" stroke="#334155" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#eco-arr)"/>
  <!-- Core → Platform (vertical) -->
  <line x1="450" y1="215" x2="450" y2="258" stroke="#334155" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#eco-arr)"/>
</svg>
</div>

### 136 Skills Across Every Domain

| Category | Skills (sample) | Count |
|:---------|:---------------|------:|
| **🏗️ Orchestration** | `ooo`, `bmad`, `plannotator`, `team`, `ultrawork`, `autopilot` | 12 |
| **🔬 Research** | `deep-dive`, `llm-wiki`, `autoresearch`, `graphify`, `scrapling` | 9 |
| **⚙️ Dev Workflow** | `tdd`, `debugging`, `code-review`, `git-workflow`, `spec-kit` | 18 |
| **🎬 Media & Visual** | `remotion-video-production`, `god-tibo-imagen`, `slides-grab` | 8 |
| **🎮 Game Dev** | `unity-gamedev-skill-pack`, `game-performance-profiler`, `game-ci-cd-pipeline` | 6 |
| **☁️ Platform** | `firebase-ai-logic`, `supabase-agent-skills`, `vercel-deploy`, `genkit` | 11 |
| **🤖 AI Agents** | `crewai-multi-agent`, `openai-agents-python`, `pydantic-ai`, `clawteam` | 14 |
| **📊 Data & Analytics** | `data-analysis`, `looker-studio-bigquery`, `langsmith`, `opik` | 9 |
| **🔒 Quality & Security** | `ultraqa`, `security-best-practices`, `backend-testing`, `web-accessibility` | 12 |
| **… and more** | `okf`, `obsidian`, `compresso`, `rtk`, `semble`, `graphify` | 37 |
| **Total** | | **136** |

---

## 💡 Becoming a 10× AI Builder

![jeo philosophy](/assets/img/jeo-code/philosophy.png){: .w-100 .shadow .rounded-10 }

The real insight isn't "jeo runs your AI." It's **what changes about how you think when you have a trustworthy harness** — a system where gates replace guidelines, skills encode expertise, and every failure loops back as a diagnostic instead of a dead end.

### The Builder's Flywheel

<div style="margin:1.5rem 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 370" style="width:100%;border-radius:12px;display:block;">
  <rect width="900" height="370" fill="#0a0a14" rx="12"/>
  <defs>
    <marker id="fw-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
    </marker>
    <marker id="fw-arr-g" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#10b981"/>
    </marker>
    <marker id="fw-arr-b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/>
    </marker>
  </defs>

  <!-- Lane 1: You -->
  <rect x="10" y="10" width="880" height="100" rx="8" fill="#0d1a2e" stroke="#3b82f6" stroke-width="1.5" opacity="0.7"/>
  <text x="26" y="34" fill="#60a5fa" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">👤 YOU</text>
  <!-- Lane 1 nodes -->
  <rect x="60" y="30" width="140" height="50" rx="7" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="130" y="52" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Express Intent</text>
  <text x="130" y="70" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="ui-monospace,monospace">natural language</text>
  <rect x="380" y="30" width="140" height="50" rx="7" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="450" y="52" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Approve Plan</text>
  <text x="450" y="70" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="ui-monospace,monospace">jeo approve</text>
  <rect x="700" y="30" width="140" height="50" rx="7" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="770" y="52" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Verify Results</text>
  <text x="770" y="70" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="ui-monospace,monospace">ultragoal</text>

  <!-- Lane 2: jeo Engine -->
  <rect x="10" y="132" width="880" height="100" rx="8" fill="#0e0d2a" stroke="#6366f1" stroke-width="1.5" opacity="0.7"/>
  <text x="26" y="156" fill="#818cf8" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">🤖 JEO ENGINE</text>
  <!-- Lane 2 nodes -->
  <rect x="60" y="152" width="140" height="50" rx="7" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
  <text x="130" y="174" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">deep-interview</text>
  <text x="130" y="192" text-anchor="middle" fill="#a5b4fc" font-size="10" font-family="ui-monospace,monospace">clarify requirements</text>
  <rect x="250" y="152" width="130" height="50" rx="7" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
  <text x="315" y="174" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">ralplan</text>
  <text x="315" y="192" text-anchor="middle" fill="#a5b4fc" font-size="10" font-family="ui-monospace,monospace">blueprint + critique</text>
  <rect x="430" y="152" width="130" height="50" rx="7" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
  <text x="495" y="174" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">team</text>
  <text x="495" y="192" text-anchor="middle" fill="#a5b4fc" font-size="10" font-family="ui-monospace,monospace">parallel execution</text>
  <rect x="610" y="152" width="140" height="50" rx="7" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
  <text x="680" y="174" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">post-edit hooks</text>
  <text x="680" y="192" text-anchor="middle" fill="#a5b4fc" font-size="10" font-family="ui-monospace,monospace">self-correct</text>

  <!-- Lane 3: Skills -->
  <rect x="10" y="254" width="880" height="100" rx="8" fill="#091a12" stroke="#10b981" stroke-width="1.5" opacity="0.7"/>
  <text x="26" y="278" fill="#34d399" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">📦 JEO-SKILLS</text>
  <!-- Lane 3 nodes -->
  <rect x="165" y="274" width="160" height="50" rx="7" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="245" y="296" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Activate Skill</text>
  <text x="245" y="314" text-anchor="middle" fill="#6ee7b7" font-size="10" font-family="ui-monospace,monospace">auto-routed by keyword</text>
  <rect x="380" y="274" width="160" height="50" rx="7" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="460" y="296" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Constrain Agent</text>
  <text x="460" y="314" text-anchor="middle" fill="#6ee7b7" font-size="10" font-family="ui-monospace,monospace">no hallucinated APIs</text>
  <rect x="595" y="274" width="140" height="50" rx="7" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="665" y="296" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Route Out Honestly</text>
  <text x="665" y="314" text-anchor="middle" fill="#6ee7b7" font-size="10" font-family="ui-monospace,monospace">when scope exceeded</text>

  <!-- Cross-lane arrows -->
  <!-- Express Intent → deep-interview -->
  <line x1="130" y1="80" x2="130" y2="152" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
  <!-- ralplan → Activate Skill (down) -->
  <line x1="315" y1="202" x2="280" y2="274" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#fw-arr-g)"/>
  <!-- Route Out → team (up) -->
  <line x1="635" y1="274" x2="555" y2="202" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#fw-arr-g)"/>
  <!-- Approve Plan → team (down) -->
  <line x1="450" y1="80" x2="475" y2="152" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
  <!-- post-edit → Verify Results (up) -->
  <line x1="720" y1="152" x2="760" y2="80" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#fw-arr-b)"/>
  <!-- Horizontal arrows within lanes -->
  <line x1="200" y1="177" x2="250" y2="177" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
  <line x1="380" y1="177" x2="430" y2="177" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
  <line x1="560" y1="177" x2="610" y2="177" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
  <line x1="325" y1="299" x2="380" y2="299" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
  <line x1="540" y1="299" x2="595" y2="299" stroke="#475569" stroke-width="1.5" marker-end="url(#fw-arr)"/>
</svg>
</div>

### Use Cases

<details markdown="1">
<summary style="font-size:20px; font-weight:bold; cursor:pointer;">🎮 Use Case 1: Game Feature Development</summary>

**Scenario:** Ship a new procedural level system for a mobile RPG.

```bash
jeo "design and implement a wave-function-collapse dungeon generator
     using existing TileMap class, integrate with GameManager, test on device spec"
```

**What happens:**

1. `deep-interview` asks 8 clarifying questions (tile types? seeding strategy? fallback for impossible states?)
2. `ralplan` generates a 3-phase blueprint, critic subagent signs off with `[OKAY]`
3. `jeo approve` gates until you read and confirm
4. `team` spawns executor subagents: one for WFC algorithm, one for GameManager integration, one for unit tests
5. Post-edit hook runs `tsc && jest --coverage`, errors fed back to the agent, fixed in-loop
6. `ultragoal` verifies all acceptance criteria against real suite output

**With `unity-gamedev-skill-pack`:** The agent knows Unity's project structure, avoids serialization pitfalls, and cites the Unity docs it's working from.

</details>

<details markdown="1">
<summary style="font-size:20px; font-weight:bold; cursor:pointer;">🔬 Use Case 2: Research → Production Pipeline</summary>

**Scenario:** Implement a RAG-based player-support bot from a recent paper.

```bash
jeo "$deep-dive implement context-aware retrieval system from arxiv 2506.xxxxx
     for our player support knowledge base"
```

**What happens:**

1. `deep-dive` activates — traces causal hypotheses, crystallizes requirements
2. `llm-wiki` captures findings into `~/vaults/llm-wiki/` for durable memory
3. `graphify` builds a knowledge graph of the system architecture
4. `scrapling` fetches and parses the arxiv paper + related GitHub repos
5. `ralplan` blueprints the implementation with honest tradeoff tables
6. `team` builds the retrieval layer, embedding pipeline, and eval harness

**Time saved:** What takes a 2-person team 2 weeks, jeo handles in hours — with citations.

</details>

<details markdown="1">
<summary style="font-size:20px; font-weight:bold; cursor:pointer;">🎬 Use Case 3: Marketing Content at Code Speed</summary>

**Scenario:** Generate a promotional video + blog post for a new AI feature launch.

```bash
jeo "create a Remotion promo video + blog post for our new matchmaking AI feature"
```

**What happens:**

1. `remotion-video-production` skill activates — plans scenes, animation budget, asset list
2. `god-tibo-imagen` generates missing hero images via Codex backend (no extra API key)
3. Remotion compositions rendered at 1920×1080 as MP4
4. Blog post authored with SVG workflow diagrams, embedded video, GitHub links
5. `vercel-deploy` or Jekyll build deploys the post

**This very post you're reading was built exactly this way.** 🎉

</details>

### The Compounding Effect

| Without jeo | With jeo + jeo-skills |
|:-----------|:----------------------|
| Write prompts, iterate blindly | `deep-interview` crystallizes requirements first |
| Hope the agent doesn't hallucinate | `ralplan` critic + `[OKAY]` gate blocks bad plans |
| Manually run tests after each change | Self-correcting hook loop — agent fixes its own bugs |
| Start from scratch each session | `.jeo/` state persists, `/resume` continues any task |
| One model, one provider | Switch Anthropic → OpenAI → Ollama mid-task |
| General-purpose agent guesses | 136 skills encode exactly what experts do |

---

## 🏗️ Architecture Deep Dive

<div style="background:#0a0a14; padding:1.5rem; border-radius:12px; margin:1.5rem 0;">
<img src="/assets/img/jeo-code/architecture.svg" alt="jeo-skills architecture diagram" style="width:100%; border-radius:8px;" />
</div>

### How a Skill Execution Works

<div style="margin:1.5rem 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 360" style="width:100%;border-radius:12px;display:block;">
  <rect width="780" height="360" fill="#0a0a14" rx="12"/>
  <defs>
    <marker id="seq-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
    </marker>
    <marker id="seq-ret" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
      <polygon points="8 0, 0 3, 8 6" fill="#334155"/>
    </marker>
  </defs>

  <!-- Lifeline headers -->
  <rect x="30" y="14" width="110" height="38" rx="7" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="85" y="38" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">User</text>

  <rect x="210" y="14" width="120" height="38" rx="7" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
  <text x="270" y="38" text-anchor="middle" fill="#a5b4fc" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">jeo Agent</text>

  <rect x="405" y="14" width="130" height="38" rx="7" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="470" y="38" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">SKILL Router</text>

  <rect x="610" y="14" width="130" height="38" rx="7" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="675" y="38" text-anchor="middle" fill="#fde68a" font-size="12" font-weight="bold" font-family="ui-sans-serif,sans-serif">Shell / FS</text>

  <!-- Lifelines -->
  <line x1="85" y1="52" x2="85" y2="345" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="270" y1="52" x2="270" y2="345" stroke="#312e81" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="470" y1="52" x2="470" y2="345" stroke="#064e3b" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="675" y1="52" x2="675" y2="345" stroke="#78350f" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Message 1: User → jeo -->
  <line x1="85" y1="80" x2="262" y2="80" stroke="#475569" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <text x="170" y="72" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="ui-monospace,monospace">$scrapling fetch &lt;url&gt;</text>

  <!-- Message 2: jeo → SKILL -->
  <line x1="270" y1="110" x2="462" y2="110" stroke="#475569" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <text x="366" y="102" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="ui-monospace,monospace">Load SKILL.md — routing rules</text>

  <!-- Message 3: SKILL → jeo (return) -->
  <line x1="462" y1="140" x2="278" y2="140" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#seq-ret)"/>
  <text x="366" y="132" text-anchor="middle" fill="#64748b" font-size="10" font-family="ui-monospace,monospace">Mode: plain HTTP (lightest path)</text>

  <!-- Message 4: jeo → Shell -->
  <line x1="270" y1="170" x2="667" y2="170" stroke="#475569" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <text x="466" y="162" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="ui-monospace,monospace">python -c 'from scrapling import Fetcher...'</text>

  <!-- Message 5: Shell → jeo (return) -->
  <line x1="667" y1="200" x2="278" y2="200" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#seq-ret)"/>
  <text x="466" y="192" text-anchor="middle" fill="#64748b" font-size="10" font-family="ui-monospace,monospace">HTML content parsed</text>

  <!-- Message 6: jeo → SKILL (route-out check) -->
  <line x1="270" y1="230" x2="462" y2="230" stroke="#475569" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <text x="366" y="222" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="ui-monospace,monospace">Check route-out: browser needed?</text>

  <!-- Message 7: SKILL → jeo -->
  <line x1="462" y1="260" x2="278" y2="260" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#seq-ret)"/>
  <text x="366" y="252" text-anchor="middle" fill="#64748b" font-size="10" font-family="ui-monospace,monospace">No — static HTML, done ✓</text>

  <!-- Message 8: jeo → User (return) -->
  <line x1="262" y1="290" x2="93" y2="290" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#seq-ret)"/>
  <text x="170" y="282" text-anchor="middle" fill="#64748b" font-size="10" font-family="ui-monospace,monospace">Structured content ready</text>

  <!-- Legend -->
  <line x1="30" y1="322" x2="60" y2="322" stroke="#475569" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <text x="68" y="326" fill="#64748b" font-size="10" font-family="ui-sans-serif,sans-serif">call</text>
  <line x1="110" y1="322" x2="140" y2="322" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#seq-ret)"/>
  <text x="148" y="326" fill="#64748b" font-size="10" font-family="ui-sans-serif,sans-serif">return</text>
</svg>
</div>

Every skill is **routing-first**: picks the *lightest workable path*, routes out honestly if scope is exceeded. No over-promising. No silent failures.

---

## 📦 Installation & Quick Start

### Method 1 — Bun (recommended, fastest startup)

```bash
# Install Bun runtime
curl -fsSL https://bun.sh/install | bash

# Install jeo-code globally
bun install -g jeo-code

# Verify
jeo --version
```

### Method 2 — npm (universal Node.js)

```bash
# Install globally (requires Node.js 18+)
npm install -g jeo-code

# Or run once without installing
npx jeo-code
```

### Connect Your LLM Provider

```bash
# Diagnose connection status
jeo doctor

# Anthropic (Claude)
jeo /provider login anthropic
# → prompts for ANTHROPIC_API_KEY

# OpenAI (GPT / Codex)
jeo /provider login openai
# → prompts for OPENAI_API_KEY

# Ollama (local, free — no API key needed)
ollama serve          # in a separate terminal
jeo /provider login ollama
```

> **Tip:** `/provider login <name>` also works from inside the jeo interactive TUI — no need to restart.
{: .prompt-tip}

### Install All 136 jeo-skills

```bash
# Full install
git clone https://github.com/akillness/jeo-skills.git
cd jeo-skills && bash install.sh
# → creates 136 skill folders in ~/.agents/skills/

# Verify
ls ~/.agents/skills/ | wc -l   # → 136
```

### Run jeo

```bash
# Interactive mode
jeo

# One-shot with a skill prefix
jeo "$deep-dive explain the architecture then refactor the auth module"

# Check your skill library
ls ~/.agents/skills/ | wc -l   # → 136+
```

---

## 📊 Performance Comparison

| Approach | Setup Time | Iteration Speed | Verification | Resume After Crash | Skills |
|:---------|:----------:|:---------------:|:------------:|:------------------:|:------:|
| Raw LLM API | 0 min | Slow (manual) | ❌ Manual | ❌ | ❌ |
| Generic coding agent | 5 min | Medium | ⚠️ Optional | ⚠️ | ❌ |
| Claude Code / Codex | 10 min | Fast | ⚠️ Hook only | ✅ | ❌ |
| **jeo-code** | **10 min** | **Fast** | **✅ Honest** | **✅** | **⚠️ Manual** |
| **jeo-code + jeo-skills** | **15 min** | **🚀 10× Faster** | **✅ Honest** | **✅** | **✅ 136 skills** |

> The skills layer is what changes the multiplier from 3× to 10×. The agent stops guessing the right approach and follows proven, tested patterns.
{: .prompt-info}

---

## ⭐ Star the Projects

<div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin:1.5rem 0;">
  <a href="https://github.com/akillness/jeo-code" target="_blank" style="flex:1; min-width:280px; display:block; background:linear-gradient(135deg,#1e3a5f,#0a0a14); border:2px solid #3b82f6; border-radius:16px; padding:1.5rem; text-decoration:none;">
    <div style="font-family:monospace; font-size:1.3rem; font-weight:900; color:#60a5fa; margin-bottom:0.5rem;">⭐ akillness/jeo-code</div>
    <div style="color:#cbd5e1; font-size:0.95rem;">Bun-based AI coding agent · spec-first · real gates · honest verification</div>
    <div style="color:#f59e0b; font-size:0.85rem; margin-top:0.5rem; font-family:monospace;">bun install -g jeo-code</div>
  </a>
  <a href="https://github.com/akillness/jeo-skills" target="_blank" style="flex:1; min-width:280px; display:block; background:linear-gradient(135deg,#1a3a2f,#0a0a14); border:2px solid #10b981; border-radius:16px; padding:1.5rem; text-decoration:none;">
    <div style="font-family:monospace; font-size:1.3rem; font-weight:900; color:#34d399; margin-bottom:0.5rem;">🚀 akillness/jeo-skills</div>
    <div style="color:#cbd5e1; font-size:0.95rem;">136 skills for LLM workflows · TOON format · Claude / Codex / Ollama</div>
    <div style="color:#f59e0b; font-size:0.85rem; margin-top:0.5rem; font-family:monospace;">npx skills add https://github.com/akillness/jeo-skills --skill &lt;name&gt;</div>
  </a>
</div>

---

## References

**Projects:**
- [jeo-code — GitHub Repository](https://github.com/akillness/jeo-code)
- [jeo-skills — GitHub Repository](https://github.com/akillness/jeo-skills)
- [jeo-code Usage Guide](https://github.com/akillness/jeo-code/blob/main/docs/usage-guide.md)
- [jeo-skills CHANGELOG](https://github.com/akillness/jeo-skills/blob/main/CHANGELOG.md)

**Harness Engineering:**
- [Harness Engineering: The 5 Rules That Let Agents Ship 1M Lines](/posts/harness-engineering)
- [CLI Harness for Coding Agents](/posts/cli-harness-coding-agents)
- [Reliable Agent Systems](/posts/harness-reliable-agent-systems)

**Tools Used in This Post:**
- [Remotion v4](https://remotion.dev) — code-first video production from React components
- [god-tibo-imagen](https://github.com/NomaDamas/god-tibo-imagen) — AI image generation via Codex backend
- [Scrapling](https://github.com/D4Vinci/Scrapling) — adaptive web scraping
- [Bun runtime](https://bun.sh) — fast JavaScript/TypeScript runtime
