---
title: "MEX on macOS Broke Before Project Memory Even Loaded"
description: "A Source Audit of a real mex command collision, the resolver that fixed it, and a stale graph coordinate that only a clean rebuild exposed."
date: 2026-09-20 00:08:04 +0900
last_modified_at: 2026-09-20 01:21:55 +0900
categories: ["AI"]
tags: ["mex", "agent memory", "code graph", "macos", "cli", "agents.md"]
image:
  path: /assets/img/posts/2026-09-20-mex-macos-command-collision/mex-command-resolution.svg
  alt: "A safe resolver rejects the TeX Live mex command and selects the mex-agent wrapper before querying the MEX graph"
pin: false
toc: true
math: false
---

`command -v mex` returned a clean answer on the measured macOS host. It was also the wrong answer.

```text
$ command -v mex
/opt/homebrew/bin/mex

$ mex --version
pdfTeX 3.141592653-2.6-1.40.27 (TeX Live 2025/Homebrew)
```

The path existed, the process ran, and the version command exited normally. None of that meant the integration had reached [MEX](https://github.com/mex-memory/mex), the intended repository-memory and code-graph tool. Homebrew's TeX Live distribution already owned the short command name.

That distinction matters because the npm package is named `mex-agent`, but its package manifest installs one executable called `mex`. A setup script that asks only whether `mex` exists can therefore approve an unrelated program and fail much later, after project memory, graph generation, or agent routing appears broken.

This audit follows the failure through three separate gates: executable identity, project-anchor loading, and a real graph query. It also keeps an important version boundary visible. The installed runtime measured below is `mex-agent` 0.7.1; npm release 0.8.2 was inspected on 2026-09-20 KST without upgrading the installed runtime.

## 🤔 Curiosity: a successful lookup was the first failure

The collision looks trivial until its false conclusions are expressed explicitly:

1. `command -v mex` succeeds, so MEX must be installed.
2. `mex --version` succeeds, so the installation must be healthy.
3. `.mex/` already exists, so every agent must know how to load it.
4. A setup command completed once, so code-graph queries must work now.

Each statement skips a different boundary.

The upstream 0.8.2 package manifest inspected on 2026-09-20 KST makes the namespace risk concrete. The package is `mex-agent`, requires Node.js 22.5 or newer, and maps `bin.mex` to `dist/cli.js`. On the measured host, however, the bare name resolved to pdfTeX. The only reliable response was to stop treating a pathname as proof of identity.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-mex-macos-command-collision/references/mex-dashboard.jpg" alt="MEX terminal dashboard showing project context and grounding metrics" loading="lazy">
  <figcaption>MEX's product surface comes after command resolution. Source: <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/screenshots/mex-DashNew.jpg">pinned screenshot</a> by mex-memory/mex contributors under the <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/LICENSE">MIT License</a>. Privacy-safe crop of the pinned product screenshot; no content was added.</figcaption>
</figure>

The dashboard is useful context, but it cannot prove which binary a shell invoked. That proof must come first.

## 📚 Retrieve: MEX has three different kinds of state

The upstream documentation separates canonical team memory from local indexes. Repository Markdown, selected project instructions, and curated wiki material can be committed. Files such as `.mex/graph.db`, `.mex/wiki.db`, and `.mex/local/` are rebuildable or machine-local and should stay out of Git.

That creates three independent questions. If the actual decision is hosted cross-client memory rather than repository-local state, the [Omnigent and Hindsight audit](/posts/omnigent-hindsight-universal-memory/) covers that different seam.

| Layer | Question | Evidence used here |
|---|---|---|
| Executable | Did the shell invoke MEX rather than another `mex`? | Path plus semantic-version identity check |
| Agent anchor | Will the host agent discover the MEX routing instructions? | Root `AGENTS.md` bridge loading `.mex/ROUTER.md` |
| Project graph | Can MEX answer a symbol-grounded question in this checkout? | Live `where-defined` query with file and line coordinates |

A green answer at one layer says nothing conclusive about the next.

This is also why `mex check` is not treated as a passive package-presence test. It is a project-health operation. Strict read-only audits replay it against a scratch copy rather than assuming it cannot refresh a local database.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-mex-macos-command-collision/references/mex-check-report.jpg" alt="MEX check terminal report listing project-memory health findings" loading="lazy">
  <figcaption>A health report evaluates project memory after the correct runtime has been selected. Source: <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/screenshots/mex-check.jpg">pinned screenshot</a> by mex-memory/mex contributors under the <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/LICENSE">MIT License</a>. Privacy-safe crop of the pinned product screenshot; no content was added.</figcaption>
</figure>

The 0.8.2 setup inspected on 2026-09-20 KST has moved further than the installed runtime used in this integration. It opens a loopback Hub by default, while `setup --cli` preserves a terminal path. Its documented agent integrations write project instructions that route through `.mex/AGENTS.md` and `.mex/ROUTER.md`.

jeo, gjc, and jeopi use a root `AGENTS.md` contract. For `--tool codex` or `multiple`, the published installer preserves an existing root `AGENTS.md`; otherwise it mirrors `CLAUDE.md`, or creates a bridge when `.mex/AGENTS.md` exists. The workstation anchors and `.mex/` state observed in this audit were untracked and are not part of the public implementation commit.

## 💡 Innovation: resolve capability, not command names

The published fix in [`akillness/jeo-skills`](https://github.com/akillness/jeo-skills/commit/a71ddf92a07fbb56ee16f17167db9b411d265315) uses a narrow resolution order:

1. honor an explicit `MEX_AGENT_BIN` override;
2. prefer an executable named `mex-agent` on `PATH`;
3. try `~/.local/bin/mex-agent`;
4. accept bare `mex` only if its first version line has a semantic-version shape.

The named wrapper resolves an installed CLI and Node executable rather than asking `npx` to select a package on every call:

```sh
CLI="$(find_cli)" || exit 127
NODE="$(find_node)" || exit 127
exec "$NODE" "$CLI" "$@"
```

`find_cli` honors `MEX_AGENT_CLI` and searches known global-install locations. `find_node` honors `MEX_AGENT_NODE` before checking the host. These overrides must be supplied in the command environment; an unexported shell variable will not reach child scripts. Other scripts can then ask for `mex-agent`, an unambiguous capability name, while upstream continues exposing its documented `mex` command. The wrapper neither replaces TeX Live's binary nor reorders the user's entire `PATH`.

The identity test is intentionally fail-closed for the recorded collision. `pdfTeX 3.141592653-2.6-1.40.27 ...` does not begin with a semantic version such as `0.7.1`, so the resolver rejects it. This is not cryptographic package attestation, but it is materially stronger than “the command exists.”

### The regression test narrows what the resolver proves

The fixture places a TeX-like `mex` in a fake bin directory and a fake `mex-agent` under the test home's `.local/bin`. TeX version probes are allowed; any other call to the fake TeX command returns status 91.

The recorded suite passed while checking helper forwarding, a mirrored root `AGENTS.md`, installer graph/check calls, and installation of an unambiguous wrapper when bare `mex` has a valid version. Both fixture projects already contain `.mex/`, so neither case exercises a fresh setup. Installer graph/check failures also become warnings, which means the suite does not prove that every wrong-binary path must exit 91.

The bounded result is still useful: the selected helper paths used `.local/bin/mex-agent`, non-version work did not reach the TeX fixture, and the anchor branches behaved as asserted.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-mex-macos-command-collision/references/mex-check-summary.jpg" alt="MEX check terminal summary showing project checks and a drift score" loading="lazy">
  <figcaption>A concise result is useful only when the command and project boundaries were verified first. Source: <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/screenshots/mex-check1.jpg">pinned screenshot</a> by mex-memory/mex contributors under the <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/LICENSE">MIT License</a>. Privacy-safe crop of the pinned product screenshot; no content was added.</figcaption>
</figure>

### A separate jeopi audit checked the host boundary

The test suite alone could still agree with its own assumptions. A separate jeopi agent audit left the live project unchanged, ran regression fixtures in temporary directories, and observed the root `AGENTS.md` anchor loading `.mex/ROUTER.md`. It also confirmed that the wrapper selected `mex-agent` rather than TeX Live.

This was another agent run, not independent human review. jeo and gjc share the same root-`AGENTS.md` contract and generated bridge, but they were not separately replayed here. Compatibility remains a bounded implementation claim.

### The graph query exposed a stale local index

The first live query was a real question against the code graph:

```text
mex-agent graph query where-defined validate_frontmatter_frozen
```

The installed 0.7.1 runtime returned this stored coordinate:

```text
scripts/validate-catalog-projections.py:456-547
callers: 3
callees: 7
truncated: false
```

The symbol and path were right, but the pinned `a71ddf92` source spans lines 469-560. That made the first query evidence of graph access, not graph freshness.

A clean scratch clone at the pinned commit resolved the ambiguity. Rebuilding there produced 205 nodes and 358 edges across 13 files in 802 ms. The same query then returned lines 469-560 with the same three callers, seven callees, and body hash as the stale result.

The stronger completion test is therefore query plus freshness: compare at least one returned coordinate with pinned source, and rebuild the local index in an isolated checkout when they diverge.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-mex-macos-command-collision/references/mex-sync-preview.jpg" alt="MEX targeted repair preview for project-memory drift findings" loading="lazy">
  <figcaption>A targeted repair preview shows proposed project-memory updates; the article separately distinguishes committed Markdown from local indexes. Source: <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/screenshots/mex-sync.jpg">pinned screenshot</a> by mex-memory/mex contributors under the <a href="https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/LICENSE">MIT License</a>. Privacy-safe crop of the pinned product screenshot; no content was added.</figcaption>
</figure>

## 🎯 Key Takeaways

This incident produced a reusable sequence:

1. Resolve the command path.
2. Inspect behavior, not just presence.
3. Give automation an unambiguous capability name.
4. Make wrong-identity routing observable in a regression fixture.
5. Verify the host instruction anchor separately.
6. Finish with one real project query.
7. Record the runtime version actually tested.
8. Recheck publication boundaries such as MCP and telemetry from primary sources.

The key shift is simple: installation is not a state. It is a chain of independently testable boundaries.

For the architectural layer behind that chain, read [From RAG to Context Layer: What Genie Ontology, LLM Wiki Memory, and HyGRAG Tell Us About the Next Stack](/posts/ontology-graphrag-agent-memory/). It explains how durable memory, provenance, and maintained knowledge fit around the local executable and graph concerns audited here.

## 🤔 New Questions

Two upstream boundaries matter before copying this integration elsewhere.

First, the local helper and its prompt automation were replayed with `mex-agent` 0.7.1. Release 0.8.2, inspected on 2026-09-20 KST, has a Hub-first setup flow. The command resolver, wrapper, anchor bridge, and graph query remain useful, but the old setup-answer script is not presented as full automation of the new Hub without a dedicated 0.8.2 test.

Second, the repository contains a `packages/mex-mcp` source package. At retrieval on 2026-09-20 KST, the 0.8.2 README described MCP as source-only and the `mex-mcp` npm endpoint returned 404. This establishes no published npm MCP package at that boundary, not that the source cannot be built locally.

There is also a privacy decision to make. MEX telemetry is documented as pseudonymous and opt-out. The commands below use upstream's `mex` spelling; on a colliding host, invoke them through the verified MEX entry point or prefer the environment controls. The documented controls include:

```text
mex telemetry disable
mex config set telemetry off
DO_NOT_TRACK=1
MEX_TELEMETRY=0
```

The 0.8.2 policy excludes source code, prompts, memory content, file paths, Git remotes, names, and emails from telemetry events. It separately describes voluntary contact forms that collect an email address and optional name. The policy also avoids promising complete anonymity because the receiving service can observe ordinary transport metadata.

## References

- [MEX repository at audited commit](https://github.com/mex-memory/mex/tree/2f074dc2c73c51679a1f9564ee4c36993f36edf4)
- [MEX 0.8.2 package manifest](https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/package.json)
- [MEX telemetry policy](https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/TELEMETRY.md)
- [MEX MIT license](https://github.com/mex-memory/mex/blob/2f074dc2c73c51679a1f9564ee4c36993f36edf4/LICENSE)
- [jeo-skills implementation commit](https://github.com/akillness/jeo-skills/commit/a71ddf92a07fbb56ee16f17167db9b411d265315)
- [Fail-closed resolver](https://github.com/akillness/jeo-skills/blob/a71ddf92a07fbb56ee16f17167db9b411d265315/.agent-skills/mex/scripts/runtime.sh)
- [Regression fixture](https://github.com/akillness/jeo-skills/blob/a71ddf92a07fbb56ee16f17167db9b411d265315/.agent-skills/mex/scripts/test-runtime.sh)

### Screenshot license notice

The four cropped MEX product screenshots retain the upstream MIT notice:

```text
MIT License

Copyright (c) 2026 Daksh Jaitly

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness. A separate jeopi agent run replayed CLI checks, regression fixtures, and graph queries; this was not independent human review or verification that graph coordinates matched the pinned source.
