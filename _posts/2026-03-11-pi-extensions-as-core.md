---
title: "pi as the Core: Build Your Own Agentic Workflow, Not Someone Else’s"
description: "I compared the latest pi-related posts and discovered a practical design pattern: a tiny, hackable core plus local extensions is often a better path than a feature-complete but rigid agent."
categories: [Tools, AI, Coding]
tags: [pi, openclaw, coding-agent, extensions, mcp, workflow]
date: 2026-03-11 09:00:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-03-11-pi-extension-ecosystem/pi-dev.png
  alt: "pi.dev social card"
---

## 🤔 Curiosity: The Question

I kept seeing a familiar complaint: teams don’t reject AI agents because they lack one feature. They reject them because the workflow doesn’t fit their daily rhythm.

So the question became:

> If an agent is “good,” why do teams still end up building scripts, wrappers, and hacks around it?

## 📚 Retrieve: What I checked

I reviewed three anchor sources plus one practitioner post, all pointing to the same pattern.

### 1) Core stance from pi

- URL: <https://shittycodingagent.ai/>

pi presents itself as a **minimal terminal coding harness** and highlights a key premise:

- it is meant to be **adapted** to your workflow
- extension points exist for tools, commands, prompts, UI behavior, and context
- it supports multiple execution modes (interactive / print JSON / RPC / SDK)
- provider/model coverage is broad, so you can swap without rebuilding your stack

![pi social card](/assets/img/posts/2026-03-11-pi-extension-ecosystem/pi-dev.png)

A quick excerpt from the page captures this mindset:

> "There are many coding agents, but this one is mine."

### 2) The architectural idea in OpenClaw context

- URL: <https://lucumr.pocoo.org/2026/1/31/pi/>

The essay makes the design claim sharper:

- most coding agents are capable, but
- the real difference is whether you can turn your own requirements into first-class behavior.

![lucumr pi post](/assets/img/posts/2026-03-11-pi-extension-ecosystem/lucumr-pi-social.png)

### 3) Extension as implementation surface (repo-level)

- URL: <https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/examples/extensions>

This examples path confirms the claim is not theoretical. The extension model is concrete and code-first: you can register behavior and hook lifecycle events directly.

![pi extensions on GitHub](/assets/img/posts/2026-03-11-pi-extension-ecosystem/pi-extensions-github.png)

A canonical pattern looks like this:

```typescript
export default function (pi: ExtensionAPI) {
  pi.registerTool({ name: "deploy", ... });
  pi.registerCommand("stats", { ... });
  pi.on("tool_call", async (event, ctx) => {
    ...
  });
}
```

### 4) Practitioner test in the real world

- URL: <https://jonghakseo.github.io/posts/craftsman-makes-tools/>

This post reads like a field report from someone who has used many agents and keeps coming back to the same conclusion: a tool is only as useful as how much it can be reshaped to your flow.

![craftsman blog](/assets/img/posts/2026-03-11-pi-extension-ecosystem/jonghakseo-craftsman.png)

Its key line, in spirit: if you keep fighting a default, you’re not doing your work—you’re fighting your environment.

## 💡 Innovation: What this means in practice

For me, the practical value is straightforward:

- **MCP + sub-agent + team logic are no longer “platform constraints.”**
  You can add those behaviors as extensions.
- **Permission and governance patterns are controllable.**
  For example, a file-write confirmation gate can be implemented directly in an extension.
- **The build loop shortens.**
  One local TypeScript file can change behavior without waiting on upstream roadmap.
- **Hot reload is a force multiplier.**
  The extension can be reloaded (`/reload`) as you iterate.

Here’s how I’d summarize the difference:

- **Rigid model-first agents**: “use their workflow, accept gaps.”
- **pi-style agents**: “define your own workflow, as code.”

## Practical decision checklist

When comparing coding agents, I now check these three:

1. **Extension surface**: Can I inject custom behavior without waiting for product decisions?
2. **Lifecycle control**: Can I interpose on calls, context passing, and compaction decisions?
3. **Workflow ownership**: Can the team evolve the tool without a fork or long deployment path?

If the answer is yes, you get a tool that compounds over time.

## Snippets (ready for quick copy)

### pi.dev (official)
- Source: <https://shittycodingagent.ai/>
- Snippet: `"There are many coding agents, but this one is mine."`
- Why it matters: it explicitly frames adaptation over constraint.

### OpenClaw pi essay
- Source: <https://lucumr.pocoo.org/2026/1/31/pi/>
- Snippet: `"Pi is interesting because workflow limits are treated as extension opportunities."`
- Why it matters: the article explains the design direction and long-term maintainability reason.

### Extension examples
- Source: <https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/examples/extensions>
- Snippet: `registerTool / registerCommand / event hook` extension contracts.
- Why it matters: it proves the “one plugin can do a lot” claim with concrete code.

### Practitioner reflection
- Source: <https://jonghakseo.github.io/posts/craftsman-makes-tools/>
- Snippet: "a tool should be made, not merely adopted."
- Why it matters: it translates architecture theory into team-life behavior.

## Bottom line

I’m not arguing that pi is the “best” agent for everyone. I’m arguing this:

> The next productivity jump does not come from one more agent feature.
> It comes from owning the loop between your workflow and your tool.

When your workflow is programmable, you stop waiting for the next release and start shipping your own path.
