---
title: "MetaHarness Advertises Witness Signing Its Bridges Never Export"
description: "Real Ed25519 witness code, no shipped bridge that exports it: a commit-pinned metaharness audit of the sign, verify, validate, and publish gates."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, provenance, supply-chain, open-source]
date: 2026-09-12 00:09:19 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/witness-reachability-map.svg
  alt: "Three-column map of MetaHarness witness signing at commit d5833dc6: a real Ed25519 implementation in the Rust kernel, shipped wasm/napi/TypeScript bridges that export no witness function, and CLI paths that substitute placeholder signatures and shape checks, plus an ADR-011 spec-versus-code table and the pinned-key contrast of meta-proxy"
---

![Map of MetaHarness witness signing at commit d5833dc6: real Ed25519 code in the Rust kernel, bridges that export no witness function, CLI paths that fall back to placeholders and shape checks](/assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/witness-reachability-map.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every claim was verified against the pinned commit d5833dc6 before publication.

## 🤔 Curiosity: Who can actually verify a "witness-signed" harness?

[MetaHarness](https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb) calls itself "a factory for agent frameworks": point `npx metaharness` at a GitHub repo and it mints a branded agent harness with its own CLI, MCP server, memory, and governance policy. The repository is MIT-licensed, created 2026-06-13, and carried 648 stars with a last push on 2026-09-11 at retrieval; the npm package reached 0.4.16 on 2026-09-02, its 49th version in under three months.

Provenance is part of the front-page pitch. The README's deliverables list includes "Witness-signed provenance + release gates", the opening paragraph promises "release verification, witness-signed provenance", and a later section offers "Ed25519 witness-signed releases". The user guide tells you how to get one: "For witness-signed releases, also run `harness sign` first."

A signing story for generated artifacts is exactly what an agent-harness supply chain needs, so I asked the question any adopter should ask of a provenance feature: **when I run the shipped commands, what cryptographic operation actually executes, and against which trust anchor?** This audit pins the tree at commit `d5833dc6` and follows the witness from the Rust implementation to every shipped entry point.

The short version: the cryptography is real, and the paths that reach it are not.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/references/studio-screenshot-desktop.png" alt="Agent Harness Studio desktop view: Create harness tab with identity form, host picker, and a generated 25-file harness tree with README preview">
  <figcaption>The Agent Harness Studio's Create tab, whose tagline promises to "emit a signed-ready, npm-publishable runtime" &mdash; Screenshot from ruvnet/metaharness (MIT License), commit d5833dc6. Source: <a href="https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui">https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui</a>. Publisher: RuvNet (ruvnet/metaharness). Licence: <a href="https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/LICENSE">MIT</a>.</figcaption>
</figure>

## 📚 Retrieve: Following the signature from crate to CLI

I audited the pinned tree through a shallow clone at `d5833dc6` plus the GitHub and npm registry APIs. Every quote below carries its file coordinate; nothing in this section comes from running the hosted Studio.

### The implementation is real

`crates/kernel/src/witness.rs` is a 272-line Rust module built on `ed25519-dalek`: a `WitnessManifest` shape, a deterministic `canonical_payload` serialiser, `sign_manifest`, and `verify_manifest`. It is exercised by unit tests and even ships two Criterion benchmarks, `witness_sign.rs` and `witness_canon.rs`. The module header states the intent plainly: "Every harness ships with a signed `witness.json` plus a JSONL temporal history."

This matters for what follows: the finding here is not vaporware. Someone wrote and tested genuine signing code.

### No shipped bridge exports it

The kernel reaches JavaScript through three bridges, and I inventoried each at the pinned commit:

| Surface | Witness exposure at `d5833dc6` |
|---|---|
| `crates/kernel-wasm` (wasm-bindgen) | 7 exports: `kernelInfo`, `mcpValidate`, `autonomousValidate`, `sessionValidate`, `sessionStateHash`, `sessionReplay`, `version` &mdash; no witness function |
| `crates/kernel-napi` (native) | zero `witness` references in `src/` |
| `packages/kernel-js` (`@metaharness/kernel` 0.1.3) | zero witness code; its `KernelBackend` surface has no `witnessSign` or `witnessVerify` |

The TypeScript witness client is written to call `kernel.witnessVerify` when the loaded kernel provides it. At this commit, no bridge does. Rust-side callers could still use the crate directly, but the product surface — the npm CLI and the Studio — talks to the kernel only through these three bridges.

### What each shipped path does instead

With the crypto unreachable, every user-facing witness operation falls back, and the fallbacks are documented in the code itself:

- **`harness sign`** hands the entry list to `kernel.witnessSign` — and when that function is absent, writes a witness whose `public_key` is 64 `'a'` characters and whose `signature` is 128 `'b'` characters. The in-code comment is candid: "Placeholder so the publish gate's shape-check passes" (`subcommands.ts:267`).
- **`verifyWitness`** returns `valid: true` with `unverified: true` and the reason "shape verified; kernel witnessVerify unavailable &mdash; signature NOT cryptographically checked (degraded)" (`witness-client.ts`).
- **`harness validate`** treats a missing `witness.json` as a pass: exit code 0, detail "no witness &mdash; skipped (sign first)" (`validate.ts:49-51`).
- **`publish`** states in a comment: "We accept missing witness.json" (`publish.ts:129`). A witness that is present but unverified fails closed — a hardening added for GitHub issue #4 (HIGH-1) — unless the caller passes `--allow-unverified-witness`, which skips the cryptographic check entirely.

Now set that against the absolute claim in the same package. The witness client's header comment reads: "The publish gate verifies that signature BEFORE pushing the harness to npm or pinning it to IPFS &mdash; there is no path to publish an unsigned or tampered harness" (`witness-client.ts:6-8`). At this commit there are at least two: publish a harness with no witness at all, or pass the explicit bypass flag. And because no bridge exposes `witnessVerify`, the "verifies that signature" step has no code path that performs cryptography.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/references/studio-screenshot-verify.png" alt="Agent Harness Studio Verify tab: drop a generated harness zip for in-browser checks covering structure, kernel dependency, host wiring, MCP policy, and secret reads, with no signature check listed">
  <figcaption>The Studio's Verify tab lists its checks &mdash; structure, kernel dep, host wiring, MCP policy, secret reads &mdash; and signature verification is not among them &mdash; Screenshot from ruvnet/metaharness (MIT License), commit d5833dc6. Source: <a href="https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui">https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui</a>. Publisher: RuvNet (ruvnet/metaharness). Licence: <a href="https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/LICENSE">MIT</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/references/studio-screenshot-repo.png" alt="Agent Harness Studio Repo-to-Harness tab: paste a GitHub repo for analysis-only scoring with lexical or MiniLM semantic engines before scaffolding">
  <figcaption>The Studio's Repo-to-Harness intake is analysis-only &mdash; repository code is never executed &mdash; before the scaffold whose signing story this audit traces &mdash; Screenshot from ruvnet/metaharness (MIT License), commit d5833dc6. Source: <a href="https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui">https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui</a>. Publisher: RuvNet (ruvnet/metaharness). Licence: <a href="https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/LICENSE">MIT</a>.</figcaption>
</figure>

### The spec knows better than the code

The design document, [ADR-011](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/adrs/ADR-011-witness-and-provenance.md), is genuinely good security engineering. It specifies a countersignature — verification must cross-check the manifest's embedded key against a `harnessWitnessKey` pinned in the published `package.json`, and "If they disagree, verification fails" — plus RFC 8785 canonicalisation, a `witness rotate-key` dual-sign rotation flow, an append-only `verification-history.jsonl`, and a Sigstore alternative.

I grepped the shipped TypeScript and Rust sources (excluding `node_modules` and docs) for each mechanism: `harnessWitnessKey`, `witness-pubkey`, rotate-key, verification-history, and RFC 8785/JCS all return zero hits. The canonicaliser that does exist explicitly diverges from the spec — `witness.rs` documents that "Serialisation uses serde_json with the default ordering of struct fields" and "Strings are NOT normalised", where ADR-011 mandates the RFC 8785 JSON Canonicalization Scheme.

The absence of the countersignature has a concrete consequence even for a future build that wires the bridge: `verify_manifest` checks the Ed25519 signature only against the public key embedded in the manifest itself. Whoever regenerates the manifest can re-sign it with any key, and verification passes. Without the external anchor, the witness attests integrity-since-signing, not identity — which is what the word "witness" implies.

Two fairness notes belong here. ADR-011 is marked **Status: Proposed**, dated 2026-06-13, so the unimplemented spec is roadmap, not deception — the tension is that the README and user guide describe the feature in the present tense. And the repository's own test suite is honest about scope: `witness-tamper.test.ts` describes itself as pinning "the TS WRAPPER's shape gate".

### The one place a key is actually pinned

The sharpest contrast in the tree is `meta-proxy.ts`. When you run `metaharness proxy install`, the CLI downloads a separately released Rust binary and "verifies the signed SHA256 manifest with a pinned Ed25519 public key" — the constant is even annotated "The release signing key, pinned in the client rather than fetched from GitHub." That is precisely the trust-anchor pattern ADR-011 prescribes for generated harnesses.

So the team demonstrably knows how to anchor trust. The pinned key protects the vendor's own binary distribution; the user's generated harness gets the placeholder.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/references/studio-screenshot-artifact.png" alt="Agent Harness Studio Skill/Agent/Command tab generating a plan-change SKILL.md artifact with catalog source options and a markdown preview">
  <figcaption>The Studio's artifact generator emits SKILL.md folders from a catalog &mdash; one of the outputs the witness manifest is meant to attest &mdash; Screenshot from ruvnet/metaharness (MIT License), commit d5833dc6. Source: <a href="https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui">https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui</a>. Publisher: RuvNet (ruvnet/metaharness). Licence: <a href="https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/LICENSE">MIT</a>.</figcaption>
</figure>

The CI story completes the picture. The `harness sign` help text says the signing key is fetched "from GCP Secret Manager via WIF" in CI — but none of the repository's ten GitHub Actions workflows references witness signing or `WITNESS_SIGNING_KEY`. The CLI's scaffold generator library (`agent-harness-generator-lib`) contains zero witness references, so a CLI-minted harness carries no `witness.json` until its owner runs the placeholder-emitting `sign` command by hand. The Studio's browser scaffold does include one &mdash; as an explicit stub: its `witnessStub` function emits `"signature": null` with a note to run the signing commands later (`apps/web-ui/src/generator/scaffold.ts`), and the stub's schema string `witness/v1` does not match the `schema: 1` integer the TypeScript shape gate requires. Either way, no fresh harness leaves the factory signed.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-12-metaharness-witness-reachability-audit/references/studio-screenshot-mobile.png" alt="Agent Harness Studio full mobile page including a Primitives section with a Witness signing toggle listed alongside CLI, memory namespace, learning loop, and release gates">
  <figcaption>The Studio's Compose flow offers "Witness signing" as a selectable primitive alongside CLI, memory namespace, and release gates &mdash; Screenshot from ruvnet/metaharness (MIT License), commit d5833dc6. Source: <a href="https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui">https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/web-ui</a>. Publisher: RuvNet (ruvnet/metaharness). Licence: <a href="https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/LICENSE">MIT</a>.</figcaption>
</figure>

## 💡 Innovation: Reachability is part of the feature

The interesting failure here is not "project overstates security" — that story is common. It is that every individual layer behaves defensibly, and the composition still ships a provenance feature whose median real-world outcome is a shape check:

1. The Rust module is real, tested, and benchmarked.
2. The degraded verification mode labels itself honestly (`unverified: true`).
3. The placeholder signature is commented as a placeholder.
4. The publish gate was hardened after an issue report to fail closed on unverified witnesses.
5. The ADR documents the right design, including the countersignature the code lacks.

What no layer owns is the question "can a user's invocation reach the cryptography?" — and that is the property the marketing sentence asserts. My working rule from this audit: **a security feature's definition includes its reachability, and reachability claims live in bridges, not implementations.** For any tool that advertises signed artifacts, the audit sequence that worked here took under an hour with a pinned clone:

1. Find the crypto implementation.
2. Find the export that carries it to the entry point users actually run (here: three bridges, zero exports).
3. Find the trust anchor a verifier checks against (here: the manifest's own embedded key).
4. Find the CI job that holds the signing key (here: none of ten workflows).
5. Run the failure paths: missing artifact, malformed artifact, bypass flags (here: missing witness passes validate and publish).

This is the same failure family I found in [SkillHub's observer-mode scanner](/posts/skillhub-observer-scanner-audit/), where a malware verdict existed but no lifecycle gate consumed it. If you evaluate provenance *claims* rather than provenance *mechanisms*, the [open-science provenance audit](/posts/open-science-provenance-audit/) walks the same discipline applied to benchmark badges. If you are choosing harness tooling and want this level of source-pinned verification applied to your own dependency shortlist, that is exactly the work I take on through [Work with Me](/work-with-me/).

For MetaHarness adopters today, the practical read: treat generated harnesses as unsigned artifacts, because that is what the shipped toolchain produces; rely on npm's own provenance attestations where you need build authenticity; and watch the bridge exports — wiring `witnessSign`/`witnessVerify` through `kernel-wasm` plus pinning a countersignature key would convert this from a labeled placeholder into the feature the README already describes.

## 🎯 Key Takeaways

- **The witness signer exists but is unreachable from the shipped product**: the wasm bridge exports seven functions, none of them witness operations, and the napi and TypeScript kernel surfaces contain zero witness code at `d5833dc6`.
- **Every fallback is individually honest and collectively misleading**: placeholder `'a'`/`'b'` signatures, `valid: true` + `unverified: true` degraded verification, validate exit 0 on a missing witness, and a publish gate that accepts witness-less harnesses.
- **The claim "there is no path to publish an unsigned or tampered harness" is contradicted in its own package** by the missing-witness acceptance and the `--allow-unverified-witness` flag.
- **ADR-011's trust-anchor design (countersignature, rotation, temporal history, RFC 8785) has zero implementation hits** in shipped sources, and the one properly pinned Ed25519 key in the tree protects the vendor's meta-proxy binary, not user harnesses.
- **When auditing provenance features, inventory the bridge exports first** — implementation quality tells you nothing about whether any user invocation performs cryptography.

## 🤔 New Questions This Raises

- When the bridge gap closes, will verification adopt ADR-011's countersignature, or ship self-anchored verification first — and will the README distinguish the two?
- How many other agent-tooling projects advertise signing whose verification degrades to shape checks when an optional native component is absent?
- Should npm provenance attestations (which MetaHarness's ADR already treats as complementary) be the default recommendation for generated-artifact factories, since they come with an external transparency log for free?
- What would a lint look like that fails CI when a README capability noun has no corresponding export in the compiled bridge?

## Limitations

This is a static audit of the pinned commit `d5833dc6` (2026-09-11 retrieval): I read the sources, bridge exports, tests, benches, workflows, and registry metadata, but did not execute the published npm package end-to-end or the hosted Studio. Zero-hit statements are scoped to greps over the tracked TypeScript/Rust sources excluding `node_modules`; the Rust crate remains directly usable by Rust callers, and a bundled kernel in some future or unexamined distribution channel could change the reachability picture. ADR-011 is explicitly marked Proposed, so spec-versus-code gaps are unimplemented roadmap rather than regressions; my finding concerns the present-tense marketing of the feature. Star counts, version numbers, and timestamps are retrieval-time observations.

## References

### Primary sources (pinned at `d5833dc6`)

- [ruvnet/metaharness @ d5833dc6](https://github.com/ruvnet/metaharness/tree/d5833dc6512ac1adeeef91a331c29055cd8a4dbb) — audited tree
- [crates/kernel/src/witness.rs](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/crates/kernel/src/witness.rs) — Ed25519 implementation
- [crates/kernel-wasm/src/lib.rs](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/crates/kernel-wasm/src/lib.rs) — wasm export inventory
- [packages/create-agent-harness/src/witness-client.ts](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/packages/create-agent-harness/src/witness-client.ts) — degraded verify + absolute claim
- [packages/create-agent-harness/src/subcommands.ts](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/packages/create-agent-harness/src/subcommands.ts) — placeholder sign path
- [packages/create-agent-harness/src/publish.ts](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/packages/create-agent-harness/src/publish.ts) — publish gate
- [packages/create-agent-harness/src/meta-proxy.ts](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/packages/create-agent-harness/src/meta-proxy.ts) — pinned-key contrast
- [docs/adrs/ADR-011-witness-and-provenance.md](https://github.com/ruvnet/metaharness/blob/d5833dc6512ac1adeeef91a331c29055cd8a4dbb/docs/adrs/ADR-011-witness-and-provenance.md) — specified design

### Registry and metadata

- [npm: metaharness](https://www.npmjs.com/package/metaharness) — 0.4.16, 2026-09-02
- [GitHub API: ruvnet/metaharness](https://api.github.com/repos/ruvnet/metaharness) — stars/license/dates at retrieval

### Related on this site

- [SkillHub's Security Scanner Blocks on Crash, Not on Verdict](/posts/skillhub-observer-scanner-audit/)
- [Open Science's Provenance Engine Would Reject Its Own #1 Badge](/posts/open-science-provenance-audit/)
