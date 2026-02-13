---
title: "Build Your Own AI Agent with Agent SDKs (2026)"
description: "A practical map of the agent SDK landscape — what each framework optimizes for, and how to choose the right harness." 
categories: [AI, Games]
tags: [Agents, SDK, Tooling, Workflow, Orchestration]
date: 2026-02-12 14:00:00 +0900
mermaid: true
math: false
image:
  path: /assets/img/2026-02-12-agent-sdk/cover.png
  alt: "Agent SDK landscape"
---

![Agent SDK landscape](/assets/img/2026-02-12-agent-sdk/cover.png)

## 🤔 Curiosity: Is the real question now “Which agent harness?”

The agent ecosystem is moving fast. In production, I’ve learned the model matters — but the **harness** matters more: planning, tool execution, memory, long‑running workflows, safety gates. Today we don’t have to build all of that from scratch because **Agent SDKs are turning agent runtimes into embeddable infrastructure**.

So the question shifts from **“Which model?”** to **“Which harness scales my product?”**

---

## 📚 Retrieve: A quick map of the major Agent SDKs

Below is a compact view of the most visible SDKs right now, and what they emphasize.

### ✅ SDK Landscape (2026)

| SDK | Strengths | Langs | Notes |
|---|---|---|---|
| **OpenAI Agents SDK** | Multi‑agent workflows, guardrails, tracing, sessions | Py/TS | Provider‑agnostic; strong tooling + tracing story | 
| **Google ADK** | Code‑first orchestration, strong tool ecosystem, deploy to Vertex | Py (+ Java/Go/TS) | Model‑agnostic; rich agent tooling + evaluation | 
| **Claude Agent SDK** | Production runtime with Claude Code, built‑in tools + hooks | Py/TS | CLI bundled; in‑process MCP tools | 
| **GitHub Copilot SDK** | Copilot CLI runtime embedded via SDK | Py/TS/Go/.NET | Technical preview; CLI server mode | 
| **Strands Agents** | AWS‑native, model‑agnostic, MCP built‑in | Py/TS | Strong multi‑provider support | 
| **Kimi Agent SDK** | Thin SDK over Kimi CLI | Py/TS/Go | Reuses CLI tools + MCP servers | 
| **Codex SDK** | TS SDK inside Codex repo | TS | Early stage; ties into Codex tooling | 
| **Gemini CLI SDK** | TS SDK inside Gemini CLI | TS | Early stage; CLI‑first workflows |

### 📌 SDK Cards (Images)

![OpenAI Agents SDK](/assets/img/2026-02-12-agent-sdk/openai-agents-sdk.png){: .light .shadow .rounded-10 w='800' }

![Google ADK](/assets/img/2026-02-12-agent-sdk/google-adk.png){: .light .shadow .rounded-10 w='800' }

![Claude Agent SDK](/assets/img/2026-02-12-agent-sdk/claude-agent-sdk.png){: .light .shadow .rounded-10 w='800' }

![GitHub Copilot SDK](/assets/img/2026-02-12-agent-sdk/github-copilot-sdk.png){: .light .shadow .rounded-10 w='800' }

![Strands Agents SDK](/assets/img/2026-02-12-agent-sdk/strands-agents-sdk.png){: .light .shadow .rounded-10 w='800' }

![Kimi Agent SDK](/assets/img/2026-02-12-agent-sdk/kimi-agent-sdk.png){: .light .shadow .rounded-10 w='800' }

![Codex SDK (TS)](/assets/img/2026-02-12-agent-sdk/codex-sdk-ts.png){: .light .shadow .rounded-10 w='800' }

![Gemini CLI SDK (TS)](/assets/img/2026-02-12-agent-sdk/gemini-cli-sdk-ts.png){: .light .shadow .rounded-10 w='800' }

---

## 🧩 What these SDKs *actually* solve

When I map these SDKs onto real production needs, they cluster around four jobs:

1. **Orchestration** (multi‑agent routing, handoffs, coordinator patterns)
2. **Tooling** (safe tool execution, approvals, MCP, custom tools)
3. **Memory** (sessions, persistent context, replayable traces)
4. **Observability** (tracing, guardrails, review loops)

If you’re shipping real features, **the harness is your leverage**. The SDK choice defines how quickly you can:

- move from prototype → production
- audit and debug failures
- scale multi‑agent workflows safely

---

## 🛠️ Example: a minimal “harness‑first” pattern

```python
from agents import Agent, Runner

planner = Agent(
    name="Planner",
    instructions="Break tasks into steps and assign tools",
)

executor = Agent(
    name="Executor",
    instructions="Run tools safely and report results",
)

# Simple handoff‑style pattern
triage = Agent(
    name="Triage",
    instructions="Decide if planning or execution is needed",
    handoffs=[planner, executor],
)

result = Runner.run_sync(triage, "Generate a build plan for a game AI pipeline")
print(result.final_output)
```

The point isn’t the syntax. It’s the **structure**: planning → execution → validation. That’s the harness, not the model.

---

## 💡 Innovation: How I’d choose a harness in production

Here’s the practical decision tree I use:

1) **If you need a rich tool ecosystem + deployment (Google stack)** → **ADK**
2) **If you need tracing + guardrails + provider‑agnostic agents** → **OpenAI Agents SDK**
3) **If you want CLI‑grade file/tool control out‑of‑box** → **Claude Agent SDK** or **Copilot SDK**
4) **If you want AWS‑native control + MCP first** → **Strands Agents**
5) **If your team already uses Kimi/Gemini/Codex CLI** → pick their SDK for lowest friction

### Key Takeaways

| Insight | Implication | Next Step |
|---|---|---|
| Harness choice shapes quality + speed | Models are only half the story | Invest in orchestration + tooling | 
| SDKs reduce infra overhead | Faster to production | Prototype with 2–3 SDKs | 
| Observability matters | Debugging is the bottleneck | Pick SDKs with tracing/hooks | 

### New questions I’m asking
- What’s the **minimum harness** for safe long‑running agents?
- Will SDKs converge around **MCP + tracing + eval** as defaults?
- Can we benchmark harness quality the way we benchmark models?

---

## References
- OpenAI Agents SDK: https://github.com/openai/openai-agents-python
- Google ADK: https://github.com/google/adk-python
- Claude Agent SDK: https://github.com/anthropics/claude-agent-sdk-python
- GitHub Copilot SDK: https://github.com/github/copilot-sdk
- Strands Agents SDK: https://github.com/strands-agents/sdk-python
- Kimi Agent SDK: https://github.com/MoonshotAI/kimi-agent-sdk
- Codex SDK (TS): https://github.com/openai/codex/tree/main/sdk/typescript
- Gemini CLI SDK (TS): https://github.com/google-gemini/gemini-cli/tree/main/packages/sdk
