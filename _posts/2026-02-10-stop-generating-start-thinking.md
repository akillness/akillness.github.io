---
title: "Stop Generating, Start Thinking: The Missing Layer in AI Coding"
description: "A deep reflection on why code generation without human thinking is risky—and how to build with agents without losing engineering judgment."
categories:
  - Agent/Orchestration
tags:
  - Agent
  - Workflow
  - Orchestration
date: 2026-02-10 13:00:00 +0900
mermaid: true
math: false
image:
  path: /assets/img/2026-02-10-stop-generating/cover.png
  alt: "Stop generating, start thinking"
---

![Stop generating, start thinking](/assets/img/2026-02-10-stop-generating/cover.png)

## 🤔 Curiosity: Are we outsourcing the part that matters most?

I love tools that accelerate development, but I’m uneasy with one trend: **replacing thinking with generation**. The Localghost essay “Stop generating, start thinking” captures that unease sharply. It argues that the most dangerous failure mode of AI coding isn’t bugs—it’s **eroding the act of engineering judgment**.

**Question:** How do we use AI assistants without giving up the responsibility of reasoning about our systems?

---

## 📚 Retrieve: What the essay is really saying

### 1) “Spicy autocomplete” is fine. Blind generation isn’t.
The author has used Copilot and Claude as **autocomplete + debugging aids**, but finds that “clever” prompts often cost more time than writing the code directly. The tension isn’t about tools—it’s about **misplaced effort**.

### 2) The Industrial Revolution analogy is misleading
Yes, this is a productivity revolution. But unlike mechanisation—which produces **consistent, inspectable outputs**—LLM outputs are **non‑deterministic and opaque**. The comparison breaks down when you need accountability.

### 3) LLMs don’t reason; humans must
The essay’s central critique: if humans stop thinking and LLMs can’t think, **nobody is thinking**. This is how brittle systems happen. The Horizon scandal is used as a painful reminder: software failures have **real human cost**.

### 4) “Human centipede epistemology”
We trained models on mediocre code, and now they generate more of it—creating a self‑reinforcing cycle of low‑quality output. The author calls this out as a **cultural** problem, not just a technical one.

### 5) Trust is diluted in AI‑generated PRs
A PR written by a teammate carries human intent. A PR written by an agent often doesn’t. When we generate code and let one reviewer approve it, we remove an entire layer of **shared context**.

---

## 💡 Innovation: How I’d operationalize this in real teams

### 1) Split “generation” from “design thinking”
I treat agents as **implementation accelerators**, not decision‑makers.

```mermaid
graph LR
  A[Human Reasoning] --> B[Agent Implementation]
  B --> C[Human Review + Tests]
  C --> A
```

### 2) Require intent in PRs
If AI helped generate code, the PR must still answer:
- Why is this change needed?
- What tradeoffs were considered?
- What tests validate it?

### 3) Use agents for tasks you already understand
This aligns with Mikayla Maki’s advice: **treat agents like an external contributor you don’t fully trust**. If you can’t explain the change, you shouldn’t ship it.

### 4) Keep the pair‑programming effect
AI should behave like a pair, not a replacement. That means **two minds** still need to reason—one human, one agent, with explicit checks.

---

## Practical guardrails (what I’d actually enforce)

| Guardrail | Why it matters | Implementation |
|---|---|---|
| “Reasoned PR” requirement | Forces intent, not just output | PR template with decisions + tests |
| Agent scope limits | Avoids architectural drift | Only allow agents in scoped modules |
| Review debt tracking | AI output still needs human clarity | Track review time per AI PR |
| “No black‑box merges” | Prevents blind approvals | Require a second human reviewer |

---

## Where this lands for game development

In games, the temptation to “vibe code” is huge—rapid prototypes, live‑ops pressure, short timelines. But games are **systems of constraints** (performance, accessibility, fairness, economy balance). Those constraints require human reasoning.

AI should accelerate the **boring parts**, not replace the **thinking parts**.

---

## Key Takeaways

| Insight | Implication | Next Steps |
|---|---|---|
| LLMs generate, they don’t reason | Humans must own system thinking | Enforce intent in PRs |
| Generation without thinking reduces accountability | Bugs become cultural issues | Build guardrails + reviews |
| AI‑generated PRs erode shared context | Teams lose “two pairs of eyes” | Pair with explicit reasoning |

### New Questions
- Can we quantify “thinking debt” in AI‑generated codebases?
- What would a CI pipeline look like that checks for **intent**, not just tests?
- How do we teach juniors to think if they never write from scratch?

---

## References
- Source essay: https://localghost.dev/blog/stop-generating-start-thinking/
- Human‑in‑the‑loop take: https://zed.dev/blog/on-programming-with-agents
