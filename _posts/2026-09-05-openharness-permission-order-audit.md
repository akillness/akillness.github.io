---
title: "OpenHarness Lets Its Allow List Outrank Your Deny Rules"
description: "A commit-pinned audit of the OpenHarness permission checker: its tool allow list returns before the command and path deny globs an operator configured."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, open-source, tooling]
date: 2026-09-05 11:30:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-05-openharness-permission-order-audit/permission-order.svg
  alt: "Order of checks inside the OpenHarness permission checker, showing the allow list returning before the user's command and path deny rules"
---

![Order of checks inside the OpenHarness permission checker](/assets/img/posts/2026-09-05-openharness-permission-order-audit/permission-order.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: If I write a deny rule into my agent, does it actually run?

Every agent harness eventually ships the same three knobs: a mode, an allow list, and a deny list. The interesting question is not whether they exist. It is what happens when two of them disagree.

[OpenHarness](https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7) is a good place to ask, because it is explicit about the claim. The README defines a harness as tools, knowledge, observation, action, and permissions, and the repository markets governance as one of its pillars. At commit `9b2efd7` the project is MIT licensed, carries 15,638 stars, and was last pushed on 2026-06-04.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-openharness-permission-order-audit/references/harness-equation.png" alt="OpenHarness project diagram defining a harness as tools, knowledge, observation, action and permissions">
  <figcaption>The project's own definition places permissions alongside tools and action &mdash; Harness equation diagram from the OpenHarness repository, MIT licensed, pinned at commit 9b2efd7. Source: <a href="https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7">https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7</a>. Publisher: OpenHarness Contributors (HKUDS/OpenHarness). Licence: <a href="https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE">https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE</a>.</figcaption>
</figure>

So I read the checker instead of the README, and then I ran it.

## 📚 Retrieve: The order of checks is the whole story

`src/openharness/permissions/checker.py` is 200 lines. `evaluate()` walks its rules in a fixed order and returns on the first match. That order is the finding.

1. Built-in `SENSITIVE_PATH_PATTERNS` — hard-coded credential paths ([lines 84-96](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/permissions/checker.py#L84-L96))
2. `denied_tools` — deny by tool name ([lines 100-102](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/permissions/checker.py#L100-L102))
3. `allowed_tools` — allow by tool name, **returns immediately** ([lines 104-106](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/permissions/checker.py#L104-L106))
4. `path_rules` — your path deny globs ([lines 109-116](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/permissions/checker.py#L109-L116))
5. `denied_commands` — your command deny globs ([lines 119-126](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/permissions/checker.py#L119-L126))
6. Mode fallbacks — `full_auto`, read-only, `plan`, and the default confirmation prompt

Step 3 returns an allowed decision. Steps 4 and 5 are written below it. So the moment a tool name appears in `allowed_tools`, the deny globs the operator wrote are not consulted.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-openharness-permission-order-audit/references/scene-governance.png" alt="OpenHarness governance illustration used in the README permissions section">
  <figcaption>The README section that advertises path-level and command rules &mdash; Governance scene illustration from the OpenHarness repository, MIT licensed, pinned at commit 9b2efd7. Source: <a href="https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7">https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7</a>. Publisher: OpenHarness Contributors (HKUDS/OpenHarness). Licence: <a href="https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE">https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE</a>.</figcaption>
</figure>

### Reproducing it

Reading an ordering is cheap; asserting it is not. I imported the pinned `checker.py` directly and executed `evaluate()` unmodified. Only `PermissionSettings` was replaced, with a plain dataclass, because the pydantic model was unavailable in the sandbox and the checker reads settings purely through attribute access.

| Case | Config | Result |
|---|---|---|
| A | `denied_commands` set, `full_auto`, run `rm -rf /` | denied — *Command matches deny pattern* |
| B | same, plus `allowed_tools` contains the shell tool | **allowed** — *bash is explicitly allowed* |
| C | `path_rules` deny `/etc/*`, read `/etc/shadow` | denied — *matches deny rule* |
| D | same, plus `allowed_tools` contains the read tool | **allowed** — *read_file is explicitly allowed* |
| E | `allowed_tools` contains the read tool, read `~/.ssh/id_rsa` | denied — built-in pattern holds |
| F | shell tool in both `denied_tools` and `allowed_tools` | denied — deny wins |

Cases E and F matter as much as B and D. This is not an open door.

### What still holds

The hard-coded credential list runs first and survives the allow list. The maintainers clearly reasoned about exactly this hazard: `tests/test_permissions/test_checker.py` defines 17 tests, and one of them is named `test_allowed_tools_does_not_bypass_sensitive_paths`. Deny-by-tool-name also wins, because it sits at step 2.

What none of those 17 tests pin is the allow list against `denied_commands` or against user `path_rules`.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-openharness-permission-order-audit/references/architecture-comic.png" alt="OpenHarness architecture overview panel from the project README">
  <figcaption>The wider architecture the permission layer sits inside &mdash; Architecture overview panel from the OpenHarness repository, MIT licensed, pinned at commit 9b2efd7. Source: <a href="https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7">https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7</a>. Publisher: OpenHarness Contributors (HKUDS/OpenHarness). Licence: <a href="https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE">https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE</a>.</figcaption>
</figure>

### How reachable is this?

Three coordinates decide that.

`evaluate()` is called on the tool-execution path in [`engine/query.py` line 933](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/engine/query.py#L925-L938), after the file path and command are normalised — so this is the live path, not a helper. The allow list is an exposed CLI option declared at [`cli.py` lines 2272-2277](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/cli.py#L2272-L2277). And `denied_commands` is enforced in exactly one place in the entire tree.

That last one I checked exhaustively rather than assumed. Grepping `denied_commands` across every Python, Markdown, JSON, TOML and TypeScript file at the pinned commit returns five hits: the settings field definition, a test fixture set to the empty list, the README example, a demo script, and the single enforcement site at `checker.py` line 121. No second site enforces `denied_commands` further down the stack. Separate mechanisms such as PreToolUse hooks still exist and can reject a call, but they are a different feature an operator has to configure themselves.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-openharness-permission-order-audit/references/scene-agentloop.png" alt="OpenHarness illustration of the agent loop that wraps each tool call">
  <figcaption>Every tool call in the loop passes through the same single checker &mdash; Agent loop scene illustration from the OpenHarness repository, MIT licensed, pinned at commit 9b2efd7. Source: <a href="https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7">https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7</a>. Publisher: OpenHarness Contributors (HKUDS/OpenHarness). Licence: <a href="https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE">https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE</a>.</figcaption>
</figure>

### The documentation gap is the sharper half

The [README](https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/README.md#L625-L640) publishes a settings example containing `path_rules` and `denied_commands`. It is a natural thing to copy. But a recursive grep for `allowed_tools`, `allowed-tools`, and `allowedTools` across every Markdown file in the pinned tree returns nothing at all — no README section, no changelog line, no release note.

So the allow list is reachable from the CLI, decisive in the checker, and absent from the prose. An operator can read the documented deny example, add the allow-list flag for convenience, and never encounter a sentence telling them the two interact.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-openharness-permission-order-audit/references/scene-toolkit.png" alt="OpenHarness illustration of the bundled tool categories">
  <figcaption>The bundled tool surface an allow list is most likely to be applied to &mdash; Toolkit scene illustration from the OpenHarness repository, MIT licensed, pinned at commit 9b2efd7. Source: <a href="https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7">https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7</a>. Publisher: OpenHarness Contributors (HKUDS/OpenHarness). Licence: <a href="https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE">https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE</a>.</figcaption>
</figure>

## 💡 Innovation: What this changes for anyone running a harness

**Treat an allow list as a scope, not a shortcut.** In this implementation `allowed_tools` does not mean *skip confirmation for this tool*. It means *stop evaluating*. Those are different powers, and only one of them is what most operators want when they type the flag.

**Order is the contract.** A permission layer is not a set of rules; it is a sequence. The same five rules in a different order produce a different security posture, and no amount of README wording changes it. When auditing a harness, read `evaluate()` top to bottom before reading the docs.

**Test the interactions, not the rules.** The 17 tests here each check a rule. The gap is a test that checks two rules disagreeing. `test_allowed_tools_does_not_bypass_sensitive_paths` is exactly that shape, and it is the one that proves the pattern is worth extending.

**The fix is small.** Moving the allow-list return below the path and command loops would make the operator's deny globs authoritative while leaving cases E and F unchanged. That is a reordering, not a redesign.

For game teams this generalises past coding agents. A build agent with a shell tool allow-listed for convenience is a build agent whose destructive-command deny pattern is decorative. If you are weighing how much autonomy to hand a coding agent in the first place, [why the harness layer decides that more than the model does](/posts/agentic-coding-convergence/) is the next thing worth reading.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-openharness-permission-order-audit/references/scene-context.png" alt="OpenHarness illustration of context and memory handling">
  <figcaption>Context and memory sit outside the permission path and are unaffected by this finding &mdash; Context and memory scene illustration from the OpenHarness repository, MIT licensed, pinned at commit 9b2efd7. Source: <a href="https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7">https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7</a>. Publisher: OpenHarness Contributors (HKUDS/OpenHarness). Licence: <a href="https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE">https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE</a>.</figcaption>
</figure>

## Limitations

This audit is pinned to commit `9b2efd7`, last pushed 2026-06-04. Later commits may reorder the checker. The reproduction substituted a dataclass for the pydantic settings model, so it exercises `evaluate()` faithfully but not the settings validation around it. The exhaustive greps cover the pinned tree only. I did not run the full OpenHarness test suite, and I make no claim about behaviour in the swarm permission-sync call site beyond noting that it exists. Star counts are a 2026-09-05 reading.

Nothing here is a vulnerability report. It is an ordering choice with an undocumented consequence, in an MIT-licensed project that already ships the strongest part of the protection — the credential list — ahead of everything else.

## 🎯 Key Takeaways

| Insight | Implication | Next step |
|---|---|---|
| The allow list returns before path and command deny rules | Operator-written deny globs are skipped for allow-listed tools | Read `evaluate()` before trusting a permission config |
| Built-in credential paths and `denied_tools` still hold | This is a scoping surprise, not an open door | Keep secrets protection independent of user config |
| The allow list appears in no Markdown file in the tree | The interaction cannot be discovered from the docs | Document precedence explicitly in any harness you ship |
| One enforcement site for `denied_commands` | No second gate downstream compensates | Grep for enforcement count, not mentions |

## 🤔 New Questions

- Should a harness allow list ever short-circuit a deny rule, or should deny always be terminal?
- What is the right default when an operator supplies both an allow list and deny globs — intersection, or ordered precedence?
- How many harnesses document their rule precedence at all, rather than leaving it implicit in source order?

## References

**Primary source (pinned at `9b2efd7`)**

- Repository tree: <https://github.com/HKUDS/OpenHarness/tree/9b2efd795c6aa09f88b0c257d269a9e518da6ae7>
- Permission checker: <https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/permissions/checker.py>
- Query engine call site: <https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/engine/query.py#L925-L938>
- CLI allow-list option: <https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/src/openharness/cli.py#L2272-L2277>
- Permission tests: <https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/tests/test_permissions/test_checker.py>
- README permissions section: <https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/README.md#L625-L640>
- Licence: <https://github.com/HKUDS/OpenHarness/blob/9b2efd795c6aa09f88b0c257d269a9e518da6ae7/LICENSE>

**Official metadata**

- GitHub REST API: <https://api.github.com/repos/HKUDS/OpenHarness>

**Related on this site**

- [Claude Code vs. Cursor vs. Codex vs. Antigravity — why the harness won](/posts/agentic-coding-convergence/)
