---
title: "CodeBurn's $15 hard cap denies tools when it could stop Claude"
description: "Source Audit of getagentseal/codeburn at 3684f1d: the README says the hard cap stops the session; Claude Code hooks offer continue:false for that, the guard sends a per-tool deny."
categories: [AI, Agents]
tags: [ai-agents, open-source, trust-boundaries, harness-engineering]
date: 2026-09-17 09:56:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/cover.png
  alt: "Flat vector illustration of a spending gauge whose needle has passed a red limit line while a fuel nozzle stays attached to a running machine that keeps emitting token discs, with a closed red barrier over a small tool port"
---

![Flat vector illustration of a spending gauge whose needle has passed a red limit line while a fuel nozzle stays attached to a running machine that keeps emitting token discs, with a closed red barrier over a small tool port](/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/cover.png)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every hook branch, threshold default, pricing fallback and README sentence quoted here was read from the pinned commit 3684f1d or the live Claude Code hook documentation before publication.

## 🤔 Curiosity: What does a "hard cap" on a Claude Code session actually cap?

[getagentseal/codeburn](https://github.com/getagentseal/codeburn/tree/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d) is a local cost tracker for AI coding tools. It reads the session files that Claude Code, Cursor, Codex, Gemini and 37 other tools already leave on disk and breaks the spend down by model, project and task. It is MIT-licensed, written in TypeScript, created 2026-04-13, and at retrieval it carried 11,053 stars; the pinned commit 3684f1d is from 2026-09-16.

The README makes two kinds of promise. The first is about data: "Everything runs locally. No wrapper, no proxy, no API keys, nothing leaves your machine." The second is about control. Under "Guard your budget" it lists a soft cap (default $5, a one-time warning), a hard cap (default $15) that "stops the session; `codeburn guard allow` lifts it for that session only", and a $3 checkpoint nudge. The section ends with a sentence most tools would bury: "Hooks fail open: a broken guard never blocks a session."

I audited the second promise. The question is not whether the guard is useful; a per-session cost figure in the status line is useful. The question is what the words "hard cap" and "stops the session" mean once you read the hook that implements them and the Claude Code hook contract it runs inside.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/references/codeburn-dashboard.jpg" alt="The CodeBurn terminal dashboard from the README: per-period spend, tokens and per-model rows, the same cost path the guard folds per session">
  <figcaption>The surface most readers meet first: the terminal dashboard from the README. The guard reuses the same per-call cost path this view aggregates &mdash; Image from getagentseal/codeburn (MIT LICENSE at 3684f1d), commit 3684f1d. Source: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md">https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md</a>. Publisher: CodeBurn (getagentseal/codeburn). Licence: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE">MIT</a>.</figcaption>
</figure>

## 📚 Retrieve: The guard, read from the pinned tree

### The hook can deny a tool call and nothing more

`src/guard/hooks.ts` opens with a 31-line header that documents the Claude Code hook protocol as verified against the live docs on 2026-07-03, and it is candid about the ceiling: "We ALWAYS exit 0 and encode any decision as JSON, so an internal error is indistinguishable from 'no opinion' (fail-open)." The same header records that the Stop event "may block via top-level { decision: 'block' } or exit 2; we never do" and that "SessionStart cannot block".

The three handlers match the header. `handlePreToolUse` denies a tool call only when `hardUSD` is set, the cached session cost is at or above it, and no allow marker exists for the session; the denial is a JSON `permissionDecision: "deny"` whose reason text tells the caller to run `codeburn guard allow` or raise `hardUSD`. Below the hard cap, the soft cap produces a single `systemMessage`. `handleStop` never blocks; past the $3 checkpoint with no edit and no commit it returns a nudge. `runGuardHook` wraps everything in a try/catch that returns an empty string on any error, malformed payload or unknown event, and calls itself "The fail-open boundary".

That is the whole enforcement surface: one `deny` per tool call, issued after the cap is crossed. The JSON field `continue` is never emitted by `src/guard/hooks.ts` at the pinned commit; the word occurs once, in a comment about the Stop event.

| README sentence (lines 215-231) | What the pinned code does | Where |
|---|---|---|
| Hard cap "stops the session" | Denies each subsequent tool call with a reason string; no hook ends a session | `hooks.ts` 60-71 |
| "`codeburn guard allow` lifts it for that session only" | Allow is the existence of an empty marker file per session id | `usage.ts` 151-163 |
| Soft cap "one-time in-session warning" | `systemMessage` once, gated by `softWarned` | `hooks.ts` 72-76 |
| Checkpoint nudge at session end | `systemMessage` on Stop when no edit and no commit were seen; never blocks | `hooks.ts` 107-119 |
| "Hooks fail open" | try/catch to empty output; unreadable transcript freezes the total | `hooks.ts` 125-140, `usage.ts` 101-106 |

### The official hook contract does have a stop primitive, and the guard does not use it

The Claude Code hook documentation defines a top-level JSON field for exactly the README's sentence. Its table reads: `continue`, default `true`, "If false, Claude stops processing entirely after the hook runs. Takes precedence over any event-specific decision fields", with a companion `stopReason` "shown to the user when continue is false". The worked example is one line: "To stop Claude entirely: { "continue": false, "stopReason": "Build failed, fix errors before continuing" }", and the docs add that "For PreToolUse and PostToolUse hooks, the stop applies even when the tool call fails or completes while Claude is still streaming a response."

CodeBurn's hook emits `permissionDecision: "deny"` instead. The docs describe that field through a walkthrough of a hook that "returns a permissionDecision of 'deny'" for a destructive command, and are precise about its scope: "Exit code 0 with no output means the hook has no decision to report, so the tool call continues through the normal permission flow. The hook can deny the call, but staying silent doesn't approve it." A deny refuses one tool call; `continue: false` ends the turn. The guard's 31-line protocol header, verified against the docs on 2026-07-03, enumerates deny, `systemMessage`, `additionalContext` and the Stop event's `decision: "block"` (which "Prevents Claude from stopping, continues the conversation"), and never mentions the `continue` field. Whether the field was absent from the docs on that date or was left out on purpose is not something the pinned tree can answer; what the tree does answer is that the README's "stops the session" was implementable with a documented field and the shipped hook chose the weaker one.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/references/codeburn-menubar-app.jpg" alt="The CodeBurn menubar popover from the README with the running-session figure the guard also reads">
  <figcaption>The menubar popover from the README. The running-session figure here and the guard's status line read the same incremental cache &mdash; Image from getagentseal/codeburn (MIT LICENSE at 3684f1d), commit 3684f1d. Source: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md">https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md</a>. Publisher: CodeBurn (getagentseal/codeburn). Licence: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE">MIT</a>.</figcaption>
</figure>

### Why "denies the tools" is not "stops the spend"

Here is the inference the rest of the audit rests on, labelled as such. A PreToolUse hook runs after the model has already produced the tool call, so the turn that crossed the cap has already been billed. With a deny, the model's next turn, whether it retries a tool, explains itself, or asks the user what to do, bills tokens again, and every later denial repeats the cycle. With `continue: false` the documented behaviour is that Claude "stops processing entirely after the hook runs", even mid-stream. The cap as shipped removes tools; it does not remove spend. In practice the session ends when the human ends it.

The reason string is worth a second look: "Run 'codeburn guard allow' to lift the cap for this session, or raise hardUSD in guard.json." It is written for the person at the terminal. Nothing in the pinned code lets a model act on it, because the Bash tool it would need is denied like every other tool once the cap is hit; I did not verify from the docs whether a deny reason is also surfaced to the model, so I make no claim about that.

### Unpriced models fold in at $0

The guard "never reimplements cost math", as `usage.ts` says; it folds `parseApiCall(entry).costUSD` plus advisor cost into a per-message, last-wins running total. That is the right design, and it inherits the pricing path's one blind spot. `calculateCost` in `src/models.ts` looks up `getModelCosts(model)`; when nothing matches, it writes a stderr warning that "costs for this model will show $0" and returns 0.

Two things follow. First, a session spent on a model that is not in the LiteLLM snapshot or the bundled `pricing-fallback.json` (a brand-new model on its release day is the obvious case) accrues $0 toward the $15 cap, and the cap never fires. Second, the warning that would tell you so is written to stderr by a hook process that always exits 0, and for an exit-0 hook the docs say of stderr: "To read it yourself, enable debug logging." The guard is silent exactly where its number is wrong.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/references/codeburn-compare.jpg" alt="The codeburn compare view from the README, ranking models by cost against outcome">
  <figcaption>The compare view from the README ranks models by cost against outcome. A model with no price row is exactly the model the guard cannot count &mdash; Image from getagentseal/codeburn (MIT LICENSE at 3684f1d), commit 3684f1d. Source: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md">https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md</a>. Publisher: CodeBurn (getagentseal/codeburn). Licence: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE">MIT</a>.</figcaption>
</figure>

### The total can freeze or reset without a signal

`computeSessionUsage` returns the previous cache unchanged when `stat(transcriptPath)` throws. If the transcript path Claude Code hands the hook is unreadable for the rest of the session, the cost stays at its last value and the cap is never crossed. In the other direction, if the transcript is ever shorter than the cached byte offset, the fold restarts from an empty cache: cost 0, with only the `softWarned` and `stopNotified` flags preserved. The code comment calls the shorter file a rotated or truncated transcript, which is a sensible reason to restart; the effect is still a cap that resets to zero mid-session.

Both behaviours are consequences of the fail-open rule the README states out loud. Neither is a bug in the sense of code disagreeing with its own comments. They are the price of a guard that must never block a session because of its own failure, and the README does not spell out that the price includes a cap that can under-count.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/references/codeburn-capacity-dock.jpg" alt="The macOS menubar capacity dock from the README, showing provider quota and today's spend at a glance">
  <figcaption>The macOS capacity dock from the README shows provider quota next to today's spend. Quota is the provider's number; the guard's number is computed locally from the transcript &mdash; Image from getagentseal/codeburn (MIT LICENSE at 3684f1d), commit 3684f1d. Source: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md">https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md</a>. Publisher: CodeBurn (getagentseal/codeburn). Licence: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE">MIT</a>.</figcaption>
</figure>

### Defaults and the allow marker

`DEFAULT_GUARD_CONFIG` is soft $5, hard $15, checkpoint $3, opener enabled; `coerceThreshold` maps an explicit `null` to "disabled", matching the README. The allow marker is an empty file per session id: `isAllowed` is a `stat` on that path and `writeAllow` creates it. The CLI's `allow [sessionId]` needs the id when it cannot find an active guard session and says so: "No active guard session found. Pass the session id".

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/references/codeburn-optimize.jpg" alt="The codeburn optimize report from the README, listing projects and sessions where spend was flagged as waste">
  <figcaption>The optimize report from the README flags projects and sessions where spend looked like waste; the guard's SessionStart opener reuses these flags &mdash; Image from getagentseal/codeburn (MIT LICENSE at 3684f1d), commit 3684f1d. Source: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md">https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md</a>. Publisher: CodeBurn (getagentseal/codeburn). Licence: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE">MIT</a>.</figcaption>
</figure>

## 💡 Innovation: Treat the guard as a signal, and put the control where tokens are billed

The useful reframing is that CodeBurn guard is a **signal** with one **tool-level brake**, not a **budget control**. Three consequences for anyone running it:

1. **Read the status line, not the cap.** `--statusline` shows the same cached cost on every turn. That number is what the guard knows; watch it drift and you will see the freeze and reset cases the cap hides.
2. **Check the unpriced list before trusting the number.** The README documents an unpriced-model listing and a daily LiteLLM refresh. A $0 row means the guard is blind for that model until a price lands.
3. **Put the hard stop where spend is metered.** The provider console's spend limit and per-key budgets act before a turn is billed. Inside Claude Code, `continue: false` is the documented way to stop processing; a per-tool deny is not.

For readers who followed the [LLM Space API-key file-mode audit](/posts/llm-space-api-key-file-mode-audit/), this is the same shape: a README sentence that reads stronger than the shipped mechanism ("keys stay local"; "the cap stops the session"), with the difference that here the platform documents the stronger mechanism and the project did not reach for it. CodeBurn's README is unusually candid about failing open, which is why the remaining gap is small enough to describe precisely.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-17-codeburn-guard-hard-cap-audit/references/codeburn-desktop.jpg" alt="The CodeBurn desktop app window from the README with spend broken down by tool and project">
  <figcaption>The desktop app from the README breaks spend down by tool and project; guard caps are edited in guard.json, not here &mdash; Image from getagentseal/codeburn (MIT LICENSE at 3684f1d), commit 3684f1d. Source: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md">https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md</a>. Publisher: CodeBurn (getagentseal/codeburn). Licence: <a href="https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE">MIT</a>.</figcaption>
</figure>

## Limitations

- The central consequence, that a denied tool call still leaves billable turns while `continue: false` would stop processing, is an inference from the documented hook semantics (labelled I1); I did not instrument a live Claude Code session to measure the difference.
- The telemetry promise (an optional, opt-in, bucketed report from the desktop app) was not audited in this run; the README describes it and a consent switch, and that description was not tested.
- Pricing coverage was read from the resolution code, not enumerated; I did not measure how many models in a real transcript set land in the fallback or at $0.
- Everything above is pinned to 3684f1d. The guard module header says the hook protocol was checked on 2026-07-03; the hook documentation I quoted is the live page on 2026-09-17, so either side may move.

## 🎯 Key Takeaways

- At 3684f1d, the "hard cap" is one `permissionDecision: "deny"` per tool call after the cap is crossed, while the hook contract's `continue: false` would make Claude stop "processing entirely after the hook runs"; the guard never emits the `continue` field.
- The guard is fail-open by design and says so; the undocumented cost of that design is a total that can freeze (unreadable transcript) or reset (shorter transcript) without a signal.
- Unpriced models contribute $0 to the guarded total, and the only warning goes to hook stderr on an exit-0 path the contract does not surface.
- Use the guard as a per-session signal and keep the real spend limit at the provider.

## 🤔 New Questions

- Would emitting `continue: false` with a `stopReason` at the hard cap, instead of a per-tool deny, match the README's sentence without breaking the fail-open rule for guard errors?
- Should `calculateCost` return an "unpriced" marker instead of 0, so the guard can deny on unknown spend rather than under-count it?
- Which providers' consoles expose a per-key hard limit that a local tool could verify against, so the two numbers can be reconciled?

## References

### Primary sources (pinned)
- [getagentseal/codeburn at 3684f1d](https://github.com/getagentseal/codeburn/tree/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d)
- [README.md](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/README.md) — lines 73, 79 (local-first claims), 215-231 (guard), 785-840 (telemetry)
- [src/guard/hooks.ts](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/src/guard/hooks.ts) — header lines 1-31; handlers 50-140
- [src/guard/usage.ts](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/src/guard/usage.ts) — lines 92-163
- [src/guard/store.ts](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/src/guard/store.ts) — lines 47-91
- [src/guard/cli.ts](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/src/guard/cli.ts) — lines 147, 208
- [src/models.ts](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/src/models.ts) — lines 7, 155-159, 1200-1244
- [LICENSE](https://github.com/getagentseal/codeburn/blob/3684f1d5f0824cbf2cb6112d9c00b02eb5d4066d/LICENSE)

### Platform documentation
- [Claude Code hooks reference](https://code.claude.com/docs/en/hooks) — JSON output common fields (`continue`, `stopReason`), "Exit code 2 behavior per event", PreToolUse example, exit-0 stderr note (fetched 2026-09-17)

### Related audits on this site
- [LLM Space guards plugin settings with 0600 but not its API keys](/posts/llm-space-api-key-file-mode-audit/)
- [OpenOcta's LICENSE is GPL-3.0 again, its README says Apache-2.0](/posts/openocta-license-drift-audit/)
