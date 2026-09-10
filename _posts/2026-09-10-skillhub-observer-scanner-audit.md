---
title: "SkillHub's Security Scanner Blocks on Crash, Not on Verdict"
description: "A commit-pinned audit of iflytek/skillhub: the scan verdict — even BLOCKED — gates no publish path in shipped code, while an unrecovered scanner outage hard-blocks the version."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, trust-boundaries, open-source]
date: 2026-09-10 00:17:39 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/scan-gate-map.svg
  alt: "Map of SkillHub's three publish paths — super-admin straight to PUBLISHED, private to self-confirmed PUBLISHED, public through human review — with the security scanner drawn as a dashed observer box and the only hard gate firing on scanner failure"
---

![Map of SkillHub's three publish paths with the security scanner drawn as an observer and the only hard scan gate firing on scanner failure](/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/scan-gate-map.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: When a registry says "security scanning," what does the verdict actually gate?

[SkillHub](https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13) is iFlytek's self-hosted, enterprise agent-skill registry: publish and version skill packages, govern them with RBAC and audit logs, deploy behind your firewall. The repository is Apache-2.0, created 2026-03-11, and carried 5,072 stars with a last push on 2026-09-09 at retrieval. This audit pins the tree at commit `d824a049`.

Skill packages are executable instructions for agents — SkillHub's own upload allowlist admits `.sh`, `.py`, `.ps1`, and fifteen other script and source types — so the registry's security story matters more than its search box. SkillHub ships a real scanner integration: a local Docker build of Cisco's skill-scanner, wired in through a Redis stream, with a verdict enum that ends in a value literally named `BLOCKED`.

So I asked the question I now ask every governance product: when the scanner returns that verdict, **what changes?** The answer, in the shipped code, is: the color of a badge.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/references/homepage.png" alt="SkillHub registry homepage as embedded in the pinned skill-publish guide">
  <figcaption>The governed storefront: a self-hosted registry homepage with curated collections &mdash; Screenshot: iFlytek SkillHub documentation (homepage.png), Apache-2.0, pinned at d824a049. Source: <a href="https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13">https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13</a>. Publisher: iFlytek SkillHub maintainers. Licence: <a href="https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE">https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE</a>.</figcaption>
</figure>

## 📚 Retrieve: Tracing the verdict from the scanner to nowhere

I audited the pinned tree through a shallow clone at `d824a049` plus the GitHub API. Every quote below carries its file coordinate; nothing in this section comes from running the server.

### The verdict pipeline is real — until the last step

`SecurityVerdict.java` defines exactly four values: `SAFE`, `SUSPICIOUS`, `DANGEROUS`, `BLOCKED`. The adapter (`SkillScannerAdapter.java`, lines 83-95) maps the external scanner's response onto them: `is_safe=true` becomes `SAFE`, and a `maxSeverity` of `CRITICAL` becomes `BLOCKED`, `HIGH` becomes `DANGEROUS`, `MEDIUM` and anything unrecognized become `SUSPICIOUS`.

Then comes `SecurityScanService.processScanResult`. It stores the verdict on the audit record (line 184) — and advances the version by requested visibility alone: `PRIVATE` goes to `UPLOADED` (line 200), everything else to `PENDING_REVIEW` (line 202). No branch in the method reads the verdict when choosing the next status. A package the scanner just labeled `BLOCKED` and a package it labeled `SAFE` land in exactly the same place.

Is the verdict consumed anywhere else? In the non-test Java sources at this commit, a word-boundary grep for `SecurityAudit` finds only the JPA repository, a read-only portal controller, the scan service itself, and the entity and repository classes; a broader substring grep adds just the response DTO and a scan-retry service, neither of which reads the verdict to gate anything. `ReviewService.java` and `PromotionService.java` — the owners of review-approval transitions — contain zero references to `verdict`, `isSafe`, or `SecurityAudit`. So do `SkillPublishService.java`, `SkillDownloadService.java`, and the private-skill confirm flow. Beyond storage and that read-only audit API, the only remaining consumer is the display layer: `web/src/features/security-audit/` ships a `verdict-badge.tsx`. One adjacent surface goes further than ignoring the verdict: the ClawHub-compatible registry facade answers every skill response with a hardcoded clean moderation record — `verdict: "clean"`, `isSuspicious: false`, `isMalwareBlocked: false` — without consulting the stored audit at all (`ClawHubRegistryFacade.java:108`).

The scanner is an observer. Reviewers can read its report; no machine gate acts on it — and one compat surface affirmatively reports clean regardless of it.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/references/skill-detail-star.png" alt="SkillHub skill detail page with the star bookmark control, as embedded in the pinned social-features guide">
  <figcaption>The skill detail page, star control highlighted in the social guide &mdash; the scanner guide states scan reports are displayed on this page &mdash; Screenshot: iFlytek SkillHub documentation (skill-detail-star.png), Apache-2.0, pinned at d824a049. Source: <a href="https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13">https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13</a>. Publisher: iFlytek SkillHub maintainers. Licence: <a href="https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE">https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE</a>.</figcaption>
</figure>

### The documentation promises the gate the code doesn't have

The English scanner guide (`docs/skillhub/en/guide/scanner.md`) makes both claims on one page. Line 14 advertises a "Configurable severity level at which publication is automatically blocked." Line 71 documents `SKILLHUB_SCANNER_FAIL_ON_SEVERITY` as "Severity level for automatic blocking," default `high`. And line 96, in the Notes section, states plainly: "**Scanning Does Not Block Publishing**: Security scanning runs asynchronously and does not block the skill package upload process."

The honest sentence is line 96. `fail-on-severity` exists in `application.yml` (default `high`) and is forwarded to the external scanner, where it can shape the computed `is_safe` — but since nothing downstream consumes the verdict, "automatic blocking" describes no shipped behavior. Line 7 of the same guide quietly concedes the real design: "The scan results inform review decisions."

This is a familiar failure shape: when an enforcement behavior is implicit, documentation tends to invent the missing switch. Here the invented switch even has a real config key — it just never reaches a lifecycle transition.

### The inversion: the gate fires on availability, not on findings

There is one place a scan hard-blocks a version: when the scan itself fails permanently. Transient scanner outages are deliberately held pending — application.yml's own comment says availability failures "are reclaimed later instead of moving the skill to SCAN_FAILED", with three retry attempts and a one-hour recovery window by default. But once that window is exhausted, `SecurityScanService.processScanFailure` marks the version `SCAN_FAILED` (line 165), and recovery is an explicit publisher retry — `retryStoredBundleScan` throws unless the scanner is enabled and the version is in `SCAN_FAILED`.

Read that against the previous section: a scanner that **finds a critical threat** changes nothing about the version's path, but a scanner that **stays unavailable past its recovery window** stops the release until someone retries. The gate is wired to infrastructure health, not to security findings.

The failure documentation has drifted, too. `scanner/docs/failure-impact-analysis.md` promises automatic degradation to human review on scan failure, and quotes a `markFailed()` implementation — attributed to `ScanTaskConsumer.java:104-119` — that saves a `ReviewTask`. The shipped `ScanTaskConsumer.markFailed()` calls `processScanFailure()` and contains no `ReviewTask` reference; a grep across the scan-failure path finds none. The documented safety net was removed from the code and survives only in the document.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/references/notifications.png" alt="SkillHub notifications view for review approvals and comments, as embedded in the pinned social-features guide">
  <figcaption>Lifecycle notifications &mdash; review approvals and comments surface here &mdash; Screenshot: iFlytek SkillHub documentation (notifications.png), Apache-2.0, pinned at d824a049. Source: <a href="https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13">https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13</a>. Publisher: iFlytek SkillHub maintainers. Licence: <a href="https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE">https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE</a>.</figcaption>
</figure>

### Two publish paths never meet a reviewer at all

`SkillPublishService` (line 468) computes `autoPublish = forceAutoPublish || isSuperAdmin`. An auto-published version is set directly to `PUBLISHED` with a publish timestamp; at this commit, `forceAutoPublish` has no production caller, so being a super admin is the live trigger. The scan service even accounts for it: `persistScanAttempt` only moves a version to `SCANNING` "if the version is not already published (auto-publish flow)" — its own comment. A super admin's package is live before its scan completes.

`PRIVATE` skills take the second path: straight to `UPLOADED` with the in-code comment "PRIVATE skill goes to UPLOADED status, no review task created," then to `PUBLISHED` by self-confirmation — the confirm flow requires only that the actor is the skill owner or a namespace admin/owner, and contains no scan or verdict checks. The blast radius is bounded: `SkillDownloadService` restricts `UPLOADED` and `PENDING_REVIEW` downloads to users who can manage the draft, and private distribution stays namespace-scoped. But inside that scope, no scanner verdict and no independent reviewer ever stands between a publisher and their audience.

And the quickstart makes the strongest path the default one. The README's zero-config deploy is a pipe-to-shell of `runtime.sh`; the release template it relies on ships `BOOTSTRAP_ADMIN_ENABLED=true` with the documented password `ChangeMe!2026`, and `BootstrapAdminInitializer` assigns that account `SUPER_ADMIN`. The README does tell operators to change the password and notes that `validate-release-config.sh` rejects the default — but the in-repo `scripts/runtime.sh` at this commit never invokes that validation; it lives in a separate `make` target. (The quickstart actually pipes a remote copy of `runtime.sh` from a cloud-storage bucket, which this commit cannot pin at all.) The advertised quickstart boots a registry whose default account publishes straight to `PUBLISHED`.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/references/namespace-members.png" alt="SkillHub namespace member management page for assigning roles, as embedded in the pinned namespace guide">
  <figcaption>Namespace roles &mdash; the visibility rules that actually decide a version's path &mdash; Screenshot: iFlytek SkillHub documentation (namespace-members.png), Apache-2.0, pinned at d824a049. Source: <a href="https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13">https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13</a>. Publisher: iFlytek SkillHub maintainers. Licence: <a href="https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE">https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE</a>.</figcaption>
</figure>

### What the deterministic gate actually checks

The enforcement that does exist at upload time is `SkillPackagePolicy`: 500 files max, 10 MB per file, 100 MB per package, and an extension allowlist. The allowlist is honest about what skills are — it admits eighteen script and source types alongside docs and images. Its content validation, though, is thin at the edges: magic-byte checks cover images and PDF, a UTF-8 check covers text types, and the six office formats (`.doc`, `.xls`, `.ppt`, `.docx`, `.xlsx`, `.pptx`) have no branch at all — any byte content under an office extension passes the deterministic gate. And per the README, the `SKILLHUB_PUBLISH_ALLOWED_FILE_EXTENSIONS` override "replaces the default allowlist instead of appending to it" — one environment variable swaps the whole list.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/references/review-list.png" alt="SkillHub review page for namespace administrator review, as embedded in the pinned review guide">
  <figcaption>Namespace administrator review &mdash; the layer that actually gates public skills, informed but not bound by scan results &mdash; Screenshot: iFlytek SkillHub documentation (review-list.png), Apache-2.0, pinned at d824a049. Source: <a href="https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13">https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13</a>. Publisher: iFlytek SkillHub maintainers. Licence: <a href="https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE">https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE</a>.</figcaption>
</figure>

### Advertised versus shipped, layer by layer

| Layer | What the docs say | What the pinned code does |
|---|---|---|
| Scan verdict | "publication is automatically blocked" at `fail-on-severity` | Stored on the audit row, rendered as a badge; read by no lifecycle code |
| Scan failure | Auto-degrade to human review (failure-impact doc) | `SCAN_FAILED` hard block until an explicit publisher retry |
| Public publish | Reviewed under governance | `PENDING_REVIEW` and a human decision — real, but not bound to the verdict |
| Private publish | Namespace-governed | `UPLOADED`, then self-confirmation by owner or namespace admin |
| Super-admin publish | (not advertised) | `PUBLISHED` before the scan completes |
| Upload gate | Extension allowlist | Magic bytes for images/PDF, UTF-8 for text, no check for office formats |

## 💡 Innovation: Grade the scanner by its consumers, not its engines

To be fair to SkillHub: asynchronous, advisory scanning is a defensible design. Blocking uploads on a scanner adds a hard availability dependency — and SkillHub's own engineering shows they take that dependency seriously (idempotency locks, bounded retries, temp-file cleanup discipline in `ScanTaskConsumer`). Routing every public skill through human review is a real gate, and bounding pre-review downloads to draft managers is real too. The defect is narrower and more instructive: the product documents an enforcement behavior — "automatically blocked" — that terminates in a badge.

What I take away for evaluating any registry or governance product:

1. **Trace the verdict, not the engine list.** The engine table is where drift already lives: the guide marks metadata analysis "Enabled" and behavioral analysis "Optional", while default configuration at this commit enables behavioral analysis only — the exact inverse. The security property lives in who consumes the result. One grep — "who reads this enum?" — settled more than the whole scanner docs page.
2. **Ask what happens when the scanner is down, and when it is loud.** Here, staying down blocks and loud doesn't. If those two answers are inverted from your expectation, the "security scanning" checkbox is measuring uptime, not threats.
3. **Enumerate the paths that skip the gate.** Super-admin instant publish and private self-confirmation are both legitimate product features — until your threat model includes a compromised admin account that the quickstart shipped with a documented default password.
4. **Doc drift concentrates in safety claims.** Both drifted documents here — "automatic blocking" and "auto-degrade to human review" — describe protections. Feature docs get corrected by annoyed users; safety docs fail silently until someone audits them.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-10-skillhub-observer-scanner-audit/references/skill-discovery-search.png" alt="SkillHub skill discovery search page, as embedded in the pinned discovery guide">
  <figcaption>Discovery search &mdash; the distribution surface every PUBLISHED version reaches, whatever its verdict said &mdash; Screenshot: iFlytek SkillHub documentation (skill-discovery-search.png), Apache-2.0, pinned at d824a049. Source: <a href="https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13">https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13</a>. Publisher: iFlytek SkillHub maintainers. Licence: <a href="https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE">https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/LICENSE</a>.</figcaption>
</figure>

For the harness-side view of the same question — where an allow list runs relative to your own deny rules inside one agent runtime — see my [OpenHarness permission-order audit](/posts/openharness-permission-order-audit/): it maps the enforcement-order problem this registry audit meets one layer up. The catalog-scale cost of skills inside a harness is in the [ECC context-tax audit](/posts/ecc-context-tax-audit/).

## 🎯 Key Takeaways

- **SkillHub's scan verdict gates nothing in shipped code.** The enum ends in `BLOCKED`; `processScanResult` advances versions by visibility alone, and no publish, review, promotion, or download path reads the verdict. It renders as a frontend badge.
- **The only hard scan gate fires on failure, not on findings.** A scan that stays failed past its bounded recovery window puts the version in `SCAN_FAILED` until an explicit retry; a `DANGEROUS` verdict changes nothing about the version's path.
- **Two publish paths bypass review entirely** — super-admin instant publish (live before the scan completes) and private self-confirmation — and the quickstart's release template ships a `SUPER_ADMIN` account with a documented default password, while the in-repo deploy script never runs the validation that would reject it.
- **Safety documentation drifted twice**: "automatic blocking" describes no shipped behavior, and the failure-analysis doc quotes a review-degradation code path that no longer exists.
- The real enforcement layers are the upload allowlist (thin at office-format edges), mandatory human review for public skills, and namespace-scoped RBAC.

## 🤔 New Questions

- The `fail-on-severity` key is forwarded to the Cisco scanner where it shapes `is_safe` — did an earlier SkillHub version consume the verdict, and if so, which commit disconnected it?
- The scanner supports optional LLM analysis of untrusted skill content. When that judge is an LLM reading attacker-authored `SKILL.md` files, what does a prompt-injection-shaped skill package do to the verdict distribution?
- ClawHub-compatible clients can search and install against a SkillHub registry, and the compat facade already reports every package as moderation-clean. Do any ClawHub-style clients make trust decisions from that hardcoded field, and would they behave differently if it carried the real verdict?

## Limitations

- This is a static audit of the pinned tree `d824a049` plus GitHub API metadata. I did not run the server, the scanner container, or any end-to-end publish, so runtime behaviors beyond the quoted code paths are out of scope.
- The Cisco skill-scanner's own detection quality is not assessed here; only its integration contract with SkillHub is.
- Negative claims ("no consumer of the verdict") are scoped to the non-test Java sources at this commit, verified by whole-tree grep; the external scanner service and future commits are outside that scope.
- The failure-impact document may simply predate the current implementation; the finding is the current mismatch, not an intent judgment.
- Star, fork, and push figures are point-in-time API reads and drift daily.

## References

### Primary sources

- [iflytek/skillhub, pinned tree at d824a049](https://github.com/iflytek/skillhub/tree/d824a0498ca0c5722d2bf51d71b44d87daaf2a13)
- [SecurityScanService.java](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/security/SecurityScanService.java) — verdict storage and visibility-only transitions
- [SecurityVerdict.java](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/security/SecurityVerdict.java) — the four-value enum
- [SkillScannerAdapter.java](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/server/skillhub-infra/src/main/java/com/iflytek/skillhub/infra/scanner/SkillScannerAdapter.java) — severity-to-verdict mapping
- [SkillPublishService.java](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/skill/service/SkillPublishService.java) — autoPublish and visibility routing
- [SkillPackagePolicy.java](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/skill/validation/SkillPackagePolicy.java) — allowlist and content-signature checks

### Documentation audited

- [English scanner guide](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/docs/skillhub/en/guide/scanner.md) — the "automatic blocking" / "Scanning Does Not Block Publishing" page
- [Scanner failure-impact analysis](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/scanner/docs/failure-impact-analysis.md) — the drifted review-degradation claim
- [scanner/README.md](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/scanner/README.md) — Cisco skill-scanner integration
- [Repository README](https://github.com/iflytek/skillhub/blob/d824a0498ca0c5722d2bf51d71b44d87daaf2a13/README.md) — quickstart, bootstrap admin, allowlist override

### Related coverage on this site

- [OpenHarness permission-order audit](/posts/openharness-permission-order-audit/)
- [ECC context-tax audit](/posts/ecc-context-tax-audit/)
