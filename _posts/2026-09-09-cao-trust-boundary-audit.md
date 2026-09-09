---
title: "CAO's Honest Trust Boundary and Its Phantom Auth Switch"
description: "A commit-pinned audit of awslabs/cli-agent-orchestrator 2.5.0: the docs name the real trust boundary in plain text, and four references cite an auth switch no code reads."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, trust-boundaries, open-source]
date: 2026-09-09 00:11:24 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-09-cao-trust-boundary-audit/trust-boundary-map.svg
  alt: "Map of the CAO trust boundary: network-edge defenses guard the outside while supervisor and worker agents share one trust domain inside, and a phantom CAO_AUTH_ENABLED switch floats disconnected"
---

![Map of the CAO trust boundary: defended network edge outside, one shared agent trust domain inside, and a disconnected CAO_AUTH_ENABLED switch](/assets/img/posts/2026-09-09-cao-trust-boundary-audit/trust-boundary-map.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: When twelve AI CLIs share one machine, what separates them?

[CLI Agent Orchestrator](https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818) (CAO) is the awslabs project that coordinates AI coding CLIs — its prerequisites list links twelve provider guides, from Kiro CLI and Claude Code to Codex, Cursor, and Grok Build — so a supervisor agent can delegate work to specialist workers. The repository is Apache-2.0, created 2025-07-29, and carried 1,238 stars with a last push on 2026-09-08 at retrieval. This audit pins the tree at commit `ce18db23`, whose `pyproject.toml` declares version 2.5.0.

The README makes a specific promise: CAO "runs a local `cao-server`, starts provider CLIs in isolated terminal sessions", while "the agents remain full CLI processes with their native authentication and capabilities." My previous audit, [Ouroboros preaches agency and ships owner-first custody](/posts/ouroboros-agency-custody-audit/), asked who holds authority over one self-modifying agent. An orchestrator multiplies the sharper question: when several full CLI processes (CAO supports twelve providers) run under one OS user on one machine, what actually separates agent from agent — and which of the shipped defenses would notice if one of them turned hostile?

So I read the security surface of the pinned tree end to end: the auth core, the scope decorators, the network constants, the WebSocket PTY contract, the fleet example, and the boundary-naming docstrings along those paths. The tree answers the question in plain text. It also cites, in four separate places, an auth switch that no executable code reads.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-09-cao-trust-boundary-audit/references/cao_architecture.png" alt="Architecture diagram committed in the CAO repository: a Supervisor Agent coordinates three Worker Agents, each driving a CLI tool such as Kiro CLI, Claude Code, or Codex">
  <figcaption>The shipped topology: one supervisor, delegated workers, and provider CLIs underneath &mdash; Architecture diagram from the awslabs/cli-agent-orchestrator repository, Apache-2.0 licensed, pinned at commit ce18db23. Source: <a href="https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818">https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818</a>. Publisher: Amazon Web Services Labs (awslabs/cli-agent-orchestrator contributors). Licence: <a href="https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE">https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE</a>.</figcaption>
</figure>

## 📚 Retrieve: Classifying every defense as enforcement, UX gate, or prose

I audited the pinned tree through a shallow clone at `ce18db23` plus the GitHub API. Every quote below carries its file coordinate; nothing in this section comes from running the server.

### The defended edge is the network, and the code says so

The API server binds `127.0.0.1:9889` by default (`constants.py`, lines 362-363). Around that loopback bind sits genuinely careful engineering: a `TrustedHostMiddleware` Host-header allowlist annotated as DNS-rebinding mitigation, a fixed loopback CORS list, and a WebSocket PTY endpoint whose comments cite [CWE-1385](https://cwe.mitre.org/data/definitions/1385.html) by number — "the handler must validate `Origin` itself or any web page the victim visits can drive the local PTY" (`constants.py`, lines 490-493). When authentication is enabled, the JWKS cache serves stale IdP keys across outages only up to a hard 24-hour bound — "Past it the keys are considered too stale to trust... so validation fails closed"; tokens are RS256-only with issuer and audience pinning, and the audience check falls back to the advertised resource identifier "so audience verification is never silently disabled" (`security/auth.py`).

That is not checkbox security writing. Someone thought about key rotation during outages, about cross-site WebSocket hijacking, about DNS rebinding — the classes of bug that only hurt you in production.

### Inside the edge, the docs refuse to pretend

The same tree is equally deliberate about what it does **not** defend. The auth core's module docstring opens with the posture: it is "**default-off**: with `AUTH0_DOMAIN` unset *and* `CAO_AUTH_JWKS_URI` unset, every authorization path returns the full scope taxonomy and no enforcement happens — behavior is byte-for-byte identical to a build with no auth layer" (`security/auth.py`, lines 4-7). The scope decorator calls itself "a UX gate; the FastAPI `Depends(get_current_scopes)` boundary is the real enforcement point" (`security/decorators.py`, lines 5-6) — and when the optional local token fails validation, the pre-check logs a warning and returns the full scope set, deferring to that boundary by design.

The API reference states the consequence outright (`docs/api.md`, lines 192-196):

> "`group` is an organizational label, not a security boundary. On a default install with auth disabled, a worker already has local shell access to this API, so `group`/`discovery`/session-scoping provide no tenant isolation or access-control guarantee even used together — do not build a security boundary on top of them."

Read that against the README's "isolated terminal sessions". The isolation is real as workspace separation — each provider CLI gets its own tmux session — but it is presentation-level, not privilege-level. Every agent is a full process under the same OS user, and the docs state plainly that any of them can drive the orchestration API that controls all the others.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-09-cao-trust-boundary-audit/references/tmux_all_windows.png" alt="tmux screenshot committed in the CAO repository showing one attached session with five windows — an analysis supervisor, three data analysts, and a report generator — exchanging send_message calls through the cao-mcp-server">
  <figcaption>What "isolated terminal sessions" look like: five agent windows in one tmux client, one OS user, one trust domain &mdash; tmux session screenshot from the awslabs/cli-agent-orchestrator repository, Apache-2.0 licensed, pinned at commit ce18db23. Source: <a href="https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818">https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818</a>. Publisher: Amazon Web Services Labs (awslabs/cli-agent-orchestrator contributors). Licence: <a href="https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE">https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE</a>.</figcaption>
</figure>

The unauthenticated surfaces are documented with the same directness. The WebSocket PTY comment block: "The WebSocket endpoint provides unauthenticated PTY access, so this list is deliberately tight" (`constants.py`, lines 474-475) — the list being a loopback client-IP allowlist. The API docs confirm the consequence: "With authentication disabled, clients that also pass the Origin check receive full PTY read/write access." And the workflow run-inspection route carries a docstring that reads like an audit of itself: the retained step output "is INERT in the default deployment... A local CAO server therefore serves step output and error text to any caller that can reach the port", a posture it labels "deliberately documented rather than further gated" (`api/main.py`, lines 5155-5162).

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-09-cao-trust-boundary-audit/references/handoff-workflow.png" alt="Sequence diagram committed in the CAO repository: a Supervisor hands off 'Implement login feature' to a Developer agent, waits, then hands off 'Review login code' to a Reviewer agent">
  <figcaption>The supervisor's coordination primitives &mdash; every handoff crosses the same loopback API that carries no per-request auth by default &mdash; Handoff workflow diagram from the awslabs/cli-agent-orchestrator repository, Apache-2.0 licensed, pinned at commit ce18db23. Source: <a href="https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818">https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818</a>. Publisher: Amazon Web Services Labs (awslabs/cli-agent-orchestrator contributors). Licence: <a href="https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE">https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE</a>.</figcaption>
</figure>

### Fleet mode extends the boundary — and the candor

The fleet-coordinator example scales CAO across machines, and its security section opens with a bold warning callout (`docs/fleet-coordinator.md`, lines 250-277):

> "A node's `cao-server` is an unauthenticated command-execution surface. Anyone who can reach `host:port` can launch and drive agents on that node — that is full command execution. The private network is the *only* thing protecting it."

It continues: "The network is the trust boundary", there is "no per-request API auth on a node" in the example, and "`CAO_ALLOWED_HOSTS` is not authentication" — it is a Host-header allowlist, not peer auth. The document even flags its own bootstrap hazard: the bind-address fallback chain ends at the default-route IP, which on a cloud host without a private route "would bind the unauthenticated `cao-server` to a public IP". The panel gets opt-in token auth; "the nodes don't."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-09-cao-trust-boundary-audit/references/mcp-apps-dashboard.png" alt="CAO Fleet dashboard widget committed in the repository, listing six agents across two sessions with their providers (kiro_cli, claude_code, codex, gemini_cli) and states from PROCESSING to ERROR">
  <figcaption>The fleet view: six agents, four providers, two sessions &mdash; every card a full CLI process inside the same boundary &mdash; MCP Apps fleet dashboard screenshot from the awslabs/cli-agent-orchestrator repository, Apache-2.0 licensed, pinned at commit ce18db23. Source: <a href="https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818">https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818</a>. Publisher: Amazon Web Services Labs (awslabs/cli-agent-orchestrator contributors). Licence: <a href="https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE">https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE</a>.</figcaption>
</figure>

### The switch that exists only in prose

Here is the finding this audit adds. The canonical configuration section gets activation right: "Auth activates only when `CAO_AUTH_JWKS_URI` (or `AUTH0_DOMAIN`) is set" (`docs/configuration.md`, line 253) — and it warns that the `auth.*` keys in `settings.json` "are schema-only and have no runtime effect yet."

But a whole-tree grep for `CAO_AUTH_ENABLED` returns exactly four hits, all prose: `docs/api.md:256` ("With `CAO_AUTH_ENABLED` unset — the default — that check is inert"), `docs/configuration.md:171`, and two docstrings in `api/main.py` (lines 5132 and 5157). No executable code in the pinned tree reads a `CAO_AUTH_ENABLED` environment variable. The only reads that activate authentication are `os.getenv("AUTH0_DOMAIN")` and `os.getenv("CAO_AUTH_JWKS_URI")` in `security/auth.py`.

The failure mode writes itself. An operator who lands on the workflow-reads paragraph or the retention warning — both operator-facing documents — learns the name of a boolean kill-switch. Setting `CAO_AUTH_ENABLED=1` produces no error, no warning, and no authentication: environment variables that nothing reads are ignored silently. The operator's mental model says auth is on; the server's behavior is byte-for-byte the no-auth build. The drift is doubly instructive because both drifted documents sit within 100 lines of correct text: `configuration.md` line 171 contradicts its own canonical auth section at line 253.

I read this as a naming symptom of a design choice, not carelessness. CAO made "auth on" an **emergent property of configuration presence** — there is no boolean to name, so writers who need one invent it. The very fact that the four references agree on the same invented name suggests they were written against a mental model of a switch the architecture deliberately avoided shipping. Notably, the pinned HEAD commit itself is "docs: clarify PTY WebSocket authorization (#749)" — this documentation surface is under active, same-day maintenance, which makes the surviving phantom references more interesting, not less: prose drift outlives even attentive editing when the name it drifts toward is more intuitive than the mechanism.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-09-cao-trust-boundary-audit/references/mcp-apps-event-stream.png" alt="Governance Stream widget committed in the CAO repository, logging launch, a2a, handoff, file, done, and error events per agent with UTC timestamps">
  <figcaption>The governance stream logs launches, handoffs, and errors &mdash; observability for a boundary that scope checks do not enforce by default &mdash; MCP Apps governance stream screenshot from the awslabs/cli-agent-orchestrator repository, Apache-2.0 licensed, pinned at commit ce18db23. Source: <a href="https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818">https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818</a>. Publisher: Amazon Web Services Labs (awslabs/cli-agent-orchestrator contributors). Licence: <a href="https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE">https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE</a>.</figcaption>
</figure>

### The deny-list at the shared-memory tier

One more boundary deserves its classification. Writes to the machine-wide shared memory tier pass a credential gate, and the module describes itself honestly: "This is a heuristic deny-list, not entropy scoring; it errs toward catching common credential shapes" (`services/secret_gate.py`, lines 9-12). Six named regexes — AWS key IDs, PEM headers, bearer/api-key/token assignments, password assignments, GitHub and GitLab PATs. A deny-list by shape will miss credentials whose names and formats fall outside those six families; the module does not claim otherwise, and the scoping (reject-on-write for the federated tier only) is proportionate to what a regex gate can honestly promise.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-09-cao-trust-boundary-audit/references/multi-role-feature-development.png" alt="Sequence diagram committed in the CAO repository: Product Manager, Developer, and Reviewer agents exchanging send_message calls to build and approve a payment API">
  <figcaption>Agent-to-agent messaging &mdash; the docs treat sibling metadata as "agent-authored, untrusted content", the same trust class as these messages &mdash; Multi-role messaging diagram from the awslabs/cli-agent-orchestrator repository, Apache-2.0 licensed, pinned at commit ce18db23. Source: <a href="https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818">https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818</a>. Publisher: Amazon Web Services Labs (awslabs/cli-agent-orchestrator contributors). Licence: <a href="https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE">https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE</a>.</figcaption>
</figure>

## 💡 Innovation: What this classification is worth in production

The audit yields a three-way classification that transfers to any orchestrator you evaluate:

| Defense in the pinned tree | Class | Coordinate |
|---|---|---|
| Loopback bind, TrustedHost, CORS list | Enforcement (network edge) | `constants.py` 362-363, ALLOWED_HOSTS |
| WS PTY client-IP allowlist + CWE-1385 Origin check | Enforcement (network edge) | `constants.py` 474-497 |
| OAuth 2.1 scope checks on API routes | Enforcement **only when IdP config present**; otherwise inert | `security/auth.py` 4-7 |
| `requires_scopes` decorator, local-token pre-check | UX gate by its own label; fails open to the FastAPI boundary | `security/decorators.py` 5-6 |
| `group`/`discovery`/session scoping | Organizational labels; explicitly not security | `docs/api.md` 192-196 |
| Fleet node API | No per-request auth; network is the boundary | `docs/fleet-coordinator.md` 250-260 |
| Shared-memory credential gate | Heuristic deny-list, six shape families | `services/secret_gate.py` 9-12 |
| `CAO_AUTH_ENABLED` | Prose only — read by no code | grep: 4 hits, all docs/docstrings |

Three decisions follow for anyone running CAO or a similar orchestrator:

1. **Treat co-located agents as one trust domain, because the vendor does.** CAO's docs say a worker already has local shell access to the API. If your threat model includes a prompt-injected worker, the separation you need is OS users, containers, or per-node network segmentation — not `group` labels. This is the operator-side complement of the custody question in the [Ouroboros audit](/posts/ouroboros-agency-custody-audit/): there the agent's authority over itself was the risk; here it is each agent's authority over its siblings.
2. **If you enable auth, verify the activation mechanism against code, not docs.** The real switch is IdP-config presence. After setting it, confirm enforcement behaviorally — an unauthenticated request to a scoped route should return 401, the pattern [openharness's permission ordering](/posts/openharness-permission-order-audit/) taught: the order and existence of checks is only trustworthy once observed.
3. **Audit your own docs for phantom switches.** The generalizable lesson is that activation-by-presence breeds invented booleans. If your system's security posture is an emergent property of configuration, either ship the explicit boolean people keep reaching for, or grep your docs for the boolean they will invent.

### Limitations

This is a static audit of one pinned commit plus its documentation; I did not run `cao-server` or verify route behavior dynamically, so behavioral statements above rest on the quoted code and docstrings rather than on observed traffic. The `CAO_AUTH_ENABLED` finding is scoped to environment-variable reads in the pinned tree `ce18db23`; the two `api/main.py` occurrences are internal docstrings where shorthand is more defensible than in the two operator-facing docs. The repository moves daily — the same-day HEAD was itself a security-docs clarification — so any coordinate here may have moved by the time you read it. Nothing in this audit is a vulnerability report: every posture described is documented by the project itself, and the phantom switch is documentation drift, not an exploitable flaw.

## 🎯 Key Takeaways

- **CAO defends the network edge and says so**: loopback bind, TrustedHost, CWE-1385 Origin validation on the PTY WebSocket, and an RS256-only OAuth 2.1 layer with a fail-closed 24-hour JWKS staleness bound — when an IdP is configured.
- **Inside the edge there is one trust domain**: auth is default-off with full scopes for every caller, `group` is "not a security boundary", scope pre-checks are self-described "UX gates", and each fleet node is "an unauthenticated command-execution surface" guarded by private networking.
- **Four references teach a switch that does not exist**: `CAO_AUTH_ENABLED` appears in two operator docs and two docstrings, but no code in the pinned tree reads it — auth activates on `AUTH0_DOMAIN`/`CAO_AUTH_JWKS_URI` presence, and setting the phantom variable fails silently.
- **Activation-by-presence breeds invented booleans**: when "security on" has no named flag, documentation converges on one anyway — grep your own docs for the switch your writers will invent.

## 🤔 New Questions

- Would an explicit `CAO_AUTH_ENABLED` boolean (validated, erroring when set without an IdP) cost anything beyond one constant — and would upstream accept it as the cheaper fix over correcting four prose sites that drifted the same way?
- What is the minimal per-agent privilege separation (OS users? rootless containers per provider CLI?) that preserves CAO's tmux ergonomics while making `group` labels coincide with an actual boundary?
- How many other agent orchestrators document their agent-to-agent trust domain at all — is CAO's candor the exception or the emerging norm?

## References

**Primary sources**

- [awslabs/cli-agent-orchestrator @ ce18db23](https://github.com/awslabs/cli-agent-orchestrator/tree/ce18db239553407c01a817aba52129fc54657818) — pinned tree audited: README, `security/auth.py`, `security/decorators.py`, `constants.py`, `api/main.py`, `services/secret_gate.py`, `docs/api.md`, `docs/configuration.md`, `docs/fleet-coordinator.md`
- [GitHub API: repository metadata](https://api.github.com/repos/awslabs/cli-agent-orchestrator) — stars, forks, license, timestamps (retrieved 2026-09-08T16:06Z)
- [Apache License 2.0 at the pinned commit](https://github.com/awslabs/cli-agent-orchestrator/blob/ce18db239553407c01a817aba52129fc54657818/LICENSE)

**Standards and background**

- [CWE-1385: Missing Origin Validation in WebSockets](https://cwe.mitre.org/data/definitions/1385.html)
- [RFC 9728: OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728)

**Related on this site**

- [Ouroboros Preaches Agency and Ships Owner-First Custody](/posts/ouroboros-agency-custody-audit/)
- [OpenHarness Lets Its Allow List Outrank Your Deny Rules](/posts/openharness-permission-order-audit/)
