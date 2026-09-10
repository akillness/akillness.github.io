---
title: "HyperFrames Measures 'Same Video' in Decibels, Not Bytes"
description: "A commit-pinned hyperframes audit: byte equality stops at one format, encoded goldens pass at 20-45 dB checkpoints, and 28 of 79 fixtures are recorded as never run in CI."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, ai-video, ci, open-source]
date: 2026-09-11 00:18:42 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-11-hyperframes-determinism-audit/determinism-ladder.svg
  alt: "Four-tier ladder of how hyperframes verifies rendering: byte equality for the png-sequence format only, PSNR floors declared by 78 fixtures and sampled at 100 checkpoints for encoded output, structure-only ffprobe checks on Windows, and 28 of 79 fixtures recorded as never run in CI"
---

![Four-tier ladder of how hyperframes verifies rendering, from byte equality for one format down to 28 fixtures recorded as never verified in CI](/assets/img/posts/2026-09-11-hyperframes-determinism-audit/determinism-ladder.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: What does "deterministic" survive contact with an encoder?

[HyperFrames](https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03) is HeyGen's open-source HTML-to-video renderer — "Write HTML. Render video. Built for agents." The repository is Apache-2.0, created 2026-03-10, and carried 48,651 stars with a last push on 2026-09-10 at retrieval; the npm CLI sits at 0.8.33. This audit pins the tree at commit `d4fba55a`.

The README's Why-HyperFrames list leads with a strong word: "**Deterministic:** same input, same frames, same output. Built for CI, regression tests, and automated rendering." A few sections earlier it says the renderer seeks each frame in headless Chrome and encodes with FFmpeg, "so the same input produces the same video."

For an agent pipeline, that promise is the whole product. An agent cannot eyeball a render; if the same composition can come back different, every automated diff, cache key, and approval flow downstream is built on sand. So I asked the question that decides whether you can bet CI on it: **where, in the shipped tree, is "same output" actually asserted — and in what units?**

The answer has four tiers, and only one of them is bytes.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-11-hyperframes-determinism-audit/references/promo-fixture-editor.png" alt="HeyGen video editor interface showing a script panel beside a blue slide preview, committed as a source asset of the heygen-promo-preview-assets regression fixture">
  <figcaption>Production pedigree, committed as test input: a HeyGen editor screenshot shipped as a source asset of the heygen-promo-preview-assets golden fixture &mdash; a fixture the shard schedule lists as never having run in CI &mdash; Screenshot: HeyGen product editor, committed as a promo-fixture asset in heygen-com/hyperframes (hero-prism.png), Apache-2.0, pinned at d4fba55a. Source: <a href="https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03">https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03</a>. Publisher: HeyGen (heygen-com/hyperframes maintainers). Licence: <a href="https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE">https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE</a>.</figcaption>
</figure>

## 📚 Retrieve: Reading the verification, not the promise

I audited the pinned tree through a shallow clone at `d4fba55a` plus the GitHub and npm APIs. Every quote below carries its file coordinate; nothing in this section comes from running a render.

### The shipped contract is decibels

The producer package carries the golden suite: 79 fixture directories, each with a `meta.json` and a source composition; all but two also carry a checked-in golden baseline (the transparency smoke test asserts alpha directly, and one never-ran excluded fixture has no baseline yet). The suite's own README states the comparison model in its first paragraph: the harness "walks every subdirectory, runs the composition, and PSNR-compares the rendered output against a checked-in golden baseline."

PSNR is a similarity score, not an identity check. The harness samples it at 100 evenly spaced checkpoints — one per 1% of duration, per the code at `regression-harness.ts:1302` — so for encoded output, frames between checkpoints are never compared at all.

How close is close enough? Each fixture writes its own floor. Scanning all 79 manifests at the pin:

| `minPsnr` floor | Fixtures | Reading |
|---|---|---|
| 20 dB | 4 | visibly lossy tolerance |
| 25 dB | 10 | loose |
| 28 dB | 3 | HDR fixtures |
| 30 dB | 58 | the de-facto standard |
| 40 dB | 1 | tight |
| 45 dB | 2 | near-identical |
| none | 1 | transparency smoke test, separate script |

Fifteen fixtures additionally allow checkpoint failures below the floor: five tolerate 2 failing checkpoints, four tolerate 5, and six tolerate 10. Audio never claims identity either — it passes on cross-correlation against a threshold (`minAudioCorrelation`, 0..1) with allowed lag windows, plus an opt-in residual-RMS check.

None of this is hidden; it is authored, reviewed tolerance engineering. But it means the operative contract for every encoded format is *within N dB of the golden at sampled points*, not "same frames, same output."

### Bytes exist — for exactly one format

The harness has one branch that asserts byte equality, and it is the format that skips the encoder: `png-sequence` output compares every rendered frame with `renderedBytes.equals(snapshotBytes)`, recording PSNR as Infinity for identical frames and 0 otherwise. Unencoded frames can be bit-stable; encoded video is compared in decibels. The byte-exact contract stops at the encoder boundary, and the code is candid about it — the comment at `regression-harness.ts:98-99` says png-sequence gets "per-frame byte equality instead of PSNR."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-11-hyperframes-determinism-audit/references/golden-frame-001.png" alt="First golden baseline frame of the png-sequence fixture: the words PHASE and ALPHA ONE in indigo type above a circular icon on a transparent background">
  <figcaption>Golden frame 1 of the png-sequence fixture, initial ALPHA ONE state &mdash; one of the frames the harness compares byte-for-byte &mdash; Golden baseline frame 1: png-sequence distributed fixture, heygen-com/hyperframes, Apache-2.0, pinned at d4fba55a. Source: <a href="https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03">https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03</a>. Publisher: HeyGen (heygen-com/hyperframes maintainers). Licence: <a href="https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE">https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-11-hyperframes-determinism-audit/references/golden-frame-030.png" alt="Mid-transition golden baseline frame 30 of the png-sequence fixture: the word ONE morphing toward TWO with visible ghosting in the indigo title">
  <figcaption>Golden frame 30, mid-transition ghosting as ONE morphs toward TWO &mdash; byte-stable only because these frames never meet FFmpeg's encoder &mdash; Golden baseline frame 30: png-sequence distributed fixture, heygen-com/hyperframes, Apache-2.0, pinned at d4fba55a. Source: <a href="https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03">https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03</a>. Publisher: HeyGen (heygen-com/hyperframes maintainers). Licence: <a href="https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE">https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-11-hyperframes-determinism-audit/references/golden-frame-060.png" alt="Final golden baseline frame 60 of the png-sequence fixture: the words PHASE and ALPHA TWO in indigo type above a circular icon on a transparent background">
  <figcaption>Golden frame 60, final ALPHA TWO state &mdash; the third distinct state of the sequence whose 60 frames form the harness's byte-equality branch &mdash; Golden baseline frame 60: png-sequence distributed fixture, heygen-com/hyperframes, Apache-2.0, pinned at d4fba55a. Source: <a href="https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03">https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03</a>. Publisher: HeyGen (heygen-com/hyperframes maintainers). Licence: <a href="https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE">https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/LICENSE</a>.</figcaption>
</figure>

### Reproducibility is scoped to one container — half-pinned

The fixture docs order baselines to be generated "**Always inside Docker**", with the reason spelled out: "Host Chrome / FFmpeg versions drift across distros, so a baseline captured on the host won't match the bytes CI renders." That sentence is the project's own scoping of byte-level reproducibility: it holds inside one pinned image, not across machines.

The image itself is only half-pinned. `Dockerfile.test` installs chrome-headless-shell at the exact patch version `148.0.7778.167` — and installs ffmpeg from Debian bookworm's apt with no version constraint. The browser half of the pipeline is pinned to the build; the encoder half is pinned only as hard as a Debian stable package.

### The determinism engineering is real

To be clear about what this audit is *not* saying: the input side of the promise is seriously engineered. The engine launches Chrome with a nine-flag deterministic set — `--deterministic-mode`, `--enable-begin-frame-control`, `--run-all-compositor-stages-before-draw`, and six more — and drives the compositor frame-by-frame. When BeginFrame control is unsupported and capture falls back to screenshot mode, the code strips exactly those flags rather than carry them incoherently. When a requested hardware GPU is missing, the warning names the deterministic alternative in as many words: "Pass --no-browser-gpu to select deterministic SwiftShader instead of waiting on a hardware path that is not there."

The agent-facing skill enforces the same discipline on composition authors: "Every frame must be reproducible from its time value alone — same input time → same pixels," with bans on `Date.now()`, unseeded `Math.random()`, render-time fetches, and hover/scroll state. Determinism in equals determinism out is a real, enforced authoring contract.

Even the measuring stick got correctness review: a comment in the harness records that pairing frames by presentation timestamp instead of decode index once moved 80 of 100 checkpoints by more than 2 dB on one fixture and made three byte-identical frames read 82, 38, and 51 dB. They found and fixed their own instrument error — and documented it.

### The ledger the README doesn't mention

The artifact that decides this audit is `packages/producer/tests/shard-schedule.json` — a file the README never references (a case-insensitive scan of the pinned README finds no occurrence of "shard", "excluded", or "never run"). Its comment block states the rule: "Every fixture on disk must appear in exactly one of 'timings' or 'excluded', or CI fails." The shard planner enforces it — an unaccounted fixture throws, so the excluded list is live, CI-checked configuration, not a stale note. The regression workflow that consumes it runs on every code-touching pull request and push to main, with the stated goal that "a new fixture cannot silently never run." The schedule was last modified on 2026-09-08, two days before the pin.

Read the ledger, though, and the honesty cuts the other way. Of 79 fixtures, 50 are scheduled into CI shards. The other 29 carry recorded reasons:

- **25 fixtures**: "Was absent from the hand-written shard matrix, so it has never run in CI and its cost and pass state are unknown. Triage and either schedule it or record a real reason here."
- **3 fixtures**: rejected by the harness at load time for invalid `meta.json` audio fields — "so it has never run despite looking scheduled-able. Fix the metadata, then schedule it."
- **1 fixture**: the transparency check, excluded by design because a separate script asserts a real alpha channel instead of comparing to a golden MP4.

That is 28 of 79 golden fixtures — including the d3, leaflet, mapbox, maplibre, and google-maps adapter fixtures, and the HeyGen promo fixture pictured above — recorded, in the repository's own words, as never run in CI, 25 of them with pass state explicitly unknown. The guard that stops future drift is excellent; what it guards today is a suite where more than a third of the goldens are IOUs.

### Windows renders are checked for shape, not pixels

Cross-platform, the tiers drop again. The Windows workflow's own comment explains that the producer suite is skipped there because it requires "Docker / Linux-only tooling (Dockerfile.test, LFS golden MP4 baselines)." What Windows CI does verify is a canary render probed with ffprobe: width 1920, height 1080, exactly 30/1 fps, duration between 7.5 and 8.5 seconds. On Windows, "same output" is asserted as *a video of the right shape came out* — no pixel of it is compared to anything.

The public docs, interestingly, already speak this more careful language. The introduction page describes the property as "**Reliable render**" — a slow machine "does not drop moments from the finished video" — without using the word deterministic on that page. The absolute register lives in the README.

## 💡 Innovation: Determinism is a ladder, and you should label your rungs

I went in expecting to test a claim and came out adopting a taxonomy. What HyperFrames actually ships is a four-rung ladder, and the audit's real lesson is that every rendering pipeline has one, written down or not:

1. **Bytes, narrowly scoped.** Bit-identity is asserted only where the encoder is out of the loop (png-sequence frames) and only inside one pinned container. If your cache keys or dedup logic assume byte-stable MP4s across machines, this repo's own docs tell you that assumption is wrong even for them.
2. **Decibels for everything encoded.** 30 dB at 100 sampled checkpoints is the de-facto contract, with authored exceptions down to 20 dB and up to 10 tolerated failures. The floors are per-fixture, versioned, and reviewable — tolerance as code.
3. **Structure across platforms.** Where goldens cannot follow (Windows), the assertion degrades to ffprobe shape checks — explicitly, with the reason in a comment.
4. **Recorded absence.** The uncomfortable rung: fixtures that verify nothing yet, held in a CI-enforced ledger that says so verbatim instead of letting them look green.

For my own harness work — where a build gate that silently skips is the recurring villain — rung 4 is the pattern worth stealing: **make "we don't run this" a validated artifact with a reason string, not an accident of a hand-written matrix.** The planner that fails on unaccounted fixtures turned HyperFrames' drift into reviewable text; that is exactly how a [screenshot-hash drift ledger works in diagram-design](/posts/diagram-design-drift-audit/), which chose the opposite rung for its goldens — byte-hash-locked screenshots — at the cost of Docker-pinning its entire render path. Two verification cultures, same underlying admission: pixels only stay identical inside a box you fully pin.

The half-pinned box is the actionable nit. Chrome is pinned to `148.0.7778.167`; ffmpeg floats on Debian apt. The day bookworm ships an ffmpeg point release that changes encoder defaults, every golden MP4 baseline can drift below a floor at once — and the failure will look like a rendering regression, not a dependency bump. If you copy one line of this audit into your own Dockerfile review, make it: *pin the encoder as hard as the browser*.

And if you are pointing an agent at video output, size your expectations by rung, the way [CozyClay's shot contract](/posts/cozyclay-shot-contract/) sizes shots before generation: ask for byte-stability only pre-encode, assert decibels post-encode, and treat any cross-platform pixel promise with suspicion until you find the fixture that proves it runs.

## 🎯 Key Takeaways

- **The claim and the contract are in different units.** The README of heygen-com/hyperframes (pinned at `d4fba55a`) promises "same input, same frames, same output"; the shipped harness verifies encoded output at 100 sampled checkpoints against per-fixture PSNR floors of 20-45 dB, with audio passing on correlation, not equality.
- **Byte equality exists for exactly one output format.** Only unencoded png-sequence frames are compared with `Buffer.equals`; the project's own docs scope byte reproducibility to one Docker image whose Chrome is patch-pinned while its ffmpeg is not.
- **28 of 79 golden fixtures are recorded as never verified in CI.** The shard schedule's CI-enforced excluded list says so verbatim — 25 "pass state unknown", 3 rejected for invalid metadata — an unusually candid ledger, recording a debt the project's own README never mentions.
- **The determinism engineering itself is genuine.** A nine-flag deterministic Chrome launch, SwiftShader-by-default, seeded-time authoring rules for agents, and a documented fix to their own PSNR instrument — the input side is rigorous; the verification side is tolerance-banded.

## 🤔 New Questions This Raises

- When a golden suite bands tolerance at 30 dB, what class of real regression lives *below* the floor — color management, font hinting, sub-checkpoint flicker — and how often would byte-goldens have caught one?
- Could the 25 never-ran fixtures be burned down mechanically — schedule one per PR with a recorded timing — and would their pass states surprise the maintainers?
- What happens to the golden MP4s when Debian bookworm updates ffmpeg — does the suite drift under every floor at once, and would pinning the encoder version have made that a no-op?
- Is there a principled way to state an *audio* determinism contract stronger than correlation-with-lag-windows without falling back to full sample equality?

## Limitations

This is a static audit of the pinned tree `d4fba55a` plus live registry metadata; I did not run renders, so I cannot say how often real output lands near the floors, only what the contract tolerates. "Never run in CI" is the repository's own recorded state in `shard-schedule.json` — fixtures may well have been run locally or in Docker by maintainers without that being visible to this ledger. The 20-45 dB floors are engineering choices, not defects; this audit characterizes them because the README's absolute phrasing invites a stricter reading than the code enforces. Star, fork, and version numbers are point-in-time (2026-09-10 UTC retrieval) and will drift. The docs-register observation about "Reliable render" is scoped to the introduction page, not the full docs site.

## References

### Primary Sources

- [heygen-com/hyperframes at d4fba55a](https://github.com/heygen-com/hyperframes/tree/d4fba55a4ee632f74484c6c7498a132b9928ce03) — pinned audit tree
- [README.md](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/README.md) — determinism claims (lines 232, 265)
- [packages/producer/tests/README.md](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/packages/producer/tests/README.md) — PSNR comparison model, Docker-only baselines
- [packages/producer/src/regression-harness.ts](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/packages/producer/src/regression-harness.ts) — checkpoints, byte-equality branch, instrument-fix note
- [packages/producer/tests/shard-schedule.json](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/packages/producer/tests/shard-schedule.json) — scheduled/excluded ledger
- [packages/producer/scripts/plan-regression-shards.mjs](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/packages/producer/scripts/plan-regression-shards.mjs) — ledger enforcement
- [packages/engine/src/services/browserManager.ts](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/packages/engine/src/services/browserManager.ts) — deterministic flag set, GPU warning
- [Dockerfile.test](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/Dockerfile.test) — pinned Chrome, unpinned ffmpeg
- [.github/workflows/regression.yml](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/.github/workflows/regression.yml) and [windows-render.yml](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/.github/workflows/windows-render.yml) — CI triggers, Windows structural checks
- [skills/hyperframes-core/references/determinism-rules.md](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/skills/hyperframes-core/references/determinism-rules.md) — authoring contract
- [docs/introduction.mdx](https://github.com/heygen-com/hyperframes/blob/d4fba55a4ee632f74484c6c7498a132b9928ce03/docs/introduction.mdx) — "Reliable render" register

### Live Registries

- [GitHub API: heygen-com/hyperframes](https://api.github.com/repos/heygen-com/hyperframes) — repository metadata at retrieval
- [npm: hyperframes latest](https://registry.npmjs.org/hyperframes/latest) — CLI version 0.8.33

### Related Reading on This Site

- [diagram-design Hash-Locks Its Screenshots, Not Its Storefront](/posts/diagram-design-drift-audit/) — the byte-hash-locked alternative for golden artifacts
- [CozyClay's Shot Contract](/posts/cozyclay-shot-contract/) — sizing expectations before generation in AI video pipelines
