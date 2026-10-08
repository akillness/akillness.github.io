---
title: "Cloudflare OS simulates approvals, but never for MCP writes"
description: "Source Audit of Cloudflare OS at 5cae880e: approve-later simulation is per-Gatekeeper code; MCP writes are never simulated and pause the agent while a human decides."
categories: [AI, Agents]
tags: [mcp, ai-agents, trust-boundaries, harness-engineering, open-source]
date: 2026-10-04 00:17:24 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/cloudflare-os-three-approval-lanes.svg
  alt: "Original diagram: an agent call in Cloudflare OS takes one of three lanes, a simulated native write that lets the agent continue, an awaitDecision write that pauses the turn while a manual decision is pending, or an MCP tool labelled readOnlyHint true that runs with no approval"
---

## Does the approve-later trick reach your MCP servers?

[Cloudflare OS](https://github.com/cloudflare/cloudflare-os) is Cloudflare's open-source agent workspace: an agent chat, AI-built personal apps called Gadgets, and a guardrail layer called Gatekeepers. It is an Apache-2.0 repository created on April 15, 2026, and it had **more than 10,000 GitHub stars** when I checked on October 4, 2026.

The README's most interesting claim is about human approval. It says that traditional human-in-the-loop setups make the human approve actions synchronously, and that Gatekeepers "implement a significant advancement in the state of the art": when an agent performs an action that requires approval, the Gatekeeper will *simulate* the outcome locally, so the agent can keep going and the user can approve or reject the queued actions later, in bulk or one by one.

That is a real design idea. An agent that stops at the first approval and waits while you get coffee is the reason people reach for auto-approve. The same README also says "Gatekeepers are like supercharged MCP servers", and Cloudflare's [launch post](https://blog.cloudflare.com/cloudflare-os/) says Cloudflare OS supports the MCP servers your organization already uses via MCP Server Portals.

For teams that bring existing MCP servers instead of writing Gatekeepers, the question is narrow:

> **When a Cloudflare OS agent calls a write tool on an MCP server, does it get the simulated, approve-later experience the README describes?**

At the pinned commit, it does not. No MCP write is simulated. Every MCP tool call that is not classified as a read is flagged `awaitDecision`, so the agent's turn pauses whenever a manual decision is pending, and a denial ends the turn. On a user-supplied MCP server, the only thing that lets a call skip approval entirely is the server's own `readOnlyHint` label. The project documents these limits in package-level files. The top-level README does not.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/references/cloudflare-os-q3-planning-workspace.png" alt="Cloudflare OS Q3 planning workspace: a chat pane describing an agent-built six-slide deck with a line reading Phillip accepted changes, next to the rendered slide deck">
  <figcaption>The README's hero image: an agent built a slide deck Gadget. The "accepted changes" line is the chat's record of a person merging a Gadget's draft changes, a different step from the external-action approvals this audit traces. Source: <a href="https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/README.md">https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/README.md</a>. Publisher/creator: cloudflare/cloudflare-os contributors. License: <a href="https://raw.githubusercontent.com/cloudflare/cloudflare-os/5cae880e5e54563895a067e7f4dae67514e581be/LICENSE">https://raw.githubusercontent.com/cloudflare/cloudflare-os/5cae880e5e54563895a067e7f4dae67514e581be/LICENSE</a>. Attribution: cloudflare/cloudflare-os contributors, docs/images/q3-planning-workspace.png, Apache License 2.0, pinned at commit 5cae880e.</figcaption>
</figure>

## Technical Analysis: What the pinned source says

I pinned the audit to commit [`5cae880e`](https://github.com/cloudflare/cloudflare-os/tree/5cae880e5e54563895a067e7f4dae67514e581be), committed on October 2, 2026. I read the README, the shared approval toolkit in `packages/gatekeeper-kit`, the shared MCP code in `packages/mcp-shared`, the two MCP Gatekeepers, the Supabase and ZoomInfo Gatekeepers, the shared Gatekeeper interface, and the parts of the backend "overseer" that decide when an agent turn stops. Then I ran one local experiment on the MCP tool classifier.

### How simulation actually works

Simulation is not a platform switch. It is a contract each Gatekeeper opts into. In the toolkit, every action definition declares a `delivery` of either `"continue-with-simulation"` or `"await-decision"`, and the kit maps `"await-decision"` onto an `awaitDecision: true` flag on the action it submits.

The machinery behind the first option is careful. Pending actions live in an action journal stored on a Durable Object KV surface. Reads replay that journal in action-id order, and the replay helper returns an explicit `"incomplete"` result when it meets an effect it cannot project, rather than pretending. Objects the agent "created" get provisional ids, and an id that has not been bound to a real provider id is refused before it can reach the provider: the error reads "has not been created yet, so it cannot be used against the provider."

Applying an approved action is at-least-once across activations unless a definition sets `claimBeforeApply`, and there is a dedicated `ActionOutcomeUnknownError` for calls that may already have taken effect. That matters because the journal lives in Durable Object storage, and a Durable Object does not stay in memory forever.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/references/durable-object-lifecycle.png" alt="Cloudflare diagram of a Durable Object lifecycle moving between active, idle, hibernated, and inactive states, including eviction after no incoming request for 70 to 140 seconds">
  <figcaption>Cloudflare's lifecycle diagram shows that a Durable Object's in-memory state is not durable: an idle object can be hibernated or evicted. That is why pending actions live in storage. The crash window between a provider call and the journal write is handled separately, by the kit's claimBeforeApply and outcome-unknown rules. Source: <a href="https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/">https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/</a>. Publisher/creator: Cloudflare Developer Documentation (cloudflare/cloudflare-docs contributors). License: <a href="https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE">https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE</a>. Attribution: Cloudflare Developer Documentation, “Lifecycle of a Durable Object” diagram, CC BY 4.0; metadata chunks removed, image otherwise unchanged.</figcaption>
</figure>

The README says every workspace is its own Durable Object, every Gadget runs in a Dynamic Worker Facet, and Gatekeepers install facets into each workspace. Facets are Cloudflare's primitive for running dynamically loaded code with its own isolated storage inside a supervising Durable Object. On the approval side, the toolkit binds each action set to one resource's journal, and that journal is written to Durable Object storage rather than kept in the agent's context.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/references/dynamic-workers-facet-architecture.png" alt="Cloudflare diagram of Durable Object facets: a Worker routes a request to a supervisor Durable Object with its own SQLite database, which loads an isolated facet with a separate SQLite database across an isolation boundary">
  <figcaption>The facet model Cloudflare OS builds on: a supervisor Durable Object loads isolated code with its own storage. Cloudflare OS's toolkit journals pending actions in Durable Object storage, per its action-journal.ts. Source: <a href="https://developers.cloudflare.com/dynamic-workers/usage/durable-object-facets/">https://developers.cloudflare.com/dynamic-workers/usage/durable-object-facets/</a>. Publisher/creator: Cloudflare Developer Documentation (cloudflare/cloudflare-docs contributors). License: <a href="https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE">https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE</a>. Attribution: Cloudflare Developer Documentation, Durable Object facets architecture diagram, CC BY 4.0; converted from SVG to PNG.</figcaption>
</figure>

The other half is that someone has to write the simulation for each API. The Notion Gatekeeper's header says its reads overlay pending actions "so a Gadget sees its own writes immediately", and notes that list simulation has documented limitations. Home Assistant ships a 399-line `simulation.ts`. Google ships a 380-line `gmail-overlay.ts` plus separate Gmail and Chat state files. GitHub overlays simulated pull-request heads. This is per-service engineering, and it is the reason the approve-later experience exists at all.

### Three write paths opt out, and MCP is one of them

I searched `packages/` at the pinned commit for the literal `awaitDecision: true`, excluding `__tests__` directories and `*.test.*` files. It appears on exactly five lines:

| Location | What it is |
|---|---|
| `gatekeeper-supabase/src/supabase.ts:952` | Mutating SQL |
| `gatekeeper-zoominfo/src/zoominfo.ts:1121` | Paid contact/company enrichment |
| `mcp-shared/src/session.ts:225` | Every non-read MCP tool call (both MCP Gatekeepers) |
| `gatekeeper-kit/src/actions.ts:732` | The kit's mapping from `delivery: "await-decision"` |
| `integration-tests/.../test-gatekeeper.ts:579` | A test fixture |

Under `packages/`, the string `"await-decision"` itself appears only in the kit's source and tests, so the three production opt-outs are the first three rows. Each says why in a comment. Supabase: "This gatekeeper doesn't simulate writes, so the agent shouldn't continue (and read back un-applied state)". ZoomInfo: "No simulation: suspend the agent until the user decides". And the shared MCP session:

```ts
// packages/mcp-shared/src/session.ts @ 5cae880e (lines 221-225)
// MCP describes no inverse operation for a tool call.
implementsRevert: false,
// Nothing about a queued call is simulated, so later reads would show a world in which it
// never happened. Wait for the decision instead.
awaitDecision: true,
```

The reasoning is sound. MCP gives a client no way to predict what a tool call will do, so there is nothing to replay. The MCP Gatekeeper's README says the same thing under "Notes and current limitations": no simulation, the agent's turn suspends until the user decides, no revert, and no scoping below tool names. The MCP Server Portals Gatekeeper says those limitations apply there too.

What changes for the user is what happens to the agent. The shared Gatekeeper interface calls `awaitDecision` "an advisory hint, not an enforcement mechanism" and says Gatekeepers that fully simulate their actions should leave it unset "so the agent keeps working seamlessly." The overseer is where the hint takes effect. Only agent turns suspend on `awaitDecision`, and only when a manual decision is pending; auto-approved actions keep running. The agent loop latches the flag when the model step that submitted the action finishes, then ends the turn and waits. A suspended turn resumes only after every awaited action in that turn is approved, and the source is blunt about the other case: "Denial leaves the turn ended."

A Gadget calling the same MCP tool is not suspended. It gets back `status: "pending"` with an action id, and the message tells an agent running code to "return from this executeCode call now so the approval can appear in chat," then call `getActionResult` after approval.

### The one MCP claim that skips approval

If a write waits, what runs without asking? In `mcp-shared/src/tools.ts`, a tool is classified as a read when, and only when, the server's annotation says `readOnlyHint === true`. A read runs immediately and is recorded as an observation. Everything else, including every unannotated tool, is queued.

The file is explicit about the trade-off. `readOnlyHint` "is honoured on both tiers", and "a tool the server mislabels runs with no approval, where an unlabelled one would have been queued." The two tiers are `byo`, which the user-supplied MCP Gatekeeper hard-codes, and `vetted`, which the MCP Server Portals Gatekeeper uses only when `MCP_PORTAL_TRUST_ANNOTATIONS` is set to `true`. A write can become eligible for auto-approval only on `vetted`, and only when the tool also declares `destructiveHint: false` and `idempotentHint: true`.

The [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) is clear on the default posture: "clients MUST consider tool annotations to be untrusted unless they come from trusted servers." Cloudflare OS knows this. The MCP Gatekeeper README calls honouring `readOnlyHint` on user-supplied endpoints "a knowing departure from that rule", says a server that labels a destructive tool `readOnlyHint: true` "gets that tool run without a prompt", and argues that refusing the hint would mean an approval prompt for every `search` and `list`. The connect form tells the user the same thing before they paste a URL. The project's own unit test asserts it: `honours readOnlyHint on any endpoint`.

### Rerun: the unmodified classifier on five synthetic tools

To check the behavior rather than the comments, I copied `tools.ts` from the pinned commit unchanged (SHA-256 `9f524462…`, identical to the clone), stubbed the three runtime imports that `classifyTool` never calls, and ran it under Node v26.5.0 against a synthetic catalog on both trust tiers:

| Tool (annotations) | `byo` mode | `byo` auto-approval eligible | `vetted` mode | `vetted` auto-approval eligible |
|---|---|---|---|---|
| `delete_repository` (`readOnlyHint: true`) | read | no | read | no |
| `list_issues` (`readOnlyHint: true`) | read | no | read | no |
| `create_issue` (none) | action | no | action | no |
| `update_label` (`destructiveHint: false`, `idempotentHint: true`) | action | no | action | **yes** |
| `string_hint` (`readOnlyHint: "true"` as a string) | action | no | action | no |

The classifier does what its comments say. The strict `=== true` checks fail closed on sloppy annotations, so the string `"true"` does not count. A write becomes eligible for auto-approval only with the deployment's vote, not just the server's. Eligibility is not approval: the backend's `autoApprovalRule` also requires that the user has enabled an auto-approve rule for that action kind on that Gatekeeper and that the workspace has not latched restricted-data mode, and the drain applies pending actions in order within each Gatekeeper, so an earlier manual gate on that same Gatekeeper holds later eligible actions. And a destructive tool that its server labels read-only is a read on both tiers, with `classifiedBy: "server-annotation"` recorded so an audit can find it later.

The project's test also states its threat model: acting on a false read-only claim "only skips a prompt for a call the server would have answered anyway." That is right for a malicious server, which can misbehave on any call, approved or not. In my reading, it is weaker for an honest server with a wrong label. That is a bug, not an attack, and an approval prompt would at least give a person a chance to catch it. This is my inference about the risk model, not something the source says.

## Key Takeaways: Pick the approval lane before you pick the integration

The README describes one approval experience. The source implements three. How the service was integrated decides whether a write can be simulated and whether it is even eligible for auto-approval; deployment trust, the user's auto-approve rules, and the pending queue then decide whether an eligible write actually pauses.

![Original diagram: an agent call in Cloudflare OS takes one of three lanes, a simulated native write that lets the agent continue, an awaitDecision write that pauses the turn while a manual decision is pending, or an MCP tool labelled readOnlyHint true that runs with no approval](/assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/cloudflare-os-three-approval-lanes.svg)

| Lane | Who gets it at `5cae880e` | Agent experience | What protects you |
|---|---|---|---|
| Simulated write | Native Gatekeepers with hand-built overlays (GitHub, Google, Notion, Home Assistant, and others) | Keeps working; reads reflect pending changes | Later approve or reject, journal, provisional-id refusal |
| `awaitDecision` write | Every non-read MCP tool call, Supabase mutating SQL, ZoomInfo enrichment | Turn pauses while a manual decision is pending; a denial ends it. Auto-approved actions do not pause | The approval prompt, or an auto-approve rule you enabled |
| Read on the server's word | MCP tools labelled `readOnlyHint: true` | Runs immediately, logged as an observation | Only the accuracy of the server's annotation |

That table turns into a short integration checklist.

1. **If approve-later is why you chose Cloudflare OS, budget for native Gatekeepers.** A service behind MCP gets the synchronous approval pattern the README criticizes whenever a human has to decide. The approve-later behavior comes from simulation code someone writes per API, as the Notion, Google, Home Assistant, and GitHub Gatekeepers show.
2. **Treat `readOnlyHint` as a permission grant, not metadata.** Before connecting an MCP server, list its tools and check every one labelled read-only. A wrong label moves a write from lane 2 to lane 3.
3. **Use the portal to remove tools, not just to route them.** Cloudflare OS's MCP Gatekeepers cannot scope a grant below tool names, so tool lists and the portal's per-tool toggles are the narrowest controls they offer. Turn off tools like file deletion if no Gadget needs them.
4. **Leave `MCP_PORTAL_TRUST_ANNOTATIONS` off unless you control the upstream servers.** It is the only switch that lets an MCP server's own hints make its writes eligible for auto-approval, which a user rule can then act on.
5. **Expect agent runs to pause on MCP writes.** A task that issues an MCP write needing a manual decision stops after that model step, and a single denial ends the turn rather than skipping that step.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/references/mcp-portal-request-flow.png" alt="Cloudflare diagram of the MCP server portal request flow: an MCP client authenticates through Cloudflare Access, the portal handles session management, tool namespacing, credential routing, server toggling and a code mode sandbox, then calls upstream servers optionally through Gateway">
  <figcaption>The MCP server portal path Cloudflare OS recommends for existing servers. The portal Gatekeeper needs upstream tools exposed directly, so the portal's enforced Code Mode is unsupported; its classification and waiting rules are the same as the user-supplied MCP Gatekeeper's. Source: <a href="https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/">https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/</a>. Publisher/creator: Cloudflare Developer Documentation (cloudflare/cloudflare-docs contributors). License: <a href="https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE">https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE</a>. Attribution: Cloudflare Developer Documentation, “MCP server portal request flow” diagram, CC BY 4.0; converted from SVG to PNG.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-04-cloudflare-os-mcp-approvals-still-wait/references/mcp-portal-manage-tools.png" alt="Cloudflare MCP portal tools panel for a cloudflare-containers server, with a toggle beside each tool including container_exec, container_file_delete, and container_file_write">
  <figcaption>Per-tool toggles in a Cloudflare MCP portal. Cloudflare OS's MCP connectors cannot scope below tool names, so removing write tools a Gadget does not need is a directly available way to narrow its tool access. Source: <a href="https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/">https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/</a>. Publisher/creator: Cloudflare Developer Documentation (cloudflare/cloudflare-docs contributors). License: <a href="https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE">https://raw.githubusercontent.com/cloudflare/cloudflare-docs/36706c5fd9c704ca10e440bab9ed0d58521577b9/LICENSE</a>. Attribution: Cloudflare Developer Documentation, MCP portal “manage tools” screenshot, CC BY 4.0; metadata chunk removed, image otherwise unchanged.</figcaption>
</figure>

This connects to two earlier audits. In [OpenHarness](/posts/openharness-permission-order-audit/), the order of permission checks decided what an operator's deny rules meant. Here, the integration path decides what "requires approval" means. If you are comparing agent gateways, read the [OpenConnector audit](/posts/open-connector-default-custody-audit/) next: it is another credential gateway for agents, where anonymous proxy calls outrank scoped tokens under the shipped defaults, and it is the next check once you know which approval lane a call takes.

### Limitations of this audit

- I did not deploy Cloudflare OS, connect a real MCP server, or watch an agent turn suspend. The suspension and resume behavior is read from `overseer.ts`, not observed.
- My rerun exercises the classifier only. It does not run the Gatekeeper Worker, the approval queue, or an MCP server.
- The five-line census is a text search at one commit. A Gatekeeper could set the flag without that literal, and later commits may change these findings.
- This is not a vulnerability report. The project documents the MCP limitations and the `readOnlyHint` trade-off in its package READMEs, connect form, and tests. The gap is between the top-level README's single description of simulation, on line 77 with no exceptions named, and where those exceptions are written down.

## 🎯 Key Takeaways

| Insight | Implication | Next step |
|---|---|---|
| Simulation is per-Gatekeeper code, not a platform default | The approve-later experience depends on how each service is integrated | Map each service you plan to connect to a lane before rollout |
| Every non-read MCP call sets `awaitDecision: true` | Agents pause on MCP writes needing a manual decision, and a denial ends the turn | Plan MCP-heavy workflows around synchronous approval |
| `readOnlyHint: true` skips approval on both trust tiers | A mislabelled destructive tool runs without a prompt | Review read-only labels and turn off unneeded tools in the portal |
| Write auto-approval needs a vetted portal, two hints, and a user rule | Servers cannot auto-approve their own writes by default | Keep `MCP_PORTAL_TRUST_ANNOTATIONS` off for servers you do not control |

## 🤔 New Questions

- Could a portal or Gatekeeper attach approval policy to specific tools, so that a read-only label from an untrusted server still prompts the first time?
- Would a generic "dry-run" convention in MCP, even a voluntary one, let a client simulate common write tools instead of suspending the turn?
- How often do real MCP servers label tools read-only incorrectly? A survey of public server manifests against their implementations would answer that.
- When one action in a suspended turn is denied, should the turn end, or should the agent get the denial and replan?

## References

**Code & Implementation (pinned at `5cae880e`):**
- [cloudflare/cloudflare-os repository](https://github.com/cloudflare/cloudflare-os/tree/5cae880e5e54563895a067e7f4dae67514e581be)
- [README.md](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/README.md)
- [gatekeeper-kit/src/actions.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-kit/src/actions.ts)
- [gatekeeper-kit/src/simulation.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-kit/src/simulation.ts)
- [gatekeeper-kit/src/action-journal.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-kit/src/action-journal.ts)
- [mcp-shared/src/session.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/mcp-shared/src/session.ts)
- [mcp-shared/src/tools.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/mcp-shared/src/tools.ts)
- [mcp-shared/__tests__/tools.test.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/mcp-shared/__tests__/tools.test.ts)
- [workshop-backend/src/overseer.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/workshop-backend/src/overseer.ts)
- [workshop-shared/src/gatekeeper.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/workshop-shared/src/gatekeeper.ts)
- [gatekeeper-mcp/src/mcp.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-mcp/src/mcp.ts)
- [gatekeeper-mcp-portal/src/config.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-mcp-portal/src/config.ts)
- [gatekeeper-supabase/src/supabase.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-supabase/src/supabase.ts)
- [gatekeeper-zoominfo/src/zoominfo.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-zoominfo/src/zoominfo.ts)
- [gatekeeper-notion/src/notion.ts](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-notion/src/notion.ts)

**Documentation:**
- [MCP Gatekeeper README](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-mcp/README.md)
- [MCP Server Portals Gatekeeper README](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-mcp-portal/README.md)
- [Supabase Gatekeeper README](https://github.com/cloudflare/cloudflare-os/blob/5cae880e5e54563895a067e7f4dae67514e581be/packages/gatekeeper-supabase/README.md)
- [MCP specification 2026-07-28: Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [MCP specification 2026-07-28: Schema reference](https://modelcontextprotocol.io/specification/2026-07-28/schema)
- [Cloudflare docs: MCP server portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)
- [Cloudflare docs: Durable Object lifecycle](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [Cloudflare docs: Durable Object facets](https://developers.cloudflare.com/dynamic-workers/usage/durable-object-facets/)

**Announcements:**
- [Cloudflare OS: an open platform for agents, apps, and work (Cloudflare blog, 2026-08-05)](https://blog.cloudflare.com/cloudflare-os/)

**Related on this site:**
- [OpenConnector Declares Its Own Defaults Out of Scope](/posts/open-connector-default-custody-audit/)
- [OpenHarness Lets Its Allow List Outrank Your Deny Rules](/posts/openharness-permission-order-audit/)
