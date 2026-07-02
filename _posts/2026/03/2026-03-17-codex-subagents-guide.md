---
title: "Designing AI Agent Teams with Codex Subagents: A Practical Guide to Multi-Agent Workflows"
description: "Codex subagents let you split complex tasks into specialized agents with their own model, sandbox, and tool settings. Here’s a practical guide for shipping safer, faster, and more controllable AI workflows."
categories: [AI, Coding, Tutorial]
tags: [codex, subagents, mcp, multi-agent, orchestration, automation]
date: 2026-03-17 09:00:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-03-17-codex-subagents-guide/openai-codex-og.png
  alt: "OpenAI Codex subagents documentation"
---

## 🤔 Curiosity: Why not just one stronger model?

I kept asking this every time a PR review became too big or a bug hunt turned into repeated context switches:

> Why should one AI session inspect security, code quality, tests, and docs all at once when each of those tasks is basically a different role?

With Codex Subagents, the answer is straightforward: **parallel specialization**.

That sounds like a product claim, but the deeper value is architectural: split the problem, constrain risk, and then fold everything back into one decision.

![Codex subagents overview](/assets/img/posts/2026-03-17-codex-subagents-guide/openai-codex-og.png)

I verified this against:
- OpenAI official docs: <https://developers.openai.com/codex/subagents/>
- Korean digest summary: <https://news.hada.io/topic?id=27566>

---

## 📚 Retrieve: What Codex subagents actually do

From both sources, the operating model is clear:

1. **Explicit invocation only**: Codex spawns subagents when you ask for them.
2. **Specialized roles**: each agent can have distinct instructions, model choice, and sandbox policy.
3. **Consolidated orchestration**: Codex handles routing, waiting, and thread finalization.
4. **Token tradeoff**: more parallel execution usually means higher token cost than single-agent mode.

### Built-in baseline agents

Codex includes three built-ins:
- `default`: general-purpose fallback
- `worker`: implementation + fixes
- `explorer`: read-heavy exploration

This is useful as a default template even before custom agents are added.

### Subagent workflow in plain English

Think of a PR review command:

- Main agent asks for six checks (`Security`, `Code Quality`, `Bugs`, `Race`, `Test flakiness`, `Maintainability`).
- Each check is a separate agent with its own instruction set.
- Final answer is aggregated after all results are back.

This is exactly how you avoid one model getting “confused by everything and careful about nothing.”

---

## 💡 Innovation: A practical guide you can run this week

Below is the setup I recommend for teams moving from single-agent to team-agent mode.

### Step 1) Prepare custom agents as TOML files

Create `.codex/agents/*.toml` with narrow scope.

```toml
# ~/.codex/agents/pr-explorer.toml
name = "pr_explorer"
description = "Read-only codebase explorer for evidence collection before changes."
developer_instructions = """
Stay in exploration mode.
Trace execution paths before proposing edits.
Cite symbols/files and avoid code changes unless explicitly asked.
"""
model = "gpt-5.3-codex-spark"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
```

```toml
# ~/.codex/agents/reviewer.toml
name = "reviewer"
description = "Reviewer focused on correctness, security, and tests."
developer_instructions = """
Prioritize correctness, security, behavior regressions, and missing tests.
Provide reproducible steps when a risk is found.
Avoid style-only comments unless they hide real bugs.
"""
model = "gpt-5.4"
model_reasoning_effort = "high"
```

```toml
# ~/.codex/agents/docs-researcher.toml
name = "docs_researcher"
description = "Verifies APIs and version-specific behavior with docs MCP server."
developer_instructions = """
Use docs MCP server when validating APIs.
Return concise findings with versioned references.
Do not edit code.
"""
model = "gpt-5.3-codex-spark"
sandbox_mode = "read-only"

[mcp_servers]
openaiDeveloperDocs = "https://developers.openai.com/mcp"
```

### Step 2) Add global guardrails in config

Set concurrency/depth/cost boundaries so fan-out does not explode.

```toml
# ~/.codex/config.toml
[agents]
agents.max_threads = 6
agents.max_depth = 1
agents.job_max_runtime_seconds = 1800
```

Why these matter:
- `max_threads`: cap concurrent subagents
- `max_depth`: prevent uncontrolled nesting
- `job_max_runtime_seconds`: protect long-running jobs from hanging forever

### Step 3) Use strong approval and sandbox defaults

Subagents inherit sandbox from parent by default. That is good for consistency, but not always optimal.

- Keep default for normal worker tasks
- Set dedicated subagent overrides for dangerous operations (example: `read-only` for doc/research agents)
- In non-interactive mode, approvals that require human consent will fail back to parent flow—log and handle explicitly

A safe execution prompt pattern:

```text
Review this branch vs main.
Spawn three subagents:
1) pr_explorer: map affected paths and evidence.
2) reviewer: find correctness/security/test risks.
3) docs_researcher: verify API/version assumptions.
Return a consolidated risk matrix with severity, proof, and next action.
```

### Step 4) Run with CLI slash commands

In CLI, you can inspect and steer running threads with `/agent`.

```bash
# inspect subagent threads and shift context
/agent
```

This is useful when one branch is slow or stuck while others are done.

---

## 🧩 Workflow patterns for real projects

### Pattern A) PR Review Squad

- `pr_explorer`: trace changed code paths and impacted symbols.
- `reviewer`: flag correctness/security/regression.
- `docs_researcher`: check framework/API constraints.

Result: concentrated findings with much cleaner separation of concerns.

### Pattern B) Frontend Incident triage

- `code_mapper`: locate frontend/backend touchpoints.
- `browser_debugger`: reproduce with browser MCP and collect console/network evidence.
- `ui_fixer`: apply the minimum safe patch once root cause is known.

Result: faster incident turnaround and less noisy edits.

### Pattern C) At-scale review batching with CSV

If incidents, PRs, or packages repeat in a table-like structure, batch them.

- prepare CSV (`path,owner`)
- call `spawn_agents_on_csv` with a job template
- each row becomes a worker job

This is still experimental, but very practical for recurring audit workflows.

Example instruction template:

```text
"Review {path} owned by {owner}. Return JSON keys: path, risk, summary, follow_up via report_agent_job_result."
```

---

## ⚠️ Cost, quality, and safety tradeoffs

From the docs and field notes, three tradeoffs are hard to avoid:

1. **Cost up**: per-agent parallelism increases token usage.
2. **Complexity up**: more config means more governance.
3. **Safety improves when scoped**: better to split tasks and constrain tool access than one “all-seeing” agent.

My rule of thumb:

- Start with 3 agents max in production.
- Expand to 6 only after each has a measurable, repeatable output.
- Disable ad hoc spawning for repetitive actions unless the command requires orchestration.

---

## Quick start checklist (copy/paste)

- [ ] Create `.codex/agents/` with narrow-role TOML files
- [ ] Define shared guardrails in `.codex/config.toml`
- [ ] Set sandbox defaults and selective overrides
- [ ] Test one explicit orchestration prompt
- [ ] Validate `/agent` thread control
- [ ] Compare token usage against single-agent baseline

---

## References

- OpenAI Subagents documentation: <https://developers.openai.com/codex/subagents/>
- Korean community summary (background + announcement): <https://news.hada.io/topic?id=27566>

## Snippet section (ready for social copy)

**OpenAI official:**
- "Codex now supports subagent workflows by default. Use explicit prompts, specialized agents, and aggregated responses."
- Why it matters: official contract is clear on explicit control and consolidation.

**Community lens:**
- "Subagent 토큰 비용은 단일 실행보다 커지지만 병렬성과 신뢰도는 상승한다."
- Why it matters: cost/benefit framing in real operations.
