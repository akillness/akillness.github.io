---
title: "LLM Space guards plugin settings with 0600 but not its API keys"
description: "Source Audit of deer-flow/llm-space 4.19.0: the telemetry contract holds in code, but provider API keys land in a models.json written without the 0600 mode the plugin store uses."
categories: [AI, Agents]
tags: [ai-agents, trust-boundaries, open-source, telemetry]
date: 2026-09-16 17:21:56 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/custody-mode-map.svg
  alt: "Diagram of deer-flow/llm-space at commit e65eea24: the shared atomic JSON writer in the middle, with plugin settings and its backup passing mode 0o600 on the left, and models.json, analytics.json, search and network settings passing no mode on the right, so they inherit the process default of 0o666 masked by umask"
---

![Diagram of deer-flow/llm-space at commit e65eea24: the shared atomic JSON writer in the middle, with plugin settings and its backup passing mode 0o600 on the left, and models.json, analytics.json, search and network settings passing no mode on the right, so they inherit the process default of 0o666 masked by umask](/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/custody-mode-map.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every file mode, event map, and default described was read from the pinned commit e65eea24 or a bounded live API call before publication.

## 🤔 Curiosity: Which of the two local-first promises does the code actually keep?

[deer-flow/llm-space](https://github.com/deer-flow/llm-space/tree/e65eea24c87ee5b91618b7eb50e2af77a30ef042) is a desktop workbench for agent builders: write prompts and tools, trace every model call and tool run, replay a failed run, and export a thread as a runnable LangGraph agent. It is MIT-licensed, written in TypeScript, created 2026-06-28, and the pinned commit is the 4.19.0 release from 2026-09-13. At retrieval it carried 1,896 stars.

The README puts two promises in adjacent sentences: "Your files and API keys stay on your local computer. LLM Space collects a small amount of anonymous usage data to improve the app." The second half points at a `TELEMETRY.md` that describes itself as "intentionally auditable."

So I audited both halves at the same commit. The telemetry half holds up better than most projects I have read: a typed event map, one network egress, hard opt-out gates, and an on-disk contract that matches the prose. The credential half is true in the narrow sense the README states — keys do not leave the machine — but the file that holds them is the one settings file that does not ask the project's own atomic writer for a restrictive mode. The plugin settings store, two directories away, does.

That asymmetry is the finding. Not a leak, not a vulnerability report, just a custody detail the README's sentence does not cover and that anyone running the app on a shared devbox should know.

## 📚 Retrieve: The two promises, read from the pinned tree

Before the detail, the map of who asks for which file mode when writing under `~/.llm-space/settings/`:

| Writer at commit e65eea24 | File | Passes `mode`? | Coordinate |
|---|---|---|---|
| `PluginSettingsStore._write` | plugin settings file | yes, `0o600` | `packages/runtime/src/plugins/plugin-settings-store.ts` |
| `PluginSettingsStore._saveLastKnownGood` | plugin settings backup | yes, `0o600` | same file |
| `ModelManager._saveConfig` | `settings/models.json` (provider profiles, `apiKey`) | no | `packages/runtime/src/models/model-manager.ts` |
| `Analytics._writeConfig` | `settings/analytics.json` (install id, opt-out flag) | no | `apps/desktop/src/bun/analytics/index.ts` |
| `SearchSettingsManager` | search settings | no | `packages/runtime/src/search/search-settings-manager.ts` |
| `NetworkSettingsManager` | network settings | no | `packages/runtime/src/network/network-settings-manager.ts` |

### The telemetry contract is enforced where the prose says it is

`TELEMETRY.md` claims that "every event must be declared in the typed map" in `apps/desktop/src/shared/analytics.ts`, that "the only code that talks to the network is the bun main-process module" under `apps/desktop/src/bun/analytics/`, and that events go to PostHog EU Cloud at `eu.i.posthog.com`. At the pinned commit, all three are what the code does: `posthog-node` is a dependency of `apps/desktop` alone, and the only file under `apps/desktop/src` that imports it is `bun/analytics/index.ts`.

The shared module exports an `AnalyticsEventMap` interface with exactly six events: `app_opened`, `thread_run`, `provider_added`, `mcp_server_added`, `settings_opened`, and `onboarding_choice`. The `thread_run` payload is shape and outcome only — `provider`, `model`, `outcome`, `durationMs`, `messageCount`, `toolCount`, `hasSystemPrompt` — and the file's own comment says user-typed provider or model names "are collapsed to the literal `"custom"` before capture."

The main-process module is the single egress. Its `Analytics` class fixes one hard gate for the process lifetime, `_available = Boolean(POSTHOG_KEY) && !ANALYTICS_DISABLED`, and every `capture` returns early unless `_available` and the user's `_enabled` flag are both true. When it does send, it passes `$process_person_profile: false` and `disableGeoip: true` on every event, and it constructs the PostHog client with `flushAt: 1`. The config module bakes in a project key as `DEFAULT_POSTHOG_KEY`, resolves `POSTHOG_KEY` as `process.env.LLM_SPACE_POSTHOG_KEY ?? DEFAULT_POSTHOG_KEY`, and parses `LLM_SPACE_ANALYTICS_DISABLED` as any of `1`, `true`, or `yes`.

Two details are worth stating plainly because the prose implies them without spelling them out:

- Telemetry is **opt-out**. `DEFAULT_ANALYTICS_SETTINGS` is `{ enabled: true }`, and `start-desktop-app.ts` captures `app_opened` with `isFirstOpen: analytics.isFirstRun` right after the main window and RPC are ready. The first-run onboarding dialog does include a "Manage in settings" button that opens the General tab, and pressing it records an `onboarding_choice` of `analytics_settings` — but the `app_opened` event has already been captured by then. That is consistent with an opt-out model; it is just not a consent gate.
- The typed map is a **compile-time** guarantee. The RPC handler in `apps/desktop/src/bun/rpc/index.ts` forwards renderer events as `captureAnalyticsEvent: ({ event, properties }) => analytics.capture(event, properties)` with no runtime schema check at that boundary. The renderer code in the tree is first-party, and whether plugin extensions can reach this RPC is outside what I traced, so this is a design observation, not a finding of unexpected events. I am flagging it because `docs/plugins.md` says "Local Plugins are fully trusted. Runtime process isolation is not a security sandbox." That means the map's guarantee is exactly as strong as the set of code that can reach that RPC.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/references/settings-01-general.png" alt="LLM Space Settings dialog on the General tab showing rows for theme, rendering, default model, workspace folder, and a Share anonymous usage analytics toggle">
  <figcaption>The General settings tab from the project's own documentation, where the opt-out toggle for anonymous usage analytics lives. The toggle is subordinate to the two hard gates in the config module &mdash; Image from deer-flow/llm-space (MIT), commit e65eea24. Source: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-01-general.png">https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-01-general.png</a>. Publisher: deer-flow (deer-flow/llm-space). Licence: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE">MIT</a>.</figcaption>
</figure>

### API keys stay local, in a file written with no mode of its own

`docs/settings.md` describes the API key field on the Models page as "API Key for the Provider. Enter it directly or reference an environment variable." Both paths end in `ModelManager`, which the source comment describes as owning `settings/models.json`, "the single in-memory source of truth for the configured providers." The zod schema for a provider profile carries `apiKey: z.string().optional()`, and `_saveConfig` is one line:

```ts
private _saveConfig(): void {
  atomicWriteJsonFileSync(this._configPath, this._config);
}
```

No third argument. The env-var path is real: when the resolver sees a stored key that starts with `$`, it returns `process.env[apiKey.slice(1)]` instead of the stored string. But a key typed directly into the password-style `ApiKeyField` is stored as the literal string, and the file it is stored in is created however the writer's default says.

That writer is `atomicWriteJsonFileSync` in `packages/core/src/server/json-file.ts`. It takes `options: { mode?: number } = {}`, opens a temporary file with `openSync(temporary, O_CREAT | O_EXCL | O_WRONLY, options.mode)`, writes, fsyncs, renames over the target, and then applies `if (options.mode !== undefined) chmodSync(filePath, options.mode)`. When `mode` is undefined, the create call falls through to Node's documented default for `fs.openSync`, which is `0o666`, and the process umask decides what survives.

The project knows how to use that parameter. `PluginSettingsStore._write` calls `atomicWriteJsonFileSync(this._path, validated, { mode: 0o600 })`, and `_saveLastKnownGood` writes the backup copy with the same `{ mode: 0o600 }`. Those are the only two `0o600` call sites among the six settings writers I checked (plugin, models, analytics, search, network, and the plugin backup). The plugin docs, meanwhile, tell plugin authors to "Keep passwords, API keys, and tokens in environment variables." So the file that the documentation steers secrets away from gets the restrictive mode, and the file that the Models page steers secrets into does not.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/references/settings-02-models.png" alt="LLM Space Settings dialog on the Models tab listing configured providers on the left and a selected provider's API key, base URL, and model list on the right">
  <figcaption>The Models settings tab. The API key field on the right is the direct-entry path that lands in settings/models.json &mdash; Image from deer-flow/llm-space (MIT), commit e65eea24. Source: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-02-models.png">https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-02-models.png</a>. Publisher: deer-flow (deer-flow/llm-space). Licence: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE">MIT</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/references/settings-03-add-provider.png" alt="LLM Space add-provider picker grouping providers under Discovered, Recommended, and Built-in headings with a search box at the top">
  <figcaption>The add-provider picker. The Discovered group lists providers whose API key was found in the environment; the Models page code routes any provider not yet configured into Discovered, Recommended, or Built-in &mdash; Image from deer-flow/llm-space (MIT), commit e65eea24. Source: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-03-add-provider.png">https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-03-add-provider.png</a>. Publisher: deer-flow (deer-flow/llm-space). Licence: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE">MIT</a>.</figcaption>
</figure>

### What a missing mode means, and what it does not

I did not run the app to measure the permission bits on a produced `models.json`, so the following is inference from the two documented defaults rather than a measurement. With Node's `0o666` create default and the common interactive umask of `022`, the file would be created `0644`: readable by every local account on the machine. With a stricter umask such as `077`, it would be `0600` without the code asking. The plugin settings file does not depend on that environmental luck, because it asks.

Where this matters is not a single-user laptop, where the home directory is typically already private. It matters on the exact deployment the project documents next: `docs/remote-runtime.md` explains that with a remote runtime "the remote machine owns the workspace, model settings, MCP servers, tools, skills, and network access for that runtime," and that the default install directory `~/.llm-space/remote-runtime` "is resolved on the SSH server as that user's `$HOME/.llm-space/remote-runtime`." So provider keys for a remote runtime are configured and stored on the shared devbox by the remote server, which is built from this same tree, so as far as the source shows the same writer and the same missing mode apply there. The same doc is careful in the other direction — "LLM Space does not store SSH passwords or private-key passphrases" — which is what makes the model-key file stand out.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/references/get-started-01-providers-detected.png" alt="LLM Space first-run screen announcing that providers were detected from environment variables, with buttons to add them or configure manually">
  <figcaption>The first-run flow detecting providers from environment variables. Environment references are the storage path the resolver reads back with process.env[...] instead of a stored literal &mdash; Image from deer-flow/llm-space (MIT), commit e65eea24. Source: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/get-started-01-providers-detected.png">https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/get-started-01-providers-detected.png</a>. Publisher: deer-flow (deer-flow/llm-space). Licence: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE">MIT</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/references/get-started-02-ready-to-run.png" alt="LLM Space main window after a provider has been added, showing a thread ready to run with the configured model selected">
  <figcaption>The ready-to-run state after a provider is configured. From here every run resolves the provider connection through ModelManager, so the storage form of the key decides who else on the host can read it &mdash; Image from deer-flow/llm-space (MIT), commit e65eea24. Source: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/get-started-02-ready-to-run.png">https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/get-started-02-ready-to-run.png</a>. Publisher: deer-flow (deer-flow/llm-space). Licence: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE">MIT</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-llm-space-api-key-file-mode-audit/references/settings-05-custom-provider.png" alt="LLM Space Settings dialog showing a custom provider configuration with API type selector, base URL, API key field, and model entries">
  <figcaption>A custom provider's configuration. Custom provider names are collapsed to the literal "custom" in telemetry, but the API key entered here is stored the same way as a builtin provider's key &mdash; Image from deer-flow/llm-space (MIT), commit e65eea24. Source: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-05-custom-provider.png">https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/images/settings-05-custom-provider.png</a>. Publisher: deer-flow (deer-flow/llm-space). Licence: <a href="https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE">MIT</a>.</figcaption>
</figure>

## 💡 Innovation: Grade local-first claims by which file gets the mode

The lesson I take from this tree is a small, reusable test for any "your keys stay on your machine" claim: find the project's own atomic file writer, list every caller, and note which callers pass a mode. The callers that do are the files the authors thought of as secret-bearing. The callers that do not are where the README's sentence stops and the umask starts.

Applied here, the test says three concrete things:

1. **The telemetry promise is structural.** A six-entry typed map, one egress class with a lifetime-fixed availability gate, person profiles and GeoIP switched off per event, and a contract file that names the exact source files. If you are choosing a workbench partly on telemetry hygiene, this is one of the more complete implementations I have audited in this series, and the one caveat is that it is opt-out with `app_opened` sent at boot.
2. **The credential promise is positional, not protective.** Keys stay local because nothing ships them; they are not protected because nothing restricts the file. The fix is a one-argument change at `ModelManager._saveConfig`, and the project's own plugin store shows the exact form.
3. **Until that change lands, use the `$ENV_VAR` form.** The resolver's `startsWith("$")` branch means the stored string is a variable name, not a secret. On a remote runtime, that keeps the secret in the SSH session's environment rather than in a JSON file under a shared `$HOME`.

For readers who followed the [OpenConnector default-custody audit](/posts/open-connector-default-custody-audit/), this is the mirror image: that gateway declared its plaintext default out of scope; this workbench never declared a default at all, and the missing mode is the default. The [cli-agent-orchestrator trust-boundary audit](/posts/cao-trust-boundary-audit/) is the third point on the same line, an orchestrator whose auth is default-off and documented as such.

## Limitations

- I read the pinned commit and the project's documentation; I did not install LLM Space or inspect a produced `~/.llm-space/settings/models.json` on disk. The `0644` figure is inference from Node's documented `0o666` default and a `022` umask, not a measurement.
- The RPC observation is about validation at a boundary, not about any observed undeclared event. All renderer code at this commit is first-party.
- Repository metrics (stars, dates) are point-in-time API reads from 2026-09-16 and will drift.
- I did not audit the LangGraph project generator, the run-history replay store, or the MCP settings page; they are out of scope for this custody question.

## 🎯 Key Takeaways

- At commit e65eea24, `TELEMETRY.md`'s three structural claims — typed event map, single egress, PostHog EU — are what the code does, with `$process_person_profile: false` and `disableGeoip: true` on every event.
- Telemetry is opt-out; `app_opened` is captured at boot before the onboarding notice can be acted on.
- Provider API keys typed into Settings are stored as literal strings in `settings/models.json`, written by `atomicWriteJsonFileSync` with no `mode`, so the file inherits Node's `0o666` default masked by umask.
- The same writer is called with `{ mode: 0o600 }` for the plugin settings file and its backup — the project already has the pattern, just not on the file that holds the keys.
- The `$ENV_VAR` reference form stores a variable name instead of the secret and is the safer path today, especially for remote runtimes where model settings live on the SSH host.

## 🤔 New Questions

- Would a `{ mode: 0o600 }` on `models.json` be enough, or should the settings directory itself be created `0700` so the analytics id and network settings inherit it?
- Should the "Discovered" flow store `$OPENAI_API_KEY`-style references by default when it finds keys in the environment, rather than asking the user to type the literal?
- If plugins can reach the analytics RPC, is a runtime allow-list of the six event names cheap enough to make the typed map a runtime guarantee too?

## References

### Primary sources (pinned to e65eea24c87ee5b91618b7eb50e2af77a30ef042)

- [deer-flow/llm-space README](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/README.md)
- [TELEMETRY.md](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/TELEMETRY.md)
- [apps/desktop/src/shared/analytics.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/apps/desktop/src/shared/analytics.ts)
- [apps/desktop/src/bun/analytics/config.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/apps/desktop/src/bun/analytics/config.ts)
- [apps/desktop/src/bun/analytics/index.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/apps/desktop/src/bun/analytics/index.ts)
- [apps/desktop/src/bun/rpc/index.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/apps/desktop/src/bun/rpc/index.ts)
- [apps/desktop/src/bun/app/start-desktop-app.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/apps/desktop/src/bun/app/start-desktop-app.ts)
- [apps/desktop/src/components/onboard-dialog.tsx](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/apps/desktop/src/components/onboard-dialog.tsx)
- [packages/runtime/src/models/model-manager.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/packages/runtime/src/models/model-manager.ts)
- [packages/core/src/server/json-file.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/packages/core/src/server/json-file.ts)
- [packages/runtime/src/plugins/plugin-settings-store.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/packages/runtime/src/plugins/plugin-settings-store.ts)
- [packages/core/src/server/paths.ts](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/packages/core/src/server/paths.ts)
- [docs/settings.md](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/settings.md)
- [docs/plugins.md](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/plugins.md)
- [docs/remote-runtime.md](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/docs/remote-runtime.md)
- [LICENSE (MIT)](https://github.com/deer-flow/llm-space/blob/e65eea24c87ee5b91618b7eb50e2af77a30ef042/LICENSE)

### Platform documentation

- [Node.js fs.openSync — mode default 0o666](https://nodejs.org/docs/latest-v22.x/api/fs.html)
- [GitHub REST API — repository object for deer-flow/llm-space](https://api.github.com/repos/deer-flow/llm-space)

### Related on this site

- [OpenConnector Declares Its Own Defaults Out of Scope](/posts/open-connector-default-custody-audit/)
- [cli-agent-orchestrator trust-boundary audit](/posts/cao-trust-boundary-audit/)
