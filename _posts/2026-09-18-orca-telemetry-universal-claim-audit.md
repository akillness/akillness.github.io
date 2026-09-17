---
title: "Orca's privacy page survives 82 of its 83 telemetry events"
description: "Source Audit of stablyai/orca at 0d23ea6: the telemetry page's enum-only claim holds across every event schema except one free-form field that can carry home-directory paths."
categories: [AI, Agents]
tags: [ai-agents, open-source, telemetry, harness-engineering]
date: 2026-09-18 00:14:37 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/telemetry-claim-map.svg
  alt: "Diagram of Orca's 83 registered telemetry events at commit 0d23ea6 as a tile grid: 82 tiles marked enum, count or regex-locked, and one red tile for agent_hook_install_failed.error_message, annotated with a sample Node fs error message embedding a home-directory path"
---

![Diagram of Orca's 83 registered telemetry events at commit 0d23ea6 as a tile grid: 82 tiles marked enum, count or regex-locked, and one red tile for agent_hook_install_failed.error_message, annotated with a sample Node fs error message embedding a home-directory path](/assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/telemetry-claim-map.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every documentation sentence, schema line, emitter path and consent-pipeline stage quoted here was read from the pinned commit 0d23ea6, the live docs page, or a bounded local Node check before publication.

## 🤔 Curiosity: Can a privacy page's universal quantifier survive a grep?

[stablyai/orca](https://github.com/stablyai/orca/tree/0d23ea6e688410c878096dab8b1779857354b7d4) is a desktop orchestrator for running Codex, Claude Code, OpenCode and roughly two dozen other CLI agents side by side, each in its own git worktree. At retrieval it carried 70,892 stars under the MIT license, the repository was created on 2026-03-17, and the pinned commit is the tip of `main` from 2026-09-17.

An app in this position sees everything: your prompts, your terminal output, your repositories, and — through its account switcher — the OAuth credentials of every agent subscription you hand it. So its [privacy and telemetry page](https://www.onorca.dev/docs/telemetry) matters more than most, and that page is unusually confident. It does not hedge with "we minimize" or "we may collect". It quantifies universally:

> "Every field we transmit is either a fixed enum value, a version string, or the anonymous local ID."

and enumerates the negatives: "No file paths, repo names, branch names, URLs, commit messages, or current working directory." "No raw error messages or stack frames." "No hostname, no username, no IP." The Settings pane repeats the promise in plainer words — "no file contents, prompts, terminal output, branch names, or anything that identifies you".

Universal claims are the easiest kind to audit, because one counterexample settles them. Orca's telemetry validator is literally its Zod schema registry — the repository says so in a comment: "the schema defined in `src/shared/telemetry-events.ts` IS the validator." That means the entire wire surface is enumerable by reading one directory of schema files. So this audit asks a narrow question: across every registered event, does any field accept free-form text — and if one does, what flows into it?

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/references/orca-readme-hero.jpg" alt="Orca desktop app running multiple coding agents in parallel worktrees with the mobile companion app overlaid in the corner, as shipped in the repository README hero image">
  <figcaption>The README hero: parallel agents in parallel worktrees, with the mobile companion overlaid &mdash; Image from stablyai/orca (MIT), commit 0d23ea6. Source: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md">https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md</a>. Publisher: Orca contributors (stablyai/orca). Licence: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/LICENSE">MIT</a>.</figcaption>
</figure>

## 📚 Retrieve: 83 event schemas, four strings, one exception

### The claim, in the repository's own words

The docs page ships in the tree at `docs/site/content/docs/telemetry.mdx`, and the live page at onorca.dev carried the same sentences at retrieval. Its summary promises anonymous, content-free telemetry: events keyed by a random local ID, with "No account, email, IP address, or user name", and "We never transmit file contents, prompts, agent output, terminal output, repo names, branch names, URLs, paths, or commit messages." The agent-errors bullet is specific: "a coarse error category and which agent kind was involved. We never see raw error messages or stack traces; per-incident detail stays in a local diagnostic trace file on your machine."

The Settings screenshot that the docs page embeds makes the same promise at the moment of consent:

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/references/orca-privacy-toggle.png" alt="Orca Settings Privacy pane showing the Share anonymous usage data toggle in the on position, captioned that Orca sends anonymous counts of which features you use and where things break, with no file contents, prompts, terminal output, branch names, or anything that identifies you">
  <figcaption>Settings &rarr; Privacy as shipped on the docs page: "anonymous counts &hellip; or anything that identifies you" &mdash; Image from stablyai/orca (MIT), commit 0d23ea6. Source: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/docs/site/content/docs/telemetry.mdx">https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/docs/site/content/docs/telemetry.mdx</a>. Publisher: Orca contributors (stablyai/orca). Licence: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/LICENSE">MIT</a>.</figcaption>
</figure>

### The enforcement chain is real

Before the exception, the fairness: this is one of the most defensively built consumer telemetry pipelines I have audited in this series. The event registry maps exactly 83 event names to Zod schemas, every object schema is `.strict()`, and the runtime validator drops — never trims, never coerces — any event with an unknown name, an extra key, a missing key, an out-of-enum value, or an over-cap string. Transmission requires a CI-injected build identity and PostHog write key, so source and contributor builds cannot transmit at all. `track()` gates in a deliberate order: official-build check, shutdown gate, burst cap, then consent resolved from live settings, then schema validation. Consent precedence starts with `DO_NOT_TRACK`, falls through `ORCA_TELEMETRY_DISABLED` and CI detection, and fails closed to a no-transmit `pending_banner` state; a first-launch gate holds every event until the consent banner resolves. The PostHog client is initialized with `disableGeoip: true`. Renderer crash reports — which do carry messages and stacks — go to a local crash store, exactly as the docs say. The `settings_changed` event transmits a whitelisted key and a `value_kind`, never the value.

Even the docs' own claim about coarse agent errors is enforced in the most literal way possible. The `agent_error` schema carries this comment:

> "Enum-only by design: `.strict()` blocks `error_message`/`error_stack`, keeping raw user/path content off the wire."

### The one field that escapes

Grep the per-event schema files for `z.string` and four hits come back. Two are daemon correlation IDs locked to the regex `^v1:[0-9a-f]{32}$`. One is an attempt ID locked to `.uuid()`. The fourth is this, in `telemetry-daemon-event-schemas.ts`:

```ts
// Why: config-shape errors (not user content); callers must truncate before `track` — `.max(200)` drops overlength strings.
export const agentHookInstallFailedSchema = z
  .object({
    agent: hookInstallAgentSchema,
    error_message: z.string().max(200)
  })
  .strict()
```

`agent_hook_install_failed` is the only registered event, out of 83, whose schema accepts free-form text. What flows into it is not hard to trace. The emitter is four lines:

```ts
track('agent_hook_install_failed', {
  agent,
  error_message: describeError(error).slice(0, ERROR_MESSAGE_MAX_LEN)
})
```

where `describeError` returns `error.message` verbatim for `Error` instances. No redaction, no path stripping, no username masking — only a 200-character cap, enforced twice.

The errors come from Orca's managed hook installers. At the pinned commit, 14 installers (claude, openclaude, codex, gemini, antigravity, amp, cursor, droid, command-code, grok, copilot, hermes, devin, kimi) write hook configuration into each agent's own config location. The Claude installer resolves its target as `join(homedir(), settings.configDirName, 'settings.json')`; the shared launcher scripts live under `~/.orca/agent-hooks`. By default these writes land inside the user's home directory (a few installers honor env-var overrides like CLAUDE_CONFIG_DIR), and the installers run at app startup, on settings changes, and on runtime-client settings sync — all three call sites forward any thrown error object unmodified into the telemetry emitter.

Here is the part the "config-shape errors" comment misses. Node's filesystem errors embed the absolute target path in `error.message` itself. A bounded local check reproduces the shape:

```text
ENOENT: no such file or directory, open '/Users/<name>/.claude-nonexistent-dir-xyz/settings.json'
EPERM: operation not permitted, open '/System/orca-test-settings.json'
```

On macOS and most Linux setups the home directory path contains the account username. So when a hook install fails with any filesystem error — a permission problem, a read-only disk, a missing directory, an antivirus lock — the event that reaches PostHog carries a string like `EACCES: permission denied, open '/Users/<name>/.claude/settings.json'`. That single field contradicts four sentences on the privacy page at once: "Every field we transmit is either a fixed enum value, a version string, or the anonymous local ID", "No raw error messages or stack frames", "No file paths", and "no username". It also contradicts the Settings pane's "anything that identifies you", since a username inside a home path is exactly that.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/references/orca-terminal-splits.jpg" alt="Orca terminal splits poster showing multiple WebGL-rendered terminal panes running git and agent commands inside one workspace window, with visible home-directory paths in the terminal output">
  <figcaption>The README's own terminal poster illustrates the mechanism: ordinary tool errors print absolute home-directory paths &mdash; Image from stablyai/orca (MIT), commit 0d23ea6. Source: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md">https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md</a>. Publisher: Orca contributors (stablyai/orca). Licence: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/LICENSE">MIT</a>.</figcaption>
</figure>

### Claim by claim

| Privacy-page sentence | Enforcing code | Verdict at 0d23ea6 |
|---|---|---|
| "Every field we transmit is either a fixed enum value, a version string, or the anonymous local ID." | Zod registry, `.strict()` schemas, fail-closed validator | Holds for 82 of 83 events; fails on `agent_hook_install_failed.error_message` |
| "No raw error messages or stack frames." | `agent_error` enum-only schema; local crash store | Holds for `agent_error` and crash reports; fails for hook-install failures, which ship `error.message` verbatim |
| "No file paths &hellip; or current working directory." | No path-typed fields in any schema | Fails when a hook installer's fs error embeds its target path in the message text |
| "No hostname, no username, no IP." | CommonProps carries platform/arch/version only; `disableGeoip: true` | Username can transit inside a home-directory path in the same field |
| "Always off when `DO_NOT_TRACK=1`" | Consent precedence 1, checked per event | Holds; only `1`/`true` accepted, other values warn and are treated as unset |
| "Per-incident detail stays in a local diagnostic trace file." | Renderer error reports written to local `CrashReportStore` | Holds |
| Settings: whitelisted key + kind, "never the raw value" | `settingsChangedSchema` transmits `setting_key` + `value_kind` only | Holds |

### Scope, honestly stated

The blast radius is narrow, and it is worth being precise about how narrow. The field transmits only when the build is an official stable/rc release, telemetry consent is affirmatively enabled, the burst cap has budget, and a managed hook install actually throws — a failure path, not a steady-state stream. The cap is 200 characters. The docs sentence "No free-form strings from any UI input ever leave your machine" stays technically true: an OS error is not UI input. And the second free-form-adjacent surface a skeptic would check — renderer error reports with full stacks — verifiably stays local. This is not a data-harvesting story. It is a story about a universal quantifier and one schema line, written by the same team, that disagree.

The timeline makes the disagreement legible: the telemetry docs page was last modified on 2026-09-01, the daemon schema file on 2026-09-02, and both ship unchanged in the pinned HEAD of 2026-09-17. The in-code justification — "config-shape errors (not user content)" — classifies by intent. The privacy page classifies by content. Node's error format puts content in that field which the page says never leaves the machine.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/references/orca-tab-split.jpg" alt="Orca parallel-worktree split view dominated by the embedded browser preview with a tab strip and drag ghost, the README parallel worktrees poster frame">
  <figcaption>Parallel worktrees, the surface the hook installers exist to observe &mdash; Image from stablyai/orca (MIT), commit 0d23ea6. Source: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md">https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md</a>. Publisher: Orca contributors (stablyai/orca). Licence: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/LICENSE">MIT</a>.</figcaption>
</figure>

## 💡 Innovation: Audit allow-list telemetry claims with one grep

The reusable method here is cheap enough to run against any product that claims enum-only telemetry:

1. **Find the wire schema, not the docs.** If the product validates events against a schema registry (Orca's comment: "the schema IS the validator"), that registry is the complete wire surface. If there is no registry, the claim is unauditable — which is itself a finding.
2. **Grep the schema surface for free-form types.** In Zod terms: `z.string` without `.enum`, `.regex`, `.uuid`, or a literal union. Everything else — enums, booleans, bounded numbers — cannot carry an identifier by construction.
3. **For each hit, trace the producer, not the intent comment.** Orca's comment says "config-shape errors (not user content)". The producer is `error.message` from filesystem calls inside `homedir()`. Node, libuv, glibc and most runtimes embed the failing path — and therefore often the username — in the message text.
4. **Test the universal sentences against the one hit.** A privacy page that says "never" and "every field" loses to a single counterexample; a page that says "we aim to" cannot be settled this way. Orca's page is falsifiable, which is to its credit — and falsified on exactly one field, which is fixable with an `error_class` enum (the pattern its own `agent_error` schema already uses) or a path-redaction pass in `describeError`.

The account-custody surface — how Orca stores hot-swappable Claude and Codex credentials, and what its mobile relay can see — is a separate audit with its own attack surface, and this method does not cover it.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-orca-telemetry-universal-claim-audit/references/orca-mobile-companion.jpg" alt="Orca desktop workspace beside a phone running the Orca mobile companion app showing agent session status, the README's mobile companion feature-wall poster">
  <figcaption>The mobile companion pairs through Stably's relay cells &mdash; a custody surface this audit surveys but does not settle &mdash; Image from stablyai/orca (MIT), commit 0d23ea6. Source: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md">https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/README.md</a>. Publisher: Orca contributors (stablyai/orca). Licence: <a href="https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/LICENSE">MIT</a>.</figcaption>
</figure> For the same shipped-artifact-versus-documentation lens applied to a credential gateway, see the [OpenConnector default-custody audit](/posts/open-connector-default-custody-audit/); for a spending guard whose strongest sentence outran its hook, see the [CodeBurn guard hard-cap audit](/posts/codeburn-guard-hard-cap-audit/); for a sandbox whose quick start disables the isolation its name promises, see the [AIO Sandbox confinement audit](/posts/aio-sandbox-confinement-contract-audit/).

## Limitations

- This audit reads the pinned commit 0d23ea6e688410c878096dab8b1779857354b7d4 (2026-09-17). Orca ships daily; the schema, the docs page, or both may already have changed.
- I did not capture live PostHog traffic from a packaged official build; the wire-content finding follows from the schema, the emitter source, and Node's documented error-message shape, all quoted above. Contributor builds cannot transmit, which is precisely why a source-build packet capture would prove nothing.
- Whether PostHog's server-side ingestion stores the client IP despite `disableGeoip: true` is a vendor-side property the repository cannot settle; the docs page's "country is the only geographic signal derived from the request" is taken at face value and not independently verified.
- The frequency of real-world hook-install failures is unknown to me; the finding is about what the schema permits and the emitter sends on failure, not about observed volume.
- The mobile relay, push gateway, and managed account credential storage were surveyed but not audited to the same depth; no claims are made about them beyond what their own README states.

## 🎯 Key Takeaways

- **Universal privacy claims are grep-auditable.** Orca's "every field is a fixed enum value, a version string, or the anonymous local ID" is checkable in one pass over its schema registry — and fails on exactly one of 83 events.
- **The exception is `agent_hook_install_failed.error_message`.** A free-form `z.string().max(200)` fed `error.message` verbatim from 14 hook installers that write inside the user's home directory; Node fs errors embed the absolute path, and the path embeds the username.
- **The rest of the pipeline genuinely holds.** Fail-closed validator, `.strict()` everywhere, compile-time transmit gating, consent-before-capture, local-only crash detail, and an `agent_error` schema that blocks this exact field by design.
- **Intent comments are not content guarantees.** "Config-shape errors (not user content)" classified the field by why it exists; the privacy page classified by what it carries. Runtime error formats decide who is right.
- **The fix is already in the codebase.** `agent_error` maps failures to a coarse enum; applying the same pattern (or redacting paths in `describeError`) would make the privacy page's universal sentence true.

## 🤔 New Questions

- How often does `agent_hook_install_failed` fire in production, and has anyone at Stably read the collected messages against their own privacy page?
- Orca's account switcher captures Claude keychain credentials into managed per-account storage and writes them back to the global `Claude Code-credentials` keychain item on swap — what does that shared mutation mean for other tools reading the same item?
- The mobile relay splices frames between phone and desktop through Stably's cells with X25519 host auth; are agent conversation frames end-to-end encrypted against the relay operator, or only transport-encrypted to it?
- PostHog's ingestion necessarily sees a source IP even with client-side GeoIP disabled; what retention applies to it under the plan-level default the docs defer to?

## References

### Primary sources

- [stablyai/orca at 0d23ea6](https://github.com/stablyai/orca/tree/0d23ea6e688410c878096dab8b1779857354b7d4) — pinned tree for all file and line coordinates
- [docs/site/content/docs/telemetry.mdx](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/docs/site/content/docs/telemetry.mdx) — the privacy and telemetry page as shipped
- [src/shared/telemetry-daemon-event-schemas.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/shared/telemetry-daemon-event-schemas.ts) — `agentHookInstallFailedSchema` with the free-form `error_message`
- [src/shared/telemetry-app-event-schemas.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/shared/telemetry-app-event-schemas.ts) — enum-only `agentErrorSchema` and its design comment
- [src/shared/telemetry-event-registry.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/shared/telemetry-event-registry.ts) — the 83-event registry
- [src/main/agent-hooks/install-telemetry.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/main/agent-hooks/install-telemetry.ts) — the emitter that ships `error.message`
- [src/main/agent-hooks/managed-agent-hook-registry.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/main/agent-hooks/managed-agent-hook-registry.ts) — the 14 hook installers
- [src/main/telemetry/client.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/main/telemetry/client.ts) — transport, build gating, consent ordering
- [src/main/telemetry/validator.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/main/telemetry/validator.ts) — fail-closed validation contract
- [src/main/telemetry/consent.ts](https://github.com/stablyai/orca/blob/0d23ea6e688410c878096dab8b1779857354b7d4/src/main/telemetry/consent.ts) — consent precedence and kill switches

### Live surfaces

- [Privacy & Telemetry — onorca.dev](https://www.onorca.dev/docs/telemetry) — live page carrying the audited sentences at retrieval
- [GitHub REST: stablyai/orca](https://api.github.com/repos/stablyai/orca) — stars, license, timestamps at retrieval

### Secondary context

- [Node.js errors documentation](https://nodejs.org/api/errors.html) — system error classes whose messages embed the failing path
- [Console Do Not Track](https://consoledonottrack.com/) — the `DO_NOT_TRACK` convention Orca implements
