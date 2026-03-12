---
title: "pi as the Core: Build Your Own Agentic Workflow, Not Someone Else’s"
description: "I compared recent posts and notes on pi and concluded that the most useful coding agent architecture is one that is extensible by design, starting from a minimal core and adding only what your workflow needs."
categories: [Tools, AI, Coding]
tags: [pi, openclaw, coding-agent, extensions, mcp, workflow]
date: 2026-03-11 09:00:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-03-11-pi-extension-ecosystem/pi-dev.png
  alt: "pi.dev social card"
---

I saw this in a recent wave of discussions: everyone talks about the next “better coding agent,” but I keep seeing the same bottleneck.

> People are not just comparing model quality anymore. They are comparing **how much they can control the tool itself**.

This post is based on the latest sources shared by you, especially the pi ecosystem updates and related writeups.

## Why pi stands out as a core idea

The first source is the official pi page: **[pi.dev](https://shittycodingagent.ai/)**.

![pi social card](/assets/img/posts/2026-03-11-pi-extension-ecosystem/pi-dev.png)

What it says is clear:

- pi is a **minimal terminal coding harness**.
- It does **not force** the whole workflow.
- It is designed to be **adapted** through TypeScript extensions, prompt templates, and packages.
- It supports multiple interaction modes: interactive / print JSON / RPC / SDK.
- It covers many providers and auth methods.

That is already a strong signal: this is not trying to be a “one-size” mega-agent. It is trying to be a **foundation**.

Then there’s a personal essay from the broader OpenClaw context: **[Pi: The Minimal Agent Within OpenClaw](https://lucumr.pocoo.org/2026/1/31/pi/)**.

![lucumr pi post](/assets/img/posts/2026-03-11-pi-extension-ecosystem/lucumr-pi-social.png)

Key argument I got from that article:

- A lot of agents are feature-rich, but not all are **programmable** in the way teams actually need.
- pi’s value is the design move: treat workflow limitations as extension points.
- It is a shift from “this agent does x, y, z” to “I build what this agent should do with me.”

## Why this is different from Claude Code / Codex / other CLI agents

That’s where the text you gave becomes most relevant:

- Claude Code can be powerful, but if its built-in model/MCP structure is inconvenient, you often have to **adapt to it**.
- pi says the opposite: if you want a different UI, different compaction strategy, permission gates, or offline behavior, you can implement it in an extension.
- No hard fork required.

You also mentioned MCP, sub-agent behavior, and team orchestration. The article stack + repo confirms this pattern:

- MCP integration can be built as an extension.
- Sub-agent behavior can be built as an extension.
- Agent team orchestration can be built as an extension.
- Even permission gates (e.g. edit confirmations) can be built as an extension.
- It is all in one extension system: **one TypeScript file can be a plugin**.

That philosophy can be summarized as:

> It’s not "Can this feature work here?" but **"If not, can we make it work here?"**

## What this means in practice

From the same message and the GitHub examples list, the extension model is not hypothetical.

![pi extensions on GitHub](/assets/img/posts/2026-03-11-pi-extension-ecosystem/pi-extensions-github.png)

The code snippet pattern in your source is basically the contract:

```typescript
export default function (pi: ExtensionAPI) {
  pi.registerTool({ name: "deploy", ... });
  pi.registerCommand("stats", { ... });
  pi.on("tool_call", async (event, ctx) => {
    ...
  });
}
```

That means one plugin can:

- Register tools
- Register commands
- Hook every lifecycle event
- Intercept tool calls
- Inject context
- Change compaction strategy
- Even render a whole new TUI component

So the extension layer is not a side feature. It is the control plane.

## The “craftsman” perspective

I also checked **Jonghak’s long-form post**: **[장인은 도구를 탓하지 않는다. 도구를 만든다.](https://jonghakseo.github.io/posts/craftsman-makes-tools/)**.

![craftsman blog](/assets/img/posts/2026-03-11-pi-extension-ecosystem/jonghakseo-craftsman.png)

The core message there is a practitioner’s version of the same idea:

- “I’ve used many agents.”
- “Most of the friction comes from mismatch between tooling and your real workflow.”
- “If the tool is composable, you stop fighting it and start shipping.”

That aligns perfectly with the phrase you gave:

- **Not “a feature is missing,” but “a workflow requires a new feature.”**

## Practical takeaways

If you evaluate coding agents today, I’d test these 3 checks:

1. **Extension surface**: Can I change behavior without waiting on upstream priorities?
2. **State and session model**: Can I branch/replay/safely store context as needed?
3. **Composability speed**: Can I build MVP extensions quickly from local files and reload at runtime?

With pi, these are not “nice-to-have.” They are core.

## Snippets

### 1) pi official site
- **URL**: <https://shittycodingagent.ai/>
- **Snippet**:
  > “There are many coding agents, but this one is mine. Pi is a minimal terminal coding harness. Adapt pi to your workflows, not the other way around.”

### 2) OpenClaw context essay
- **URL**: <https://lucumr.pocoo.org/2026/1/31/pi/>
- **Snippet**:
  > “Pi is interesting to me because I can see a practical path from powerful AI coding to an adaptable, maintainable workflow.”

### 3) Extension examples in repo
- **URL**: <https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/examples/extensions>
- **Snippet**:
  > “examples/extensions” repository content demonstrates how pi behavior can be customized through local extension examples and shared patterns.

### 4) Practitioner reflection
- **URL**: <https://jonghakseo.github.io/posts/craftsman-makes-tools/>
- **Snippet**:
  > “Don’t blame the tool. Build your tool. pi is about reducing mismatch between your process and the tool’s defaults.”

## Bottom line

The shift here is subtle but huge:

- Traditional tools: _feature-rich but opinionated_
- pi-style tools: _minimal + extensible + yours_

If your team’s pain is mostly “I can’t do X in my preferred way,” pi’s design is exactly that kind of pain point’s antidote.
