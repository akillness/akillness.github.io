---
title: "OpenDev and the Case for Compound AI Agents: Why Multi-Model Workflows Matter"
description: "OpenDev shows a different path for coding agents: split work by workflow (execution, thinking, compression, critique, and vision), then bind the right model to each task.",
categories: [AI, Coding]
tags: [opendev, open-source, coding-agent, mcp, multi-model, architecture]
date: 2026-03-16 10:00:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-03-16-opendev-llm/opendev-gh-og.png
  alt: "OpenDev overview from PyTorch Korea discussion"
---

## 🤔 Curiosity: Why do we still route everything through one LLM?

Even if everyone says "more capable model" today is the key, I kept seeing the same bottleneck:

> One model for everything means one cost/latency profile for every task.

For coding workloads, that is often wasteful. A refactor plan, a simple grep check, and a PR summary are not equally expensive jobs.

OpenDev immediately caught my eye because it tackles this directly by making model choice a **workflow design decision**, not a global default.

![OpenDev discussion card](/assets/img/posts/2026-03-16-opendev-llm/opendev-gh-og.png)

## 📚 Retrieve: What I checked

I reviewed the Korean summary post and the GitHub repository to verify the architecture claim.

- Source: <https://discuss.pytorch.kr/t/opendev-llm-ai/9227>
- Source: <https://github.com/opendev-to/opendev>

The key takeaways are surprisingly concrete:

### 1) Compound architecture, not monolith

OpenDev describes itself as a **compound coding agent** built to break the single-model bottleneck:

- Normal (Execution): primary coding/work execution
- Thinking (Reasoning): planning and complex logic
- Compact (Context compression): summarization and history reduction
- Critique (Self-review): validating outputs
- VLM (Vision): image-aware tasks

Each workflow slot can be bound to a different LLM, so architecture becomes the budget optimizer.

### 2) Model portability by design

The GitHub README is explicit about multi-provider support and workflow-level assignment. The practical win is this:

- No single-vendor lock-in
- Lower latency for lightweight tasks
- More expensive reasoning models reserved for high-value checkpoints

This is important for teams that currently treat model choice as one global `provider` switch.

### 3) Built for terminal-first + remote workflows

Another strong signal is runtime positioning:

- Rust core for speed and low memory
- Terminal UI for power users
- Web UI for remote monitoring and lighter control

So you can let it run in background, then review results remotely. For shipping teams, that’s closer to practical dev orchestration than “chat-and-wait” tooling.

### 4) MCP + extensibility path

OpenDev embraces MCP integration, which means tools and data sources can be surfaced through standardized channels instead of proprietary glue. In this sense it’s very aligned with the plugin-first direction OpenClaw users already know.

## 💡 Innovation: My practical conclusion

I usually compare coding agents by one criterion: **How quickly can a team move from experimentation to repeatable flow?**

For that metric, OpenDev’s design is strong because:

- It externalizes a critical decision (`which model for what`) into configuration, where teams can iterate.
- It supports concurrent sub-agents, so long-running tasks become less brittle.
- It gives you a clean separation between speed, cost, and verification quality.

### A sample mental model you can copy

Think of your agent pipeline this way:

- Execution = cheap+fast model
- Thinking = high-reasoning model
- Critique = strict verifier model
- Compact = compact context model

If you’re shipping regularly, this is a real lever for both cost and quality.

## Code-level sketch (how this looks in practice)

```yaml
# settings.json (conceptual)
workflows:
  normal:
    model: "claude-opus"
    role: "execute"
  thinking:
    model: "gpt-o3"
    role: "plan"
  compact:
    model: "qwen-small"
    role: "summarize"
  critique:
    model: "reasoning-pro"
    role: "review"
  vlm:
    model: "vision-pro"
    role: "analyze_images"
```

```bash
# quick onboarding mental checklist
opendev config setup
open ~/.opendev/settings.json
# bind providers per workflow slot
# run
opendev
```

## Why this is different from common terminal agents

A lot of tools still optimize for “one powerful stack plus many options.”

OpenDev’s interesting move is to make the stack **compositional**:

- You decide model-policy per workflow.
- You run several specialized sessions.
- You can still keep terminal speed while adding visual and web workflows.

That moves architecture from “feature list comparison” to “system leverage comparison.”

## New questions for my next experiments

- How much PR quality improvement do teams see when critiquing workflow is separated from execution workflow?
- Can we automate model-switch policies based on file-level risk and history length?
- What’s the best fallback policy when a workflow model is unavailable?

## References

- OpenDev introduction and architecture summary: <https://discuss.pytorch.kr/t/opendev-llm-ai/9227>
- OpenDev repository: <https://github.com/opendev-to/opendev>
