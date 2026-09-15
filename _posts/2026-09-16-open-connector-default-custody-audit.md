---
title: "OpenConnector Declares Its Own Defaults Out of Scope"
description: "Source Audit of oomol-lab/open-connector: the security policy's do-not-report list names the defaults its quickstart ships, and anonymous proxy calls outrank scoped tokens."
categories: [AI, Agents]
tags: [mcp, ai-agents, trust-boundaries, open-source]
date: 2026-09-16 00:07:21 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-16-open-connector-default-custody-audit/default-custody-map.svg
  alt: "Diagram of oomol-lab/open-connector at commit 493def09: the four entries of SECURITY.md's out-of-scope list on the left, each connected to the shipped default that produces it on the right, with the plaintext secret codec, the pass-through auth middleware, the Dockerfile HOST=0.0.0.0 override, and the compose SQLite volume, plus a footer noting that anonymous proxy calls are fail-open while scoped runtime tokens are fail-closed"
---

![The four entries of SECURITY.md's out-of-scope list each map to a shipped default at the same commit: no encryption key selects the plaintext codec, no admin token selects the pass-through middleware, the Docker image pins HOST=0.0.0.0, and the compose file mounts the SQLite volume](/assets/img/posts/2026-09-16-open-connector-default-custody-audit/default-custody-map.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every default described was read from the pinned commit 493def09 or a bounded live API call before publication.

## 🤔 Curiosity: What does a credential gateway enforce before you configure it?

[oomol-lab/open-connector](https://github.com/oomol-lab/open-connector/tree/493def090c95a92ee312b95594c489c9856a16af) is an open-source connector gateway for AI agents: connect a user's SaaS accounts once, then expose the catalog to agents over SDK, HTTP, and MCP. It is Apache-2.0 licensed, written in TypeScript, created 2026-06-29, and at retrieval it carried 5,753 stars and 497 forks. Its hosted catalog reported 1,512 providers and 16,988 actions the same night.

The pitch is a custody boundary. The README says the project fits products where agents need durable access to user tools "without handing provider credentials to the agent process." That sentence is the reason a gateway like this exists: the agent gets capability, the gateway keeps the secrets.

So the first question I brought to the pinned tree was not whether the boundary is well designed. It was: what does the boundary enforce on the day you first run it?

The project answers that question in an unusual place — its own security policy. `SECURITY.md` contains a scope section listing what not to report as a vulnerability, and one bullet excludes "insecure self-hosted configuration that this project documents how to avoid," giving four examples: running without `OOMOL_CONNECT_ENCRYPTION_KEY`, running without `OOMOL_CONNECT_ADMIN_TOKEN`, binding to `0.0.0.0` on an untrusted network, and exposing the data store.

Each of those four examples is a code path I could go read at the pinned commit. So I did. All four are the shipped default.

## 📚 Retrieve: Reading the four defaults the policy excludes

The mapping, before the detail:

| SECURITY.md excludes from reports | Shipped default at commit 493def09 | Where it is decided |
|---|---|---|
| Running without `OOMOL_CONNECT_ENCRYPTION_KEY` | `PlainTextSecretCodec`; encode/decode are identity functions | `src/server/secrets/secret-codec.ts:54-55` |
| Running without `OOMOL_CONNECT_ADMIN_TOKEN` | Auth middleware becomes a pass-through that only calls `next()` | `src/server/api/auth.ts:43-52` |
| Binding to `0.0.0.0` on an untrusted network | Docker image pins `ENV HOST=0.0.0.0`; compose publishes `3000:3000` | `docker/Dockerfile:17`, `docker-compose.yml` |
| Exposing the SQLite/PostgreSQL/D1/R2 data store | SQLite in a named Docker volume beside the container | `docker-compose.yml` `connector-data` |

### No admin token compiles to a middleware that waves everything through

Authentication is not checked and then skipped. When no admin token, no runtime token, no stored runtime tokens, and no JWT verifier exist, `createLocalAuthMiddleware` in `src/server/api/auth.ts` returns a different function entirely — one that only calls `next()`. Every request to every route passes. The auth layer for the all-defaults deployment is structurally absent, not merely permissive.

`SECURITY.md` says this plainly: "Both admin and runtime authentication are disabled by default for local development."

The auth code in `src/server/api/auth.ts` routes `/mcp` and `/v1` into a shared runtime auth scope, so the MCP endpoint an agent host would connect to sits behind the same pass-through. Under defaults, any process that can reach port 3000 holds the full runtime surface.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-open-connector-default-custody-audit/references/open-console-en.jpg" alt="OOMOL Connect local runtime console Providers page listing 999 providers with Slack, GitHub, Notion and Google entries marked Configure OAuth Client or Connect, with Overview, Providers, Actions, Runs, API Key and Docs navigation">
  <figcaption>The web console's provider catalog. Under the all-defaults deployment this console, like the API beneath it, requires no authentication &mdash; Image from oomol-lab/open-connector (Apache-2.0), commit 493def09. Source: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/open-console-en.jpg">https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/open-console-en.jpg</a>. Publisher: oomol-lab (oomol-lab/open-connector). Licence: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/LICENSE.txt">Apache-2.0</a>.</figcaption>
</figure>

### No encryption key selects a codec whose encrypt is the identity function

Credential storage runs through a secret codec. `createSecretCodec` in `src/server/secrets/secret-codec.ts` returns an AES-256-GCM codec when `OOMOL_CONNECT_ENCRYPTION_KEY` is set — and a `PlainTextSecretCodec` when it is not. That class's `encode` and `decode` return their input unchanged. Stored OAuth tokens, API keys, and client secrets are persisted as the bytes you typed.

Again the documentation is candid. The hardening section states that without the key, "those payloads are stored in plaintext," and warns that completed action responses may contain sensitive provider data.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-open-connector-default-custody-audit/references/gmail-oauth-client.png" alt="OOMOL Connect Gmail provider page in Not connected state showing 46 actions, oauth2 auth, OAuth config Required, and an OAuth Client form with empty Client ID and Client Secret fields and a Save OAuth Client button">
  <figcaption>The console form where a Gmail OAuth client secret enters the store. Which codec receives it is decided by whether one environment variable was set &mdash; Image from oomol-lab/open-connector (Apache-2.0), commit 493def09. Source: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/gmail-oauth-client.png">https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/gmail-oauth-client.png</a>. Publisher: oomol-lab (oomol-lab/open-connector). Licence: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/LICENSE.txt">Apache-2.0</a>.</figcaption>
</figure>

### The recommended install path is the wide-open one

The Node entrypoint defaults its bind address to `127.0.0.1` — a genuinely conservative choice. But the README's Quick Start does not run the Node entrypoint. It runs `docker compose up`, and the Docker image overrides the bind with `ENV HOST=0.0.0.0` at build time, which containers need for port mapping. The shipped `docker-compose.yml` then publishes `3000:3000` to the host and passes `OOMOL_CONNECT_ENCRYPTION_KEY` and `OOMOL_CONNECT_ADMIN_TOKEN` through as empty values.

Then the README walks you into storing a real secret. Its Connect a Provider section demonstrates the flow with a GitHub personal access token: an unauthenticated `PUT /api/connections/github` carrying `github_pat_...` in the body. No admin token has been introduced yet; no encryption key has been mentioned.

The longer quickstart repeats the shape at document scale. In the 210-line `docs/quickstart.md`, the step that stores a GitHub PAT sits at line 63. `OOMOL_CONNECT_ENCRYPTION_KEY` first appears at line 178, and `OOMOL_CONNECT_ADMIN_TOKEN` at line 188 — the hardening lives in the final fifth of the document, after every credential-storing step it would have protected.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-open-connector-default-custody-audit/references/gmail-connect.png" alt="OOMOL Connect Gmail provider page in Not connected state with OAuth config Configured, 46 actions, and a Connect Gmail button offering the OAuth authorization flow">
  <figcaption>The connect step, after an OAuth client is configured. Everything the button stores lands in whichever codec the deployment selected &mdash; Image from oomol-lab/open-connector (Apache-2.0), commit 493def09. Source: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/gmail-connect.png">https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/gmail-connect.png</a>. Publisher: oomol-lab (oomol-lab/open-connector). Licence: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/LICENSE.txt">Apache-2.0</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-open-connector-default-custody-audit/references/gmail-connected.png" alt="OOMOL Connect Gmail provider page in Connected by oauth2 state showing 46 actions and Reconnect Gmail and Disconnect buttons after the OAuth credential is stored">
  <figcaption>The connected state: a live Gmail OAuth credential now sits in the runtime store &mdash; Image from oomol-lab/open-connector (Apache-2.0), commit 493def09. Source: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/gmail-connected.png">https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/gmail-connected.png</a>. Publisher: oomol-lab (oomol-lab/open-connector). Licence: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/LICENSE.txt">Apache-2.0</a>.</figcaption>
</figure>

### The policy engine's failure direction depends on who is asking

The sharpest thing I found is not a missing control. It is an asymmetry between two callers of the same control.

`/v1/proxy/:service` forwards requests to provider API endpoints beyond the curated action catalog, with the stored credentials attached server-side. `SECURITY.md` describes its default honestly: "every proxy is allowed until one of those variables restricts it, and the Action variables do not restrict it."

Now read the policy engine in `src/core/action-policy.ts`. The token-scoped proxy rules are only installed when a token is present. A persistent runtime token with an empty `allowedProxies` grant is denied every proxy — deny-by-default, exactly what you want. But when no token exists at all, that check is skipped, the deployment and runtime layers hold no lists, and `evaluateProxy` returns allowed.

Put those together under the shipped defaults and the capability ordering inverts: the caller who presents a deliberately scoped credential gets fail-closed proxy access, while the caller who presents nothing gets fail-open access to every proxy in the catalog. The operator who does the extra work of minting a scoped token builds a fence around that token — and the anonymous surface beside it stays open until an environment variable closes it.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-open-connector-default-custody-audit/references/create-runtime-token.png" alt="OOMOL Connect Access page titled Manage runtime API tokens for agents and clients, with a Runtime Tokens panel reading Issue bearer tokens for /v1 and MCP clients, New tokens are shown once, an empty state saying No runtime tokens yet, and a Create Token dialog naming a Local MCP client">
  <figcaption>The Access page that mints scoped runtime tokens for /v1 and MCP clients. Under all-defaults, the anonymous caller this page is meant to replace holds the wider proxy grant &mdash; Image from oomol-lab/open-connector (Apache-2.0), commit 493def09. Source: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/create-runtime-token.png">https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/create-runtime-token.png</a>. Publisher: oomol-lab (oomol-lab/open-connector). Licence: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/LICENSE.txt">Apache-2.0</a>.</figcaption>
</figure>

### What this does to the custody claim

The README's boundary — agents get capability, not credentials — survives at the byte level under defaults. The connection management API is written not to echo stored secrets back; its serializer comment says it adds "stored account metadata without exposing credentials," and that matches the code below it.

But custody is not only about bytes. Under the all-defaults deployment, any process that can reach the port — including the agent process the boundary was drawn against — can use every stored credential's full capability through unauthenticated action runs and fail-open proxies. The secret stays in the store; everything the secret can do walks out.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-16-open-connector-default-custody-audit/references/overview-page-en.jpg" alt="OOMOL Connect console Overview page showing Runtime ready with 1 connected provider, Capability Status cards reporting 1019 providers and 9912 local actions, a Tool Call Trend chart and a Recent Calls list">
  <figcaption>The Overview page counts what the runtime can reach: 1,019 providers and 9,912 local actions in this in-tree capture. Under defaults, that entire capability surface is the anonymous caller's &mdash; Image from oomol-lab/open-connector (Apache-2.0), commit 493def09. Source: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/overview-page-en.jpg">https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/assets/overview-page-en.jpg</a>. Publisher: oomol-lab (oomol-lab/open-connector). Licence: <a href="https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/LICENSE.txt">Apache-2.0</a>.</figcaption>
</figure>

## 💡 Innovation: Reading scope boundaries as configuration documentation

The pattern worth carrying out of this tree is that a security policy's scope section can be read as a map of what the project already knows its defaults do. OpenConnector's maintainers did not hide any of this. The startup logs warn three separate times on an all-defaults boot — admin auth disabled, runtime auth disabled, encryption disabled. The hardening guide is detailed and accurate against the code. The out-of-scope list exists precisely because the project understands these configurations are reachable.

That is what makes the overlap worth naming. Declaring documented misconfiguration out of scope is normal vulnerability-triage practice, and projects cannot fix user-owned deployment choices. But when the excluded configurations and the quickstart output are the same configurations, the scope boundary stops being a filter for user error and starts describing the product's own first-run state. A researcher who reproduces exactly what `docker compose up` plus the README's own curl examples produce has, by the policy's text, nothing reportable.

If you are evaluating a credential gateway for an agent stack — this one or any of its category — three checks fall out of this audit directly:

- **Find the pass-through path.** Ask what the auth middleware compiles to when every credential source is absent, not what it enforces when configured. Presence-based activation means the empty configuration is its own security mode.
- **Check both failure directions.** A policy engine can be deny-by-default for identified callers and allow-by-default for anonymous ones at the same time. Test the request that carries nothing, not only the token you scoped.
- **Walk the quickstart in order.** The state your store is in when the first real secret lands is decided by everything the quickstart said before that step, not by the hardening section after it.

I ran the same default-versus-documentation question against an agent orchestrator in my earlier [CLI Agent Orchestrator audit](/posts/cao-trust-boundary-audit/), where authentication was likewise off by default and the load-bearing switches were environment-variable presence checks. And the failure-direction asymmetry has a cousin in my [SkillHub audit](/posts/skillhub-observer-scanner-audit/), where a security gate keyed on scanner availability rather than scanner findings. Two data points are not a law, but the shape repeats: in agent infrastructure, the distance between the architecture diagram and the first-run deployment is where the custody claims go to be tested.

## Limitations

This audit reads one pinned commit, `493def09`, and two bounded live API responses; later commits may change any default named here. I did not deploy the gateway or exercise the proxy against live providers — every behavioral claim is bound to the code path quoted, not to a runtime observation. The project's documentation is unusually candid about each individual default, and the localhost-first framing is a real mitigation for the Node path; my findings concern the composition of defaults along the documented Docker quickstart, not concealment. The out-of-scope practice itself is common across open-source security policies, and nothing here asserts bad faith by the maintainers.

## 🎯 Key Takeaways

- **The out-of-scope list is the default configuration.** The four example configurations SECURITY.md excludes from vulnerability reports — no encryption key, no admin token, 0.0.0.0 binding, an exposed data store — are what the pinned tree ships when you follow the README's `docker compose up`.
- **Absent credentials disable the middleware, not just the check.** With no tokens configured, the auth layer returns a pass-through function, and the plaintext codec stores secrets as typed — both selected by presence checks, both warned about at startup, neither enforced against.
- **Anonymous callers outrank scoped tokens on the proxy surface.** Runtime tokens get deny-by-default proxy grants; the tokenless default gets allow-by-default. If you deploy this gateway, set `OOMOL_CONNECT_ADMIN_TOKEN`, `OOMOL_CONNECT_ENCRYPTION_KEY`, and either a proxy allowlist or `OOMOL_CONNECT_BLOCKED_PROXIES="*"` before the first credential is stored, and treat the quickstart's hardening section as step one rather than an appendix.

## 🤔 New Questions

- How many of the category's other gateways — Pipedream, Composio, and the self-hosted alternatives OpenConnector names as comparisons — show the same overlap between their vulnerability-scope exclusions and their quickstart output?
- Would a first-run wizard that refuses to store the first credential until an admin token and encryption key exist measurably change adoption, or is the frictionless quickstart load-bearing for a project at this stage?
- When an MCP host connects to a gateway like this, should the host itself verify it presented a token and refuse an endpoint that accepted it anonymously?

## References

- [oomol-lab/open-connector at 493def09](https://github.com/oomol-lab/open-connector/tree/493def090c95a92ee312b95594c489c9856a16af) — audited tree: README, SECURITY.md, docs/quickstart.md, docker-compose.yml
- [SECURITY.md scope section](https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/SECURITY.md) — out-of-scope list and hardening guidance
- [src/server/api/auth.ts](https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/src/server/api/auth.ts) — pass-through middleware and auth scopes
- [src/server/secrets/secret-codec.ts](https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/src/server/secrets/secret-codec.ts) — codec selection
- [src/core/action-policy.ts](https://github.com/oomol-lab/open-connector/blob/493def090c95a92ee312b95594c489c9856a16af/src/core/action-policy.ts) — proxy policy evaluation
- [GitHub REST API repository object](https://api.github.com/repos/oomol-lab/open-connector) and [live catalog endpoint](https://connector.oomol.com/v1/catalog) — metadata and counts at retrieval
