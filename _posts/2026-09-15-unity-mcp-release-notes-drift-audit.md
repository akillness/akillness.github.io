---
title: "MCP for Unity Ships a Drift Check No Workflow Ever Runs"
description: "Source Audit of CoplayDev/unity-mcp: the script built to stop stale release notes ships a --check mode no workflow runs, and its two files sit four releases behind."
categories: [AI, Tooling]
tags: [mcp, unity, game-development, ci, documentation, open-source]
date: 2026-09-15 10:50:36 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/release-sync-drift.svg
  alt: "Diagram of CoplayDev/unity-mcp at beta commit 2fcc1795: the GitHub Releases feed runs v10.0.0 through v10.2.0 between 2026-06-30 and 2026-09-01, while the README Recent Updates block and website/docs/releases.md both stop at v10.0.0, and the repository's tool-reference workflow runs its generator with --check on pull requests to beta and main while the release-notes workflow runs its generator in write mode on release events only"
---

![The unity-mcp release feed advanced four times between 2026-06-30 and 2026-09-01 while the two files its sync automation owns stayed on v10.0.0; the sibling docs workflow gates drift with --check on pull requests, the release-notes workflow never calls --check at all](/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/release-sync-drift.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every version, date and workflow trigger was read from the GitHub Releases API or from the pinned commit 2fcc1795 before publication.

## 🤔 Curiosity: Which version string in this repository is load-bearing?

[CoplayDev/unity-mcp](https://github.com/CoplayDev/unity-mcp/tree/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1) is a widely adopted Unity MCP bridge. It is MIT-licensed, created 2025-03-18, and at retrieval it carried 14,221 stars and 1,493 forks, far ahead of the other Unity Editor MCP servers I found while scoping this audit, the largest of which carried 243. It advertises "47 focused MCP tool entrypoints, any client, free & MIT" and is explicit that it "is not affiliated with Unity Technologies."

If you are wiring this into a game-production pipeline, the first practical question is not what the tools do. It is which version you are actually installing, because the Package Manager git URL in the Quickstart is the line a new user copies first.

I went looking for that answer and found five places that give one. They do not all agree.

The GitHub Releases API says the newest release is **v10.2.0**, published 2026-09-01. The Unity package manifest says `10.2.0` on `main` and `10.2.1-beta.6` on `beta`. The README's machine-maintained "Recent Updates" block says the newest release is **v10.0.0** from 2026-06-30. And the README's own install line, one screen below that block, tells you to `pin #v10.0.0` and calls it "this release."

Four releases shipped in between: v10.0.2 and v10.1.0 on 2026-07-13, v10.1.2 on 2026-08-02, and v10.2.0 on 2026-09-01.

That is a 63-day gap between what the documentation calls current and what the project actually shipped. The interesting part is not the gap. It is that this repository already built the machine to prevent it, and then built a second one that works.

## 📚 Retrieve: Reading the generator, then the workflow that runs it

### The stale block is generated, not written

The "Recent Updates" list is not prose someone forgot to update. It sits between two sentinels, `<!-- recent-updates:start -->` and `<!-- recent-updates:end -->`, and it is one of two artifacts owned by `tools/sync_release_notes.py`. The other is `website/docs/releases.md`, which carries this header:

> Auto-generated from the GitHub Releases API by `tools/sync_release_notes.py`. Do not hand-edit — changes will be overwritten on the next sync.

At the audited commit that file is 83,870 bytes and holds 63 release entries. Its newest is `### [v10.0.0](...) — 2026-06-30`, under a final series heading of `## v10.0 series`. Both generated surfaces are stale in exactly the same place, and the README block is stale identically on `beta` and on `main`.

### The script exists because this already happened once

The generator's own module docstring explains why it was written:

> Why a sync script: the previous releases.md was hand-maintained and went stale (it claimed v9.6.3 was latest when v9.7.0 had shipped). GitHub Releases is the single source of truth; this script makes it the only source.

That is the whole argument for automating the file, and it is a good one. The previous failure was one minor version of drift. The automated replacement is now four releases behind.

The script also ships the tool that would have caught it. Its documented usage block lists two modes:

```text
python tools/sync_release_notes.py                # write + verify
python tools/sync_release_notes.py --check        # CI: fail if drift
```

`--check` is described, in the project's own words, as the CI mode that fails on drift.

### Nothing calls it

`.github/workflows/sync-releases.yml` is the only workflow that touches the script. It runs `python tools/sync_release_notes.py` — write mode, no flag — and it fires on a deliberately narrow trigger set:

```yaml
on:
  release:
    types: [published, edited, unpublished, deleted]
  workflow_dispatch: {}
```

The workflow's header comment is unusually candid about why, and it is the sentence the artifact contradicts:

> `release.published / edited / unpublished / deleted`: the only time the synced files can legitimately go stale.

It then rules out the two triggers that would have caught this:

> Why no pull_request / schedule triggers: ... drift can't logically be introduced by a PR that the workflow couldn't already handle on release.

and

> A daily cron would mask the source-of-truth (release events) and produce mystery commits unattached to a release.

Both arguments are coherent. Both assume the release-triggered job succeeds. When it does not, there is no second chance: no cron to retry, no pull-request gate to notice, and `--check` sitting unused in a script the workflow already invokes.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/references/v5-install-flow.png" alt="Unity Package Manager with the Install package from git URL field highlighted in red, containing the unity-mcp git URL with a MCPForUnity path parameter and no branch or tag fragment">
  <figcaption>The install screenshot still shipped in the documentation tree. The git URL carries no branch or tag fragment, so Unity resolves the repository default branch &mdash; which is <code>beta</code>, not <code>main</code> &mdash; Image from CoplayDev/unity-mcp (MIT), commit 2fcc1795. Source: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_02_install.png">https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_02_install.png</a>. Publisher: CoplayDev (CoplayDev/unity-mcp). Licence: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE">MIT</a>.</figcaption>
</figure>

### The same repository already solved this, one workflow over

`.github/workflows/docs-generate.yml` owns the other generated documentation surface, the tool reference. It is titled "Docs — Reference Drift Check", and it is built the opposite way:

```yaml
on:
  pull_request:
    branches: [beta, main]
  push:
    branches: [beta]
  workflow_dispatch: {}
```

Its drift step runs `uv run python ../tools/generate_docs_reference.py --check`. Then it adds a second, cruder gate: count `@mcp_for_unity_tool` decorators, count generated reference pages, and exit non-zero if the two disagree.

So the repository holds two generated-documentation pipelines side by side. One is gated on pull requests that touch its inputs or its output, and cross-checked by a second independent count. The other is a fire-and-forget writer whose drift detector is never invoked. The ungated one is the one that is four releases behind. I did not independently regenerate the tool reference, so I am comparing the strength of the two gates, not certifying that the gated output is currently perfect.

### Why the sync may not be landing

The observable fact is the drift. The cause is not fully observable from outside, and I will not pretend otherwise.

What is visible: `beta` and `main` are both protected branches, and the sync job checks out `beta` with `persist-credentials: true` and the default `GITHUB_TOKEN`, then runs `git push origin beta`. A protected branch that requires pull requests or reviews would reject exactly that push. That is a plausible mechanism and nothing more — the specific protection rules are not readable without repository administration access, so I record it as **inferred**, not verified.

The audit does not depend on the cause. A generated file that silently stops regenerating is a problem whatever the reason, and `--check` in CI would have surfaced it on the next pull request regardless of which mechanism broke the push.

### The documentation images are an independent age record

The screenshots shipped under `docs/images/` date the same surface a second way, without needing the git history.

The Advanced Settings panel — the screen `SECURITY.md` points at for the "Allow LAN Bind (HTTP Local)" opt-in — reports **Version: v8.2.1** in its header, and its remote-server example is pinned to `@v6.3.0`.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/references/advanced-settings-panel.png" alt="MCP For Unity editor window showing Version v8.2.1, a Basic script validation level, and an expanded Advanced Settings section whose remote server example is pinned to v6.3.0">
  <figcaption>The Advanced Settings screenshot the security policy relies on: an editor window reporting v8.2.1, with a remote-server example pinned to <code>@v6.3.0</code> &mdash; Image from CoplayDev/unity-mcp (MIT), commit 2fcc1795. Source: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/advanced-setting.png">https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/advanced-setting.png</a>. Publisher: CoplayDev (CoplayDev/unity-mcp). Licence: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE">MIT</a>.</figcaption>
</figure>

The file named `v6_new_ui_dark.png` shows a window reporting **Version 5.0.0**, on a Stdio protocol with Unity port 6400 and server port 6500. I report what the pixels show; which of the filename and the window is the intended label is not something the tree settles.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/references/mcp-window-legacy-5-0-0.png" alt="Dark-theme MCP For Unity window filed under the v6 documentation name but reporting Version 5.0.0, with a Stdio protocol, Unity port 6400, server port 6500 and a Rebuild Server button">
  <figcaption>Filed under the v6 documentation name, reporting Version 5.0.0, on a Stdio protocol that the current README no longer leads with &mdash; Image from CoplayDev/unity-mcp (MIT), commit 2fcc1795. Source: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v6_new_ui_dark.png">https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v6_new_ui_dark.png</a>. Publisher: CoplayDev (CoplayDev/unity-mcp). Licence: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE">MIT</a>.</figcaption>
</figure>

The oldest is the most striking. The uninstall screenshot shows MCP for Unity **2.1.2**, installed from a git URL whose path parameter is `/UnityMcpBridge` — a subdirectory the current install line no longer uses, since the README now points at `/MCPForUnity`. A reader following the pictures and a reader following the text are installing from different paths.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/references/v5-uninstall-step.png" alt="Unity Package Manager detail pane for MCP for Unity version 2.1.2 with the Remove button highlighted, and an Installed From line pointing at a UnityMcpBridge path parameter">
  <figcaption>The uninstall step still ships a 2.1.2-era capture whose <em>Installed From</em> line uses the old <code>/UnityMcpBridge</code> path parameter &mdash; Image from CoplayDev/unity-mcp (MIT), commit 2fcc1795. Source: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_01_uninstall.png">https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_01_uninstall.png</a>. Publisher: CoplayDev (CoplayDev/unity-mcp). Licence: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE">MIT</a>.</figcaption>
</figure>

The rest of that flow is intact and still useful — the menu path and the rebuild confirmation have not changed shape.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/references/v5-open-mcp-window.png" alt="Unity Window menu expanded to the MCP For Unity submenu showing Setup Wizard, Check Dependencies and a highlighted Open MCP Window entry">
  <figcaption>The menu route into the bridge, unchanged across the version drift: Window &rarr; MCP For Unity &rarr; Open MCP Window &mdash; Image from CoplayDev/unity-mcp (MIT), commit 2fcc1795. Source: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_03_open_mcp_window.png">https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_03_open_mcp_window.png</a>. Publisher: CoplayDev (CoplayDev/unity-mcp). Licence: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE">MIT</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-15-unity-mcp-release-notes-drift-audit/references/v5-rebuild-success.png" alt="Unity modal dialog titled MCP For Unity reading Server rebuilt successfully with a single OK button">
  <figcaption>The rebuild confirmation from the same v5-era flow. A success dialog is the one artifact in this audit that says nothing about which version produced it &mdash; Image from CoplayDev/unity-mcp (MIT), commit 2fcc1795. Source: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_05_rebuild_success.png">https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/docs/images/v5_05_rebuild_success.png</a>. Publisher: CoplayDev (CoplayDev/unity-mcp). Licence: <a href="https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE">MIT</a>.</figcaption>
</figure>

### Where this actually bites

The drift is not cosmetic, because the same repository publishes a support policy keyed to versions. `SECURITY.md` supports exactly two things:

| Version | Supported |
|---|---|
| latest (`main`) | Yes |
| latest beta (`beta`) | Yes |
| older releases | No — please upgrade |

The README tells you to `pin #v10.0.0`. By the table above, that pin is an older release, and older releases are not supported. The install instruction and the security policy give opposite advice, and neither one is wrong on its own terms — the README line simply froze while the policy stayed general.

There is a second-order effect on the default path too. The documented install URL ends in `#main`, but the screenshot that illustrates it carries no fragment at all, and the repository's default branch is `beta`. A fragment-less git URL resolves the default branch, so the picture installs a prerelease line — `10.2.1-beta.6` at the audited commit — while the text installs the stable one.

## 💡 Innovation: A generator without a gate is just a slower hand-edit

The useful lesson here is not "this project has stale docs." It is that the project **correctly diagnosed the problem, built the right tool, and then wired it into the wrong shape** — and that the correct shape was already sitting in the same `.github/workflows/` directory.

Generated artifacts fail differently from hand-written ones. A hand-written file goes stale visibly: someone reads it, notices, and fixes it. A generated file goes stale invisibly, because everyone downstream assumes the generator ran. The header that says "Do not hand-edit — changes will be overwritten on the next sync" actively discourages the human correction that used to be the backstop. Automation removed the old failure mode and installed a quieter one.

That gives a rule worth carrying into any repository that generates documentation from a source of truth:

**An event-triggered writer is not a guarantee. Only a check that runs on a different schedule than the writer is a guarantee.**

The two workflows here sit on opposite sides of that rule. `docs-generate.yml` verifies on pull requests — a *different* event from the one that regenerates the reference — so drift has a standing chance to fail something a human is already looking at. `sync-releases.yml` verifies on the *same* event that writes, which means a failed write and a failed verify are the same failure. The surface with the independent check is not the one sitting four releases behind. The `--check` flag was already built. It needed one more workflow, triggered by anything other than a release, to become a gate instead of a comment.

The same question turns up whenever a repository publishes a signal about its own state. I asked a version of it about a CI badge in the [mjlab source audit](/posts/mjlab-source-audit/): what a green marker in a repository actually proves about the path a real user will take. Here the marker is a version number, and the answer is the same — it proves what it was last told, not what is true.

For a Unity team adopting this bridge, the practical takeaways are small and concrete. Pin deliberately rather than copying the parenthetical: at the audited commit the supported stable line is `v10.2.0`, not the `v10.0.0` the README suggests. Read the GitHub Releases tab rather than `releases.md` or the README block, since that is the source of truth all three are supposed to reflect. And treat the documentation screenshots as historical — they span 2.1.2 through v8.2.1 and at least one of them uses a path parameter that no longer exists.

None of this makes the project unsafe or unserious. It is MIT, it moves fast, its security policy is specific about fail-closed network defaults, and its tool-reference pipeline is better gated than most repositories manage. That is exactly what makes the gap legible: the standard applied to one generated file is visibly higher than the standard applied to the other.

## 🎯 Key Takeaways

- At beta commit `2fcc1795`, the newest release is **v10.2.0** (2026-09-01), while the README "Recent Updates" block and `website/docs/releases.md` both stop at **v10.0.0** (2026-06-30) — four releases and a 63-day gap.
- `tools/sync_release_notes.py` was written specifically because a hand-maintained `releases.md` went stale by one minor version. The automated replacement is now four releases stale.
- The script documents a `--check` mode as "CI: fail if drift". No workflow in the repository invokes it.
- `docs-generate.yml` runs its sibling generator with `--check` on pull requests to `beta` and `main` that touch the tool registry, the generated reference or the generator itself, plus a decorator-versus-page count check. That surface has a gate; the stale one does not.
- `sync-releases.yml` fires only on release events and `workflow_dispatch`, runs the script in write mode, and pushes to a protected branch. Its own comment calls release events "the only time the synced files can legitimately go stale."
- The README says to `pin #v10.0.0`; `SECURITY.md` says older releases are not supported. Both statements are live at the same commit.

## 🤔 New Questions This Raises

- If the sync push is being rejected by branch protection, does the workflow surface a red run, or does it fail in a way maintainers have learned to scroll past?
- Is there a general rule for when a generated artifact needs a verifier on an independent trigger — or should every `--check` flag ship with a mandatory second workflow by convention?
- OpenUPM installs bypass the git URL entirely. Does the registry version track `main`, and does that make the README's git-URL advice the least reliable of the available install paths?
- How many other high-star repositories carry a documented drift-check flag that no pipeline calls?

## Limitations

This audit reads public artifacts only. I did not run the Unity Editor, install the package, execute the MCP server, or observe the sync workflow's run history, so the *cause* of the missing sync is explicitly marked inferred rather than verified — branch protection is one plausible mechanism among several, and the protection rules themselves are not publicly readable. Star and fork counts are point-in-time. The version and date claims are pinned to `2fcc1795` on `beta` and `30d22075` on `main` and will age: a single successful sync run would close the documentation gap described here, which is the outcome this audit would like to be wrong about. Statements about the project's network defaults are quoted from `SECURITY.md` and were not independently exercised.

## References

**Primary — repository at pinned commit**

- [CoplayDev/unity-mcp at `2fcc1795`](https://github.com/CoplayDev/unity-mcp/tree/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1)
- [`README.md`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/README.md) — Quickstart install line, Recent Updates sentinel block
- [`SECURITY.md`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/SECURITY.md) — Supported Versions table, network defaults
- [`tools/sync_release_notes.py`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/tools/sync_release_notes.py) — rationale docstring, `--check` usage
- [`.github/workflows/sync-releases.yml`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/.github/workflows/sync-releases.yml) — trigger set, write-mode invocation
- [`.github/workflows/docs-generate.yml`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/.github/workflows/docs-generate.yml) — `--check` drift gate, tool-count sanity step
- [`website/docs/releases.md`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/website/docs/releases.md) — generated release history
- [`MCPForUnity/package.json`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/MCPForUnity/package.json) — package version on `beta`
- [`LICENSE`](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/LICENSE) — MIT, basis for image reuse

**Primary — official API**

- [Repository object](https://api.github.com/repos/CoplayDev/unity-mcp) — default branch, licence, counts, timestamps
- [Latest release](https://api.github.com/repos/CoplayDev/unity-mcp/releases/latest) — v10.2.0
- [Release list](https://api.github.com/repos/CoplayDev/unity-mcp/releases?per_page=12) — release dates and targets
- [Branch list](https://api.github.com/repos/CoplayDev/unity-mcp/branches?per_page=100) — protection flags

**Related reading on this site**

- [mjlab Source Audit: The Green Badge Proves the CPU Path](/posts/mjlab-source-audit/)
- [Apache Maka Tracks Its Agents' Screenshots and Ships None of Them](/posts/maka-working-record-audit/)
