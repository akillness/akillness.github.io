---
title: "Codex Plugins Are Runtime Bundles, Not Just App Connectors"
description: "A practical introduction to how Codex plugins actually work: skills, manifests, connector surfaces, and MCP-based tool routing in one runtime bundle."
categories: [AI, Developer-Tools, Architecture]
tags: [codex, plugins, mcp, skills, ai-agents, workflow]
date: 2026-03-28 10:00:00 +0900
mermaid: false
math: false
image:
  path: "https://media.licdn.com/dms/image/v2/D5612AQELTa4UktPQ5A/article-cover_image-shrink_720_1280/B56Z0t10i6JgAI-/0/1774590577696?e=2147483647&v=beta&t=Kbw87unhsHnFXA3WFeazD2MtsPBUd0koFpCYfYVyBwQ"
  alt: "Codex plugin architecture"
---

## 🤔 Curiosity: Why do many teams misunderstand plugins?

When people hear “Codex plugin,” they often think of a simple app connection:

- GitHub plugin
- Gmail plugin
- Notion plugin

That mental model is convenient, but incomplete.
As soon as workflows get complex, a plugin behaves less like a toggle and more like a **runtime packaging layer** for model behavior.

---

## 📚 Retrieve: What the repository-level view suggests

Based on a close reading of Seowoo Han’s article and related references, the practical plugin model looks like this:

> A plugin is a runtime bundle that tells Codex what to load, when to call workflows, and where to connect tools.

In practice, this bundle often includes:

1. **User-facing metadata** (what appears in product UX)
2. **Skill/workflow references** (what the model should load as operational playbooks)
3. **Connector surfaces** (app bindings, IDs, or remote endpoints)
4. **Tool protocols** (for example MCP surfaces exposed to the runtime)

The key architecture insight:
- A manifest/config file usually does **not** implement business logic itself.
- It defines **routing + contracts** for behavior composition at runtime.

Source references:
- Original article: <https://kr.linkedin.com/pulse/codex%EC%97%90%EC%84%9C-plugin%EC%9D%B4-%EC%8B%A4%EC%A0%9C%EB%A1%9C-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%8F%99%EC%9E%91%ED%95%98%EB%8A%94%EA%B0%80-seowoo-han-u7rac>
- OpenAI plugins repo: <https://github.com/openai/plugins>
- MCP introduction: <https://modelcontextprotocol.io/introduction>
- Claude Code overview: <https://docs.anthropic.com/en/docs/claude-code/overview>

---

## 💡 Innovation: Design plugins as execution contracts

If you want plugins to scale beyond demos, design them as **contracts** across four layers:

1. **Context Contract**
   - Which skills and documents must be loaded first?
2. **Tool Contract**
   - Which tools are callable, with what scope/permissions?
3. **Execution Contract**
   - Which commands/hooks can run automatically, and which require approval?
4. **Ops Contract**
   - How are failures logged, traced, retried, and rolled back?

### Skill vs Plugin vs MCP (quick mental model)

| Layer | Primary role | Typical question |
|---|---|---|
| Skill | Task playbook | “How should the model perform this task consistently?” |
| Plugin | Runtime behavior bundle | “How do we package context + workflows + integrations?” |
| MCP | Tool protocol surface | “How does the agent call external tools safely?” |

### Practical takeaway

Teams that treat plugins as architecture contracts—not UI connectors—tend to get:

- fewer random tool calls,
- more reproducible outputs,
- safer automation boundaries,
- and cleaner collaboration between prompt design and platform engineering.

In short:

> Plugin quality is execution design quality.
