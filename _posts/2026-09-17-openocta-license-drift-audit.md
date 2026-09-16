---
title: "OpenOcta's LICENSE is GPL-3.0 again, its README says Apache-2.0"
description: "Source Audit of openocta/openocta at 0c7dac2: the LICENSE file went GPL-3.0, Apache-2.0, then GPL-3.0 again on 16 Sep 2026, while both READMEs still say Apache-2.0."
categories: [AI, Agents]
tags: [ai-agents, open-source, licensing, trust-boundaries]
date: 2026-09-17 08:40:12 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-17-openocta-license-drift-audit/cover.png
  alt: "Flat vector illustration of a document with a seal that flips between two states above a timeline with three markers, representing a repository whose license file changed three times"
---

![Flat vector illustration of a document with a seal that flips between two states above a timeline with three markers, representing a repository whose license file changed three times](/assets/img/posts/2026-09-17-openocta-license-drift-audit/cover.png)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every license text, commit, diff line count, and README line quoted here was read from the pinned commit 0c7dac2 or a bounded GitHub API call before publication.

## 🤔 Curiosity: Which license does OpenOcta actually ship under?

[openocta/openocta](https://github.com/openocta/openocta/tree/0c7dac2284211facdfc813166fe648d093153bb6) is an AIOps agent that installs on Windows and macOS and answers natural-language inspection, alerting, and remediation questions about a company's infrastructure. At retrieval it carried 3,189 stars, was created on 2026-02-26, and its most recent push landed on 2026-09-16. That push is the commit this audit is pinned to, and its message is three words long: "Add LICENSE file".

That message is what made me look: a license file being "added" seven months after the repository was created, to a project with three thousand stars and a desktop installer. It turned out the file was not being added. It was being swapped, for the second time, and the two READMEs that most readers will actually open still describe a different license than the one in the file.

For an operations agent this matters more than it would for a library. OpenOcta is meant to sit on an ops host, run inspections, and take remediation actions. The teams that adopt it are exactly the teams whose compliance reviews ask one question first: under what terms is this thing on our machines?

## 📚 Retrieve: Three surfaces, three answers

### The pinned tree says three different things

I read every license-bearing file I could find in the tree at commit 0c7dac2 (the LICENSE, the two READMEs, the installer text, the two package manifests) and asked each one the same question.

| Surface | What it says at 0c7dac2 | Where |
|---|---|---|
| `LICENSE` | GNU General Public License, version 3 (35,149 bytes) | [LICENSE](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE) |
| `README.md` | Badge `License-Apache 2.0` (line 17) and "This repository is licensed under **Apache-2.0**." (line 460) | [README.md](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/README.md) |
| `README.cn.md` | Same badge (line 17) and "本仓库遵循 **Apache-2.0** 开源协议。" (line 460) | [README.cn.md](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/README.cn.md) |
| Windows installer `license.txt` | "本仓库遵循 GPLv3 开源限制" plus two conditions and a commercial-licensing contact | [deploy/windows/license.txt](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/deploy/windows/license.txt) |
| `ui/package.json`, `src/wails-bootstrap/package.json` | No `license` field at all | [ui/package.json](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/ui/package.json) |
| GitHub repository metadata | `license.spdx_id`: `GPL-3.0`, derived from the LICENSE file | [REST API](https://api.github.com/repos/openocta/openocta) |

The LICENSE file is what GitHub's license detector and most compliance tooling read; the README is prose about it. At this commit the file says GPL-3.0. But the README is what the badge shows, what the GitHub landing page renders, and what search snippets quote. Both the English and the Chinese README say Apache-2.0 in their own License sections, and the English README was last modified on 2026-08-31, about seven weeks after the file below it had been switched to Apache-2.0 and about two weeks before it was switched back.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-openocta-license-drift-audit/references/openocta-agent-chat.png" alt="OpenOcta desktop chat view used for natural-language inspection, alert analysis, data Q&A and remediation, as shown in the project README">
  <figcaption>The product the license terms attach to: the agent chat view from the README's feature tour, where natural-language inspection and remediation requests are typed &mdash; Image from openocta/openocta (GPL-3.0 LICENSE file at 0c7dac2), commit 0c7dac2. Source: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211128.png">https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211128.png</a>. Publisher: OpenOcta (openocta/openocta). Licence: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE">GPL-3.0</a>.</figcaption>
</figure>

### The LICENSE file has changed three times, and the last change undid the previous one

The commit history of the single file `LICENSE` has exactly three entries.

| Commit | Date (UTC) | Message | Resulting file |
|---|---|---|---|
| `4ed4f95` | 2026-02-28 | "Create LICENSE" | GPL-3.0, 35,149 bytes, SHA-256 `3972dc97…` |
| `53d5e0a` | 2026-07-10 | "Update LICENSE" | Apache-2.0, 11,357 bytes, diff +201 −674 |
| `0c7dac2` | 2026-09-16 | "Add LICENSE file" | GPL-3.0, 35,149 bytes, diff +674 −201, SHA-256 `3972dc97…` |

Two details in that table carry the audit. First, the September file is byte-identical to the February file: the same SHA-256, so this is a restoration of the original GPL-3.0 text, not a new variant. Second, the commit message "Add LICENSE file" describes a modification, not an addition: the API's file list for 0c7dac2 shows `LICENSE` as `modified` with 674 additions and 201 deletions, which is the GPL text replacing the Apache text line for line.

So the repository spent 68 days, from 2026-07-10 to 2026-09-16, with an Apache-2.0 LICENSE file, and the English README's last edit falls inside that window. I did not trace when the Apache-2.0 sentence first entered the README; what is verified is that it was there on 2026-09-09 and is still there after the restoration.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-openocta-license-drift-audit/references/openocta-employee-marketplace.png" alt="OpenOcta employee marketplace screen listing one-click ops digital employees, as shown in the project README">
  <figcaption>The employee marketplace screen from the README tour, one of the surfaces a downstream integrator would redistribute or embed &mdash; Image from openocta/openocta (GPL-3.0 LICENSE file at 0c7dac2), commit 0c7dac2. Source: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211216.png">https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211216.png</a>. Publisher: OpenOcta (openocta/openocta). Licence: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE">GPL-3.0</a>.</figcaption>
</figure>

### The installer has said GPLv3 the whole time, with two extra conditions

Windows desktop users are not shown the repository's LICENSE file at all. The README's download table points at `OpenOcta-amd64-installer.exe` and two `.dmg` files, and the NSIS script that builds the Windows installer inserts a license page from a local `license.txt` (`!insertmacro MUI_PAGE_LICENSE "license.txt"`, line 19). That file, identical in its two copies at `deploy/windows/license.txt` and `src/build/windows/installer/license.txt`, is short. It says the repository follows GPLv3 open-source restrictions, that you may build derivative works from the source, and that two rules apply: the OpenOcta logo and copyright information may not be replaced or modified, and derivative works must comply with GPLv3's open-source obligations. It closes with a commercial-licensing contact at a databuff.com address.

That text was created on 2026-03-20 with the v0.2.0 installer rework and last touched on 2026-04-14, when the contact email was changed. The version created on 2026-03-20 already said GPLv3 with the same two conditions; only the contact address changed later. In other words, the click-through terms said GPLv3 before, during, and after the 68-day Apache-2.0 window in the LICENSE file, and they attach brand and notice conditions that are not in the GPL-3.0 text itself. Whether those two conditions fit within what GPLv3 section 7 allows as additional terms is a legal question I am not qualified to settle; the audit finding is only that the installer's terms and the repository's terms are not the same document.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-openocta-license-drift-audit/references/openocta-skills-library.png" alt="OpenOcta Skills library screen grouping monitoring, DevOps and database skills, as shown in the project README">
  <figcaption>The Skills library from the README tour, an extension surface where copyleft scope questions arise for integrators &mdash; Image from openocta/openocta (GPL-3.0 LICENSE file at 0c7dac2), commit 0c7dac2. Source: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211148.png">https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211148.png</a>. Publisher: OpenOcta (openocta/openocta). Licence: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE">GPL-3.0</a>.</figcaption>
</figure>

### The business documents explain why GPLv3 is back

The tree contains two planning documents under `docs/` that are unusually candid. `docs/commercial-exploration-business.md` has a section titled "许可与合规（业务决策点）" whose first bullet reads: "OpenOcta 社区版：**GPLv3**，适合获客、POC、品牌；**对外 SaaS 或多租户托管需商业授权**。" The community edition is GPLv3; external SaaS or multi-tenant hosting requires a commercial license. The same document lists "GPL 许可边界" among its main risks and, in its closing questions, asks whether the boundary between GPL and SaaS has been confirmed by legal counsel: "**GPL 与 SaaS 边界** 是否已法务确认？"

The research companion, `docs/commercial-exploration-research.md`, says the commercial licensing route is handled because "README 已提供 sales@databuff.com", that the README already provides the sales contact. At the pinned commit neither README contains that address; the word `databuff` appears zero times in `README.md` and zero times in `README.cn.md`. The contact lives in the installer text and in the business plan, not in the READMEs.

Two things follow. The GPL-3.0 restoration is consistent with the project's own stated commercial model, which treats copyleft as the lever that makes a commercial license worth buying. And the model's central assumption, that SaaS use needs a commercial license, is one the license text itself does not make. GPLv3's definitions say so directly: "mere interaction with a user through a computer network, with no transfer of a copy, is not conveying." The network-interaction requirement that the business plan is reaching for is the GNU Affero GPL's, and GPLv3's own section 13 says that requirement applies to a combined work only when AGPL-licensed code is part of it. The plan's own open question about legal confirmation is, on this reading, the right question.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-openocta-license-drift-audit/references/openocta-knowledge-vault.png" alt="OpenOcta Knowledge Vault screen for runbooks and historical case retrieval, as shown in the project README">
  <figcaption>The Knowledge Vault from the README tour, where an operator's runbooks and past incidents are stored; the terms above govern the client that reads them &mdash; Image from openocta/openocta (GPL-3.0 LICENSE file at 0c7dac2), commit 0c7dac2. Source: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211804.png">https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211804.png</a>. Publisher: OpenOcta (openocta/openocta). Licence: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE">GPL-3.0</a>.</figcaption>
</figure>

### What the release channel did not say

The latest GitHub release at retrieval was v1.0.9, published 2026-09-09, a week before the LICENSE swap; its notes list three commits about missing signature files and contain no mention of licensing. v1.0.8 shipped on 2026-08-24, inside the Apache-2.0 window. Nothing in the three latest release notes, the two READMEs, or the three LICENSE commit messages announces a license change in either direction. A downstream team that pinned a July or August release and read the README of the day has a reasonable belief that they took Apache-2.0 code; a team that installed from the .exe read GPLv3 terms on the same day. Both are working from documents the project published.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-openocta-license-drift-audit/references/openocta-model-configuration.png" alt="OpenOcta model configuration screen for public and local model access, as shown in the project README">
  <figcaption>Model configuration from the README tour. The provider keys entered here are the operator's; the license question is about redistributing or embedding the client that holds them &mdash; Image from openocta/openocta (GPL-3.0 LICENSE file at 0c7dac2), commit 0c7dac2. Source: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211248.png">https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-211248.png</a>. Publisher: OpenOcta (openocta/openocta). Licence: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE">GPL-3.0</a>.</figcaption>
</figure>

## 💡 Innovation: Read the license the way you read a config default

The pattern here is the same one that keeps showing up in these audits: a project's prose describes one contract and its artifacts implement another. Yesterday it was a settings writer that never asked for a file mode while the plugin store did ([LLM Space](/posts/llm-space-api-key-file-mode-audit/)); this morning it was a sandbox whose quick starts turn off Docker's default seccomp filter ([AIO Sandbox](/posts/aio-sandbox-confinement-contract-audit/)). Licenses drift the same way, and the fix is the same: check the artifact, not the summary, at a pinned commit.

A license drift check for a repository takes five commands and no lawyer:

```bash
SHA=0c7dac2284211facdfc813166fe648d093153bb6
RAW=https://raw.githubusercontent.com/openocta/openocta/$SHA
curl -s $RAW/LICENSE | head -3                      # what the grant actually is
curl -s $RAW/README.md | grep -n -i 'licens'         # what the prose claims
curl -s "https://api.github.com/repos/openocta/openocta/commits?path=LICENSE" \
  | grep -E '"(sha|date|message)"'                  # how many times it moved
curl -s $RAW/deploy/windows/license.txt             # what installer users click through
```

Run those against any project you are about to put on production hosts and you get four answers that either agree or do not. When they do not, the decision table is short.

| Your use | GPL-3.0 file | Apache-2.0 README | Installer terms |
|---|---|---|---|
| Run it internally, unmodified | Fine under either | Fine | Fine |
| Fork, modify, and redistribute | Copyleft applies to the distributed work | Would not have applied | Brand and notice conditions added |
| Embed in a product you ship | Copyleft scope question for the combined work | Would not have applied | Same, plus a commercial-license invitation |
| Offer it as a hosted service | GPLv3 text: network interaction "is not conveying" | Not restricted | Vendor's business plan expects a commercial license |

The honest version of the last row is that the license text and the vendor's expectation point in different directions, and the vendor's own document says legal review is pending. A team in that row should get the answer in writing from the project rather than from a badge.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-openocta-license-drift-audit/references/openocta-model-setup-wizard.png" alt="OpenOcta model setup wizard shown in the README quick start">
  <figcaption>The model setup wizard from the README quick start, reached after installation. A Windows operator arriving here has already been shown the installer's GPLv3-plus-conditions page and may never open the repository &mdash; Image from openocta/openocta (GPL-3.0 LICENSE file at 0c7dac2), commit 0c7dac2. Source: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-220423.png">https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/imgs/readmePIC/QQ20260709-220423.png</a>. Publisher: OpenOcta (openocta/openocta). Licence: <a href="https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE">GPL-3.0</a>.</figcaption>
</figure>

## Limitations

- This is a document audit, not legal advice. I compared texts at a pinned commit; I did not assess whether the installer's two conditions are permitted additional terms under GPLv3 section 7, nor what rights, if any, a July or August adopter retains from the Apache-2.0 window. Both are questions for counsel.
- I read commit metadata, not intent. The commit author on all three LICENSE changes is the organization account. I did not search issues or discussions; the three latest release notes and the three commit messages do not explain either swap, and absence in what I searched is not proof that no explanation exists elsewhere.
- The READMEs may be corrected after this audit. Every line number and quotation here is tied to commit 0c7dac2, and the drift check above is meant to be re-run, not trusted.
- The package manifests without a `license` field are the frontend and the Wails bootstrap; I did not audit the Go module's third-party dependency licenses, and the bundled libffi carries its own notice.

## 🎯 Key Takeaways

- At commit 0c7dac2 the LICENSE file is GPL-3.0, both READMEs say Apache-2.0, the Windows installer text says GPLv3 with two added conditions, and the two package manifests say nothing.
- The LICENSE file was GPL-3.0 (Feb 28), then Apache-2.0 (Jul 10, +201 −674), then GPL-3.0 again (Sep 16, +674 −201, byte-identical to February). The commit that restored it is titled "Add LICENSE file".
- The English README was last edited on 2026-08-31, inside the 68-day Apache-2.0 window, and has not been updated since the restoration.
- The project's own business plan treats the community edition as GPLv3 with commercial licensing for SaaS and multi-tenant hosting, and asks whether that boundary has been legally confirmed; GPLv3's text says network interaction without transfer "is not conveying".
- Read the license artifact at a pinned commit and diff it against the prose before an ops agent goes on production hosts.

## 🤔 New Questions

- Will the READMEs be updated to GPL-3.0, or will the LICENSE file move a third time? The commit history of that one file is a better predictor than the README.
- Does the project intend AGPL semantics for hosted use? If so, the file that implements that intent is a different license text, not a business document.
- How many downstream forks and integrations were created during the Apache-2.0 window, and under which terms do their authors believe they are operating?

## References

**Primary sources (pinned to commit 0c7dac2 unless noted)**

- [LICENSE at 0c7dac2](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/LICENSE) — GNU GPL v3 text, 35,149 bytes
- [LICENSE at 53d5e0a](https://github.com/openocta/openocta/blob/53d5e0a/LICENSE) — Apache License 2.0 text, 11,357 bytes
- [LICENSE at 4ed4f95](https://github.com/openocta/openocta/blob/4ed4f95/LICENSE) — GNU GPL v3 text, byte-identical to 0c7dac2
- [Commit history of LICENSE](https://github.com/openocta/openocta/commits/main/LICENSE) — three commits: 2026-02-28, 2026-07-10, 2026-09-16
- [README.md](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/README.md) and [README.cn.md](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/README.cn.md) — Apache-2.0 badge and License sections
- [deploy/windows/license.txt](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/deploy/windows/license.txt) and [deploy/windows/openocta-installer.nsi](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/deploy/windows/openocta-installer.nsi) — installer license page
- [docs/commercial-exploration-business.md](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/docs/commercial-exploration-business.md) and [docs/commercial-exploration-research.md](https://github.com/openocta/openocta/blob/0c7dac2284211facdfc813166fe648d093153bb6/docs/commercial-exploration-research.md) — licensing and compliance sections
- [GitHub REST API: repository](https://api.github.com/repos/openocta/openocta) and [releases](https://api.github.com/repos/openocta/openocta/releases) — metadata and release notes at retrieval

**Related audits on this site**

- [AIO Sandbox Asks Docker to Drop Seccomp Before It Sandboxes](/posts/aio-sandbox-confinement-contract-audit/) — another repository whose stated license and shipped artifacts describe different things
- [LLM Space guards plugin settings with 0600 but not its API keys](/posts/llm-space-api-key-file-mode-audit/) — prose contract versus implemented contract in a desktop agent workbench
- [unity-mcp release-notes drift audit](/posts/unity-mcp-release-notes-drift-audit/) — documentation that lags the artifact it describes
