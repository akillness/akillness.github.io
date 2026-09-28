---
title: "Octop's Shell Guard Logs Risky Matches; POSIX Root Is `/`"
description: "The latest Octop default logs matching shell rules instead of blocking them, and its local-shell root is `/` on POSIX; virtual filesystem mode is not a process jail."
categories: [AI, Agents]
tags: [ai-agents, sandboxing, trust-boundaries, open-source]
date: 2026-09-28 19:14:05 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-28-octop-shell-guard-logs-by-default/octop-guard-mode-matrix.svg
  alt: "Original diagram showing Octop's warn-only shell guard, disabled tool approval, and the POSIX / default root"
---

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; I traced pinned source code, but did not install Octop or run its guard in a live process.

## 🤔 Curiosity: Does Octop's shell guard stop a match, or only report it?

[Octop](https://github.com/TencentCloud/Octop) is TencentCloud's MIT-licensed, self-hosted assistant with a shared multi-user workspace. The source pin in this audit is commit [`232030f`](https://github.com/TencentCloud/Octop/tree/232030f46c5450801ca87809f8a4da57aefc5a05), from the `1.0.2b4` release line. Its lockfile resolves the shell-guard dependency to `octop-harness` **1.0.0**, the version examined below.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-28-octop-shell-guard-logs-by-default/references/octop-dashboard-home.png" alt="Octop web dashboard home in the README, with a sidebar that includes Terminal AI+, Browser AI+, Remote Desktop, ACP, and Subagents">
  <figcaption>Product-interface context from the earlier README snapshot at `c04aacc6`; this image is not evidence of the current security defaults. Source: <a href="https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/README.md">https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/README.md</a>. Publisher/creator: TencentCloud (Octop contributors). License: <a href="https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE">https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE</a>. Attribution: TencentCloud, Octop README dashboard screenshot, MIT License, pinned at commit c04aacc6.</figcaption>
</figure>

An assistant with a shell, shared by several people, needs a clear answer about what happens before a command runs. The latest README calls security built in, highlighting JWT multi-user isolation, tool approval, shell command guardrails, and PII redaction. Its Security & privacy section says risky tools or shell commands require explicit approval under the guardrail rules.

So I asked two questions:

> **When a shell rule matches, does Octop pause or block the command, and what root does its default local shell use?**

The source gives two defaults to separate. If no `security_policy` row exists, tool approval is disabled and the command guard is enabled in `warn` mode. A match is logged, then the middleware still calls the tool. Separately, when no effective per-user `workspace_root_dir` is supplied, the default local-shell root falls back to `/` on POSIX. Octop explicitly ignores this host workspace policy in detected Docker/Podman container mode, so a stored value may not be effective there. These are source-level code paths, not results from a live fresh-install test; a stored security policy can override the security defaults.

The rules exist. The practical questions are what action the guard takes and whether the shell has a real execution boundary.

## 📚 Retrieve: What the pinned code shows

I pinned Octop at commit [`232030f`](https://github.com/TencentCloud/Octop/tree/232030f46c5450801ca87809f8a4da57aefc5a05) and read its current README, security policy store and test, default-agent and invite code, backend documentation, dashboard strings, and `uv.lock`. The lock now resolves `octop-harness` to **1.0.0**. I traced that tagged package's source rather than reusing the earlier draft's `orcakit-harness-agent` 1.0.14 engine probe.

### Two defaults set in one function

When Octop's security policy store has no `security_policy` row, its fallback `_default_policy()` sets **`hitl.enabled = False`** and **`tool_guard = {enabled: True, mode: "warn"}`**. The current unit test asserts both values. This is the no-row code path; an existing stored policy can override it, and I did not run a fresh installation.

The lockfile-resolved `octop-harness` 1.0.0 source describes `SecurityPolicy.defaults()` as the recommended self-hosted defaults and sets approval off with the guard in `warn` mode. Octop's fallback matches that configuration.

### What "warn" does

The current engine maps `block` to HIGH and CRITICAL findings, and `require_approval` to MEDIUM, HIGH, and CRITICAL. `warn` has no blocking severities. When a rule matches in `warn`, the middleware logs the rule IDs with `logger.warning` and then calls `handler(request)`. In `block` it returns an error tool message; in `require_approval` it waits for approval.

The ruleset is not empty. The current `dangerous_shell_commands.yaml` contains **20 rules: 7 CRITICAL and 13 HIGH**. `TOOL_CMD_PIPE_TO_SHELL` marks a `curl` or `wget` command piped to a shell as CRITICAL. These patterns can detect a match, but the configured mode decides whether detection becomes a stop.

### One source trace, not a live engine test

I did not import or execute `octop-harness` 1.0.0. I traced the current rule, severity map, and middleware branch; the table is a code-path prediction, not a runtime result.

| Source condition | `warn` (Octop fallback) | `block` | `require_approval` |
|---|---|---|---|
| `TOOL_CMD_PIPE_TO_SHELL`, CRITICAL (`curl` or `wget` piped to a shell) | logs the rule ID, then calls the handler | returns an error tool message | pauses for approval |

A rule match is not the same thing as an enforced decision.

<figure>
  <img src="/assets/img/posts/2026-09-28-octop-shell-guard-logs-by-default/octop-guard-mode-matrix.svg" alt="Original diagram: warn logs and runs every finding, block refuses HIGH and CRITICAL, require_approval pauses MEDIUM and above; tool approval is a separate switch that is off by default">
  <figcaption>Original diagram of the modes in `octop-harness` 1.0.0 as wired by Octop's no-row policy fallback. Source-traced, not runtime-tested; the MEDIUM column describes mode behavior because the bundled file has no MEDIUM rules.</figcaption>
</figure>

### What else checks a shell command

The separate `FilesystemGuardMiddleware` maps path checks for `ls`, `read_file`, `glob`, `grep`, `write_file`, `edit_file`, and `delete`. **Neither `bash` nor `execute` is in that map.** It checks file-tool paths; it is not an operating-system boundary around shell execution.

### Where the default agent's shell starts

Octop bootstraps a default agent for the first admin, and invite redemption calls the same default-agent bootstrap for a new account. The factory uses the user's *effective* `workspace_root_dir` policy. If there is no effective value, `default_home_local_backend()` uses `host_fs_tree_root()` and `virtual_mode=True`. That helper returns **`/` on POSIX** and the home drive's root on Windows. Octop's `effective_workspace_root_dir()` returns `None` when the process is detected as running in a container, deliberately ignoring the stored host policy. In those deployments, the stored setting does not narrow the shell by itself; inspect the actual backend root, mounts, and permissions.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-28-octop-shell-guard-logs-by-default/references/octop-expert-library.png" alt="Octop user guide screenshot of the expert library page, a grid of specialist agent templates used to create a new agent">
  <figcaption>Product-interface context from the earlier user-guide snapshot at `c04aacc6`; it does not show shell-root or guard configuration. Source: <a href="https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/docs/user-guide.md">https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/docs/user-guide.md</a>. Publisher/creator: TencentCloud (Octop contributors). License: <a href="https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE">https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE</a>. Attribution: TencentCloud, Octop user guide expert library screenshot, MIT License, pinned at commit c04aacc6.</figcaption>
</figure>

The jail condition is narrower than `virtual_mode` suggests. `resolve_bubbled_bwrap()` returns no bubblewrap wrapper unless the platform is Linux, virtual mode is on, `root_dir` is not the host root, and `bwrap` is available. Because the default POSIX root is `/`, the default path is not bubblewrapped even on Linux. On macOS or Linux without `bwrap`, the fallback may still rewrite virtual absolute paths under a narrower `root_dir`, but the documentation explicitly says it is not a directory jail. Path rewriting should not be mistaken for process confinement. If Octop runs inside a container, `/` means the filesystem root visible to that process; how much of the physical host is exposed depends on the container mounts.

This is a source-based inference, not a live run: a newly bootstrapped agent with no effective `workspace_root_dir` can have a local-shell root covering the filesystem visible to Octop, while the default shell guard only logs matched rules. A stored per-user policy can narrow that root outside detected container mode; Octop ignores the host policy in detected Docker/Podman containers, so verify the actual backend root, mounts, and permissions there. The exact host-versus-container boundary depends on how the operator deploys Octop.

### The surfaces that raise the stakes

Octop is not just a chat window with an occasional tool call. Its user guide documents scheduled agent jobs and a remote-desktop surface. **Operational inference:** a cron run may fire when no approver is present. In that situation, a server-log warning is not a synchronous approval gate.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-28-octop-shell-guard-logs-by-default/references/octop-cron-tasks.png" alt="Octop user guide screenshot of the scheduled task management page for agent cron jobs">
  <figcaption>Scheduled task management, figure 5.5 in the user guide. Source: <a href="https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/docs/user-guide.md">https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/docs/user-guide.md</a>. Publisher/creator: TencentCloud (Octop contributors). License: <a href="https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE">https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE</a>. Attribution: TencentCloud, Octop user guide scheduled tasks screenshot, MIT License, pinned at commit c04aacc6.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-28-octop-shell-guard-logs-by-default/references/octop-remote-desktop.png" alt="Octop user guide screenshot of the remote desktop page with a ready-status banner and a prompt to connect to a desktop session">
  <figcaption>The remote desktop panel, figure 5.7 in the user guide. Source: <a href="https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/docs/user-guide.md">https://github.com/TencentCloud/Octop/blob/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/docs/user-guide.md</a>. Publisher/creator: TencentCloud (Octop contributors). License: <a href="https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE">https://raw.githubusercontent.com/TencentCloud/Octop/c04aacc604a23ac05c00538f1bd4bc586fee6bb6/LICENSE</a>. Attribution: TencentCloud, Octop user guide remote desktop screenshot, MIT License, pinned at commit c04aacc6.</figcaption>
</figure>

### What the project does say plainly

The current English dashboard strings offer **"Block (HIGH/CRITICAL)"**, **"Require approval (includes MEDIUM)"**, and **"Log warnings only"**, plus a separate **"Require human approval for tools"** switch. The harness's default HITL tool list includes `bash`, `execute`, `write_file`, `edit_file`, and `delete`. The controls exist; the gap is that the no-row policy does not turn them on.

## 💡 Innovation: Set the guard, then set a real boundary

Before inviting anyone to a shared Octop instance, configure three separate controls.

1. **Choose what a rule match does.** Use `require_approval` when a person can respond; use `block` when HIGH/CRITICAL matches should never run. The current bundled rules are HIGH or CRITICAL, but user-added MEDIUM rules are only covered by `require_approval`.
2. **Enable the separate HITL switch for shell tools.** Confirm `bash` and `execute` are in the approval list. This can pause tool calls that do not match a regex rule.
3. **Narrow the shell environment.** Set and verify an effective per-user `workspace_root_dir` outside detected container mode. Octop ignores this host policy in detected Docker/Podman deployments, so do not rely on a stored value there: verify the actual local-shell backend root, container mounts, and permissions. On Linux, require a root other than `/` and an available `bwrap` before treating it as a directory jail. On macOS, a virtual root alone does not confine the process; use a genuinely isolated runtime or do not grant shared agents local shell access.

For the project, the smallest honest README fix is to distinguish capability from default: approval is off and matching shell commands are logged unless an operator changes the policy; on POSIX, the default local-shell root is `/` unless an effective per-user workspace policy narrows it. Octop ignores that host policy in detected Docker/Podman containers, where operators should verify the actual backend root and mounts. Alternatively, ship a safer policy as the default. Make a guard match visible to the person who requested the action, not only in server logs.

This is the same pattern I keep finding in agent tools, and it is why I read defaults before features. The [AIO Sandbox audit](/posts/aio-sandbox-confinement-contract-audit/) found a sandbox that asks Docker to relax confinement, and the [OpenConnector audit](/posts/open-connector-default-custody-audit/) found a tool that places its own defaults out of scope. The feature list describes what a tool can do. The defaults describe what it does.

## 🎯 Key Takeaways

- Octop's current no-row policy fallback disables tool approval and sets the shell guard to `warn`.
- In `octop-harness` 1.0.0, a `warn` match is logged and the handler still runs; this conclusion is traced from source, not a live command test.
- Without an effective per-user `workspace_root_dir`, the default local-shell root is `host_fs_tree_root()`: `/` on POSIX and the home-drive root on Windows. Detected Docker/Podman container mode ignores that host policy.
- The default POSIX root does not meet the bubblewrap wrapper's non-host-root condition; macOS also has no bubblewrap jail. Container mounts and permissions determine which files the process-visible `/` contains.
- The filesystem guard covers listed file tools, not `bash` or `execute`; configure both a shell-match action and an actual execution boundary.

### Limitations and trade-offs

- The audit traces Octop commit `232030f` and `octop-harness` v1.0.0 source. I did not install Octop, create a fresh account, or execute a shell command against a running agent.
- A stored `security_policy` can override the security defaults. An effective per-user `workspace_root_dir` can narrow the local-shell root outside detected container mode; Octop ignores that host policy in detected Docker/Podman deployments. No live account or container configuration was inspected.
- Container mounts and runtime permissions determine whether process-visible `/` includes host files; the source-level root path alone does not prove physical-host exposure.
- Regex rules cannot catch harmful commands they do not match. `block` and approval add controls only within their configured rule/tool scope.
- The four product screenshots are retained from the earlier `c04aacc6` documentation snapshot and are interface context, not proof of current security settings.

## 🤔 New Questions

- Does any supported setup or invite flow automatically set `workspace_root_dir`, or is the POSIX `/` fallback common in real deployments?
- Which Docker/container mounts are exposed to Octop's local-shell process by default?
- Should a guard match in `warn` mode appear in the chat or an audit log visible to the person who requested the action?
- How do scheduled cron jobs behave under `require_approval` when nobody is online to approve?

## References

### Octop source pin

- [Octop at commit `232030f` (1.0.2b4 release line)](https://github.com/TencentCloud/Octop/tree/232030f46c5450801ca87809f8a4da57aefc5a05)
- [README](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/README.md)
- [`policy_store.py`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/src/octop/infra/agents/security/policy_store.py) and [its unit test](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/tests/unit/test_security_settings.py)
- [`default_agent.py`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/src/octop/infra/agents/experts/default_agent.py), [`resource_policy.py`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/src/octop/infra/users/resource_policy.py), [`host_dirs.py`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/src/octop/infra/utils/host_dirs.py), [`invites.py`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/src/octop/api/routers/invites.py), and [`setup.py`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/src/octop/api/routers/setup.py)
- [Agent backend file I/O documentation](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/docs/agent-backend-file-io.md)
- [`uv.lock`](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/uv.lock), [dashboard English strings](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/dashboard/src/locales/en.json), and [current MIT License](https://github.com/TencentCloud/Octop/blob/232030f46c5450801ca87809f8a4da57aefc5a05/LICENSE)

### Locked dependency

- [`octop-harness` v1.0.0 source](https://github.com/TencentCloud/octop-harness/tree/v1.0.0): [`security/models.py`](https://github.com/TencentCloud/octop-harness/blob/v1.0.0/src/octop_harness/security/models.py), [`tool_guard/engine.py`](https://github.com/TencentCloud/octop-harness/blob/v1.0.0/src/octop_harness/security/tool_guard/engine.py), [`middleware/tool_guard.py`](https://github.com/TencentCloud/octop-harness/blob/v1.0.0/src/octop_harness/middleware/tool_guard.py), [`middleware/filesystem_guard.py`](https://github.com/TencentCloud/octop-harness/blob/v1.0.0/src/octop_harness/middleware/filesystem_guard.py), [`bwrap_shell.py`](https://github.com/TencentCloud/octop-harness/blob/v1.0.0/src/octop_harness/backends/bwrap_shell.py), and [`dangerous_shell_commands.yaml`](https://github.com/TencentCloud/octop-harness/blob/v1.0.0/src/octop_harness/security/tool_guard/rules/dangerous_shell_commands.yaml)

### Historical image sources

- The four UI screenshots in this article are from the earlier [`c04aacc6` README and user guide](https://github.com/TencentCloud/Octop/tree/c04aacc604a23ac05c00538f1bd4bc586fee6bb6); each caption links its source and the MIT license.

### Related reading

- [AIO Sandbox Asks Docker to Drop Seccomp Before It Sandboxes](/posts/aio-sandbox-confinement-contract-audit/)
- [OpenConnector Declares Its Own Defaults Out of Scope](/posts/open-connector-default-custody-audit/)
