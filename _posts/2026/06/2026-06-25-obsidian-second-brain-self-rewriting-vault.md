---
published: true
title: "Obsidian's Rewrite Approval Setting Stops at Ingest"
description: "A pinned Obsidian Second Brain audit finds that ingest asks before rewriting by default, but reconcile instructions and an MCP write helper do not share that gate."
categories: [AI, Agents]
tags: [obsidian, agent-memory, mcp, write-safety, knowledge-base]
date: 2026-06-25 11:00:00 +0900
last_modified_at: 2026-10-17 22:45:00 +0900
archive_developed: 2026-10-17
archive_development_note: "Re-read the current upstream ingest and reconcile commands plus the pinned MCP write implementation, then tested the default confirm policy against replace_text in a temporary vault; this article maps the separate write paths."
pin: false
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-06-25-obsidian-second-brain/rewrite-paths.svg
  alt: "Three Obsidian Second Brain write paths: ingest asks for confirmation, reconcile directs automatic rewrites, and the MCP text replacement helper does not check the confirmation setting."
---

## Can one setting protect every route that edits an existing note?

An agent-maintained vault only stays trustworthy if its update rules apply at every place that can change a note. Obsidian Second Brain now describes a default confirmation rule for `/obsidian-ingest`: edits to existing pages are proposals, and the agent should wait for the user's yes. But the same upstream repository also contains a reconcile command that tells the agent to rewrite stale notes, and an MCP function that writes text directly. The setting does not govern all three paths.

I inspected upstream commit [`7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de`](https://github.com/eugeniughelbur/obsidian-second-brain/commit/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de), the default-branch tip on 2026-10-17. The useful finding is not that the project can rewrite a vault. It is that its approval promise changes depending on which command or adapter performs the write.

![Diagram comparing the ingest, reconcile, and MCP write paths](/assets/img/posts/2026-06-25-obsidian-second-brain/rewrite-paths.svg)

The scope matters. This audit establishes what the pinned command text and MCP helper say and do. It does not establish how every model, editor, adapter, or user-configured hook behaves.

## Ingest asks for a yes, unless the vault opts out

The current [`obsidian-ingest` command](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/commands/obsidian-ingest.md) distinguishes new pages from edits to existing ones. It says new notes may be written unattended. A change to an existing note should be summarized as a proposal, then held until the user confirms the batch. The command tells the agent to read `.vault-config.json`; `rewrite_policy: unattended` opts out. A missing, malformed, or unrecognized setting is treated as `confirm` by this instruction.

That is a useful workflow rule. It is still text given to an agent. In the inspected source, the configuration is checked as part of the ingest procedure; it is not shown as a global vault lock that every write must pass.

## Reconcile describes a second write policy

The separate [`obsidian-reconcile` command](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/commands/obsidian-reconcile.md) tells the agent to rewrite an outdated page when one source clearly wins. Its resolution steps do not refer to `rewrite_policy` or ask for confirmation before that write. The command also asks for an operation-log entry afterward.

This is not proof that every reconcile run will silently change a page: a model may follow other instructions, and the command is an instruction file rather than executable code. It does show that the default confirmation rule in ingest is not expressed consistently across the repository's two command paths.

## The MCP helper writes under `confirm`

The implementation makes the gap testable. In [`vault_ops.py` at the pinned commit](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/integrations/obsidian-mcp-server/vault_ops.py#L1035-L1064), `replace_text()` checks that the target stays inside the vault, rejects protected directories, requires the old text to match exactly once, checks that the file has not changed since it was read, and then writes the replacement atomically. It records the edit afterward. The function does not read `.vault-config.json` or test `rewrite_policy` before writing.

I checked that behavior on 2026-10-17 with a temporary vault containing `.vault-config.json` set to `{"rewrite_policy":"confirm"}` and a valid AI-first note. I loaded the pinned pure-Python module and called `replace_text("note.md", "Old claim.", "Rewritten claim.")`. It returned `updated: note.md` and `replacements: 1`; the note contained the replacement. This was a direct test of the helper, not a live Obsidian or Claude Code session. It demonstrates that this MCP write function does not enforce the confirmation setting, while leaving its path and exact-match protections intact.

The distinction is practical: exact-match and atomic-write checks reduce accidental patching, but they do not authorize the change. Likewise, the project's [AI-first validation hook](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/hooks/validate-ai-first.sh) reports format warnings after writes and exits successfully; it is not a pre-write approval gate. The hook is configured for particular host events, so its presence does not prove coverage of every adapter.

| Write path | What the pinned source says | What the check establishes |
|---|---|---|
| `/obsidian-ingest` | Existing-note edits wait for a yes by default; `unattended` opts out | An agent-facing procedure with an explicit default |
| `/obsidian-reconcile` | Clear contradictions are rewritten, then logged | A second instruction path with no stated `rewrite_policy` check |
| MCP `replace_text()` | Exact unique text is replaced atomically after path checks | A callable write path that does not inspect the confirmation setting |
| AI-first validation hook | Reports issues after supported writes | A non-blocking format check, not authorization |

## What changed since the June note

The original article followed the `akillness/obsidian-second-brain` fork at commit [`c8b1d8c1c5b41d4f1845f7188200d354837be96f`](https://github.com/akillness/obsidian-second-brain/tree/c8b1d8c1c5b41d4f1845f7188200d354837be96f), dated 2026-06-22. On the audit date, upstream `main` had advanced to `7b098c2`, and the latest fetched release tag was `v0.18.0` at `6eccc4d0a2e546be3f62d8881f72208bf43ad2b4`. These are separate snapshots. The earlier note collapsed distinct paths into one “self-rewriting” behavior; this rewrite checks the current upstream command and MCP implementations individually.

The source review also changes how to read the project's “self-rewriting” description. Ingest is designed to pause for approval under the default policy, but that promise is confined to that command's procedure. Reconcile and the MCP adapter expose separate write paths. The repo's own instructions still matter, but an operator who needs approval to be mandatory should test the host boundary that actually controls every write.

This narrow write-path question complements the broader [LLM Wiki review](/posts/llm-wiki-persistent-knowledge-base/), which examines agent-maintained knowledge bases, and the [GraphRAG and agent-memory comparison](/posts/ontology-graphrag-agent-memory/), which separates persistent context from governed writes. For a related execution-boundary example, see [HarnessRouter's task and execution contract](/posts/harnessrouter-execution-contract/).

## A safer deployment needs a gate at the write boundary

For a team evaluating this vault, treat `rewrite_policy: confirm` as an ingest instruction, not proof that existing notes cannot change without approval. Inventory every writer: command workflows, MCP tools, direct filesystem tools, scheduled agents, and host hooks. Then test each path against a fixture with the default policy. A true approval control should reject an unapproved write before bytes change, regardless of which command proposed it.

That recommendation is an inference from the inspected sources, not a claim that the project has a particular deployment failure. A small regression test would make the intended contract concrete: with `confirm`, a direct MCP replacement should require an approval token or return an authorization error; with `unattended`, it should write and record the chosen mode. Reconcile should use the same gate, and tests should assert both the unchanged file on denial and the audit record on approval.

The implementation already contains useful pieces: protected paths, unique anchors, atomic replacement, and an operation log. The missing piece in this path is a shared decision about who may approve a durable change. Keeping that decision in the host or a common write service would make it less dependent on an agent remembering which command is running.

## Key Takeaways

- Ingest's default confirmation behavior is documented in its command instructions.
- Reconcile instructions and the MCP `replace_text()` helper do not share that setting as an enforced check in the inspected source.
- Exact matching, path protection, atomic writes, and audit logging help control how a write happens; they do not establish user approval.
- Test the actual write adapter with the default configuration before treating an approval rule as a vault-wide guarantee.

## New Questions

- Should `rewrite_policy` be a shared check in every write function, or should the host pass an explicit approval capability to mutating tools?
- Can the operation log preserve the approver and the proposal that was approved without trusting the model-generated summary?
- Which host adapters can guarantee that all note edits, including scheduled work, pass through the same authorization boundary?

## References

**Pinned upstream source, read 2026-10-17:**

- [Default branch commit `7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de`](https://github.com/eugeniughelbur/obsidian-second-brain/commit/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de)
- [`commands/obsidian-ingest.md`](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/commands/obsidian-ingest.md)
- [`commands/obsidian-reconcile.md`](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/commands/obsidian-reconcile.md)
- [`integrations/obsidian-mcp-server/vault_ops.py`](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/integrations/obsidian-mcp-server/vault_ops.py)
- [`hooks/validate-ai-first.sh`](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/hooks/validate-ai-first.sh) and [`hooks/hooks.json`](https://github.com/eugeniughelbur/obsidian-second-brain/blob/7b098c2793651956eb3b5dc8e1ac2ccbe8a9d3de/hooks/hooks.json)
- [Release tag `v0.18.0`](https://github.com/eugeniughelbur/obsidian-second-brain/releases/tag/v0.18.0)

**Related analysis:**

- [LLM Wiki: agent-maintained knowledge base](/posts/llm-wiki-persistent-knowledge-base/)
- [GraphRAG, agent memory, and business ontology](/posts/ontology-graphrag-agent-memory/)
- [HarnessRouter execution contract](/posts/harnessrouter-execution-contract/)
