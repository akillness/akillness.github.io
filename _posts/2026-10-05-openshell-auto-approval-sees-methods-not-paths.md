---
title: "OpenShell's auto-approval sees new methods, not wider paths"
description: "Source Audit of NVIDIA OpenShell at 71c3cd95: the gateway's risk check keys findings by HTTP method, so a credentialed PUT widened to /repos/** adds no prover finding."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, trust-boundaries, sandboxing, open-source]
date: 2026-10-05 00:15:05 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-10-05-openshell-auto-approval-sees-methods-not-paths/openshell-two-checks-two-granularities.svg
  alt: "Original diagram: a hypothetical existing rule allows PUT on one docs folder and an agent proposes PUT on /repos/**; read from source at 71c3cd95 and not executed, the gateway proposal risk check keys findings by binary, host, port, category and method, so it reports no new findings; the standalone boundary check, run on the released 0.1.2 binary, compares method and path and reports exceeds_boundary with the counterexample PUT /repos/a"
---

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; I read the pinned source and ran the released openshell-prover binary locally, but I did not run an OpenShell gateway or watch a proposal get auto-approved.

## 🤔 Curiosity: What does "risky new access" mean to the approval gate?

[OpenShell](https://github.com/NVIDIA/OpenShell) is NVIDIA's runtime for running autonomous agents inside policy-controlled sandboxes. It is an Apache-2.0 repository created on February 24, 2026, and it had **more than 14,000 GitHub stars** when I checked on October 5, 2026.

Its README makes two promises. The first is kernel-level enforcement. The second is the one I wanted to test: "Before a policy change is approved, OpenShell uses formal verification to flag risky new access it would grant, such as reaching a new host with credentials or calling a new API method, so those changes wait for human review."

That matters most in one feature, the policy advisor. When the sandbox blocks a request, the agent can propose the network rule it needs. By default, every proposal waits for a person. An operator can switch on `proposal_approval_mode=auto`, and then OpenShell approves a proposal by itself when its risk checks find nothing to flag.

The advisor docs also tell agents how to behave: "A good proposal allows one method on the narrowest path the task needs". The example lets `/usr/bin/gh` send `PUT` to `/repos/NVIDIA/OpenShell/contents/docs/**` on `api.github.com`.

So here is the narrow question:

> **If a sandbox already holds that narrow, credentialed `PUT`, and the agent then proposes `PUT /repos/**`, do the risk checks that gate auto-approval notice that the path got wider?**

At the pinned commit, my reading of the code says they do not. The gateway's proposal risk check keys every finding by binary, host, port, category, and HTTP method. The request path is not part of the key, so the wider rule produces exactly the same keys as the narrow one, the verdict is `prover: no new findings`, and nothing about `api.github.com:443` raises a security flag. In that scenario both risk gates pass. Whether the proposal is then approved still depends on the gateway's other, non-risk conditions, which I list below, and I did not run a gateway to watch it happen. OpenShell also ships a second check, a standalone boundary prover, that does compare paths. When I ran the released binary, it rejected the widened policy with the counterexample `PUT /repos/a`. In my search of the pinned source, no gateway code calls that boundary check.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-05-openshell-auto-approval-sees-methods-not-paths/references/openshell-system-architecture.png" alt="OpenShell system architecture diagram: the gateway control plane with API server, policy prover, durable state and compute driver; the supervisor between a network-isolated sandbox and external services; and a policy lifecycle row where the agent proposes via policy.local, the gateway prover flags risky new access, you approve manually by default or auto when no new risk is found, and policy reloads">
  <figcaption>OpenShell's own architecture diagram. The bottom row is the loop this audit follows: the agent proposes, the gateway prover checks, and approval is manual by default or automatic when no new risk is found. Source: <a href="https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/about/architecture.mdx">https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/about/architecture.mdx</a>. Publisher/creator: NVIDIA Corporation and OpenShell contributors. License: <a href="https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE">https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE</a>. Attribution: NVIDIA/OpenShell, docs/images/openshell-system-architecture.svg, Apache License 2.0, pinned at commit 71c3cd95; converted from SVG to PNG.</figcaption>
</figure>

## 📚 Retrieve: What the pinned source says

I pinned the audit to commit [`71c3cd95`](https://github.com/NVIDIA/OpenShell/tree/71c3cd957abef062eb7f37010056717cd49f2ed3), committed on October 3, 2026. I read the README, the architecture, advisor, and prover docs, the prover crate's credential-safety queries, and the gateway code that evaluates proposals and auto-approves them. Then I ran the released `openshell-prover` 0.1.2 binary on three small policies.

### Why a path is a permission here

OpenShell's sandbox has one way out. The architecture docs say the supervisor channel is the workload's only allowed egress path, and the supervisor "checks requests against policy, supplies credentials, resolves DNS, opens approved connections." Providers hold the real secrets, and "the supervisor hands that credential out only where policy allows it."

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-05-openshell-auto-approval-sees-methods-not-paths/references/openshell-sandbox-enforcement.png" alt="OpenShell sandbox enforcement flow: the agent's request leaves the network-isolated sandbox only over the Sandbox Protocol to the trusted supervisor, where the isolation backend verifies the boundary and policy enforcement checks destination, binary, L7 rules and credentials before the upstream service">
  <figcaption>The enforcement path: every request leaves the sandbox through the supervisor, which checks destination, binary, L7 rules, and credentials. For a REST endpoint, the L7 rules are method-and-path rules. Source: <a href="https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/about/architecture.mdx">https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/about/architecture.mdx</a>. Publisher/creator: NVIDIA Corporation and OpenShell contributors. License: <a href="https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE">https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE</a>. Attribution: NVIDIA/OpenShell, docs/images/openshell-sandbox-enforcement.svg, Apache License 2.0, pinned at commit 71c3cd95; converted from SVG to PNG.</figcaption>
</figure>

So for a REST endpoint with a provider credential, the allowed path is the scope of what the agent can do with that credential. `PUT` on one docs folder and `PUT` on every repository path the token can write are very different grants, even though the method is the same.

Two more facts make the wider rule effective once it is approved. An approved proposal is added "as a separate rule," and "if another rule covers the same host and port, a request is allowed when either rule allows it, and deny rules in either rule still apply." OpenShell also refuses a proposal that disagrees with an overlapping endpoint on a single-valued setting such as `tls` or `allowed_ips`. My worked example has no deny rule and no conflicting setting. The policy merge code says the same thing from the other side: for two non-MCP endpoints, "the broader one authorizing what the narrower one covers is the documented behaviour and stays supported."

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-05-openshell-auto-approval-sees-methods-not-paths/references/openshell-sandbox-protocol.png" alt="OpenShell Sandbox Protocol diagram: a trusted supervisor responsible for policy evaluation, credential injection, DNS resolution and upstream connections, linked to the network-isolated sandbox by one mutually authenticated HTTP/2 connection carrying control, DNS and per-connection TCP streams">
  <figcaption>The Sandbox Protocol puts credential injection on the supervisor side. The agent never holds the token; the supervisor attaches it to requests that policy allows, which is why the allowed path decides what the credential can be used for. Source: <a href="https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/about/architecture.mdx">https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/about/architecture.mdx</a>. Publisher/creator: NVIDIA Corporation and OpenShell contributors. License: <a href="https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE">https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE</a>. Attribution: NVIDIA/OpenShell, docs/images/openshell-sandbox-protocol.svg, Apache License 2.0, pinned at commit 71c3cd95; converted from SVG to PNG.</figcaption>
</figure>

### What the proposal risk check looks at

The advisor docs list four findings. Two of them are about credentials. `credential_reach_expansion` means a binary can "use a provider credential at a host and port that it could not reach before." `capability_expansion` means it can "use a new HTTP method at a host and port where it already uses a provider credential."

The docs are precise, and so is the code. In the prover crate, `capability_expansion` is defined as "on a (binary, host, port) that already had credentialed reach, a new HTTP method was added." The query loop in `queries.rs` emits one capability path per allowed method. The struct that carries a finding path has fields for the binary, host, port, mechanism, policy name, category, and method. It has no field for a request path.

The method list comes from `allowed_methods()` in the prover's `policy.rs`. For an endpoint with explicit rules, it loops over the rules and collects `r.method`. The rule's path is not read there.

Then the gateway decides what is *new*. In `crates/openshell-server/src/grpc/policy.rs`, `finding_path_key` builds this string:

```rust
format!(
    "exfil|{}|{}:{}|{}|{}",
    p.binary, p.endpoint_host, p.endpoint_port, p.category, p.method
)
```

It deliberately leaves out the policy name, and its comment states the intent: "adding a new method on an already-reached host surfaces as a new path; reuse of an existing method does not." `finding_delta` keeps only keys that the current policy did not already produce. If none are left, the verdict is the literal string `prover: no new findings`.

### What auto-approval requires

`auto_approve_chunk` has two risk gates. The verdict must equal `prover: no new findings`, and the proposal's security notes must be empty. It also has conditions that are not about risk: it bails out while a global policy is active, it only approves a chunk that is still pending, it re-evaluates the proposal against current inputs, and it must merge the rule with validation against provider layers and credential bindings. If evaluation or the merge fails for a still-pending proposal, it is left unapproved and pending; a chunk that is no longer pending is simply skipped. `generate_security_notes` looks at the host, IP literals, wildcard hosts, `allowed_ips`, ports above 49152, a list of database ports, and the flag that allows credentials on uninspected traffic. In my reading of that function, no rule path is read.

Put those pieces together for one bounded scenario: an agent-authored proposal, auto mode on, no active global policy, and an effective policy with no deny rule or conflicting endpoint setting on that host.

- The current policy gives `/usr/bin/curl` credentialed `PUT` on `api.github.com:443`. Its keys end in `…|credential_reach_expansion|` and `…|capability_expansion|PUT`.
- The proposal adds `PUT /repos/**` for the same binary on the same host and port. Its keys are identical, because the path is not in the key and the policy name is excluded on purpose.
- The delta is empty and `api.github.com:443` triggers no security note, so both risk gates pass. If the remaining merge and validation steps succeed, as I would expect for a plain REST allow rule, the proposal is approved without review.

This is an inference from the code, not an observed run. I did not start a gateway. The pieces it rests on are each read directly at the pinned commit, and the same key format and the same `prover: no new findings` comparison are in the [v0.1.2 release](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.2) source, tagged at commit `6648bd0c`.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-05-openshell-auto-approval-sees-methods-not-paths/references/openshell-terminal.jpg" alt="OpenShell terminal UI showing logs for a sandbox named ollama-sandbox, including L7_REQUEST lines that record l7_action methods such as POST and GET, l7_target request paths, and l7_decision=allow for api.anthropic.com">
  <figcaption>OpenShell's terminal UI screenshot, showing a sandbox from March 2026. Its example log lines record inspected HTTP requests with both a method (<code>l7_action</code>) and a path (<code>l7_target</code>); the REST policy rules themselves are method-and-path rules. Source: <a href="https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/fern/assets/images/openshell-terminal.png">https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/fern/assets/images/openshell-terminal.png</a>. Publisher/creator: NVIDIA Corporation and OpenShell contributors. License: <a href="https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE">https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE</a>. Attribution: NVIDIA/OpenShell, fern/assets/images/openshell-terminal.png, Apache License 2.0, pinned at commit 71c3cd95; file extension changed to .jpg, image unchanged.</figcaption>
</figure>

### The other prover does see paths

OpenShell has a second use for its prover, the boundary check. Its docs say it "compares method and path allow and deny rules on endpoints with `protocol: rest`." It is a standalone CLI that "remains independent of the gateway at runtime," and it "does not apply or approve policies."

I wanted to see that difference run, not just read it. I downloaded the `openshell-prover` 0.1.2 macOS arm64 release. Its tarball SHA-256 matched the checksums file published with the release. I wrote three policies:

- `base.yaml`: `/usr/bin/curl` may `PUT` to `/repos/NVIDIA/OpenShell/contents/docs/**` on `api.github.com:443`, REST, enforced. This is the docs example with `curl` in place of `gh`.
- `widened.yaml`: the base plus a second rule allowing `PUT /repos/**` for the same binary and host.
- `new-method.yaml`: the base plus a rule allowing `DELETE` on the same docs folder.

Then I checked each one against `base.yaml` as the boundary:

| Change against the base | Boundary check, released 0.1.2 binary (ran) | Proposal risk check key delta (read from code, not run) |
|---|---|---|
| None (base against itself) | `within_boundary`, exit 0 | Not applicable |
| Add `PUT /repos/**` | `exceeds_boundary`, exit 1, counterexample `method=PUT path=/repos/a` | No new key: same binary, host, port, and method |
| Add `DELETE` on the docs folder | `exceeds_boundary`, exit 1, counterexample `method=DELETE path=/repos/NVIDIA/OpenShell/contents/docs/a` | New `…|capability_expansion|DELETE` key, a finding |

The new-method row is the control. By my reading, the risk check flags a new method, and the boundary check I ran did too. Only the boundary check catches a wider path with an old method.

The boundary check is the one that understands this case. I searched the full checkout at the pinned commit for `check_within_boundary` and `within_boundary` in Rust, Python, TypeScript, and Go files. Outside the `openshell-prover` and `openshell-prover-cli` crates there were zero matches. The architecture page describes the split honestly: the prover "runs in the gateway" to check proposals, and "also ships as the standalone `openshell-prover` command for checking a policy against a boundary in CI."

### What the project already says about this

This is not a hidden weakness, and the docs do not overclaim. The README's examples, "reaching a new host with credentials or calling a new API method," match the two credential findings exactly. The auto-approval section warns that the checks "do not treat access to a new public host as a risk when no provider credential applies there," and tells operators to turn auto mode on "only if you accept" that. The prover docs say a passing boundary result does not mean "that the policy is as narrow as it could be."

NVIDIA's own governance interceptor example goes further. It denies `SubmitPolicyAnalysis` requests that contain proposals, "so a sandbox cannot use the gateway's optional auto-approval path to widen its governed policy." The example notes that "this rule belongs to the example." The accepted [RFC 0002](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/rfc/0002-agent-driven-policy-management/README.md) recommended that first-release automatic apply run "only when prover, validation, and org ceiling checks succeed without ambiguity." In my reading, the shipped gateway runs the prover's risk check and validation, while the policy-containment check I compared here, the boundary check, stays outside the gateway.

What I did not find in the README, the advisor, prover, and architecture docs, the governance example, or RFC 0002 is the specific consequence: the risk check is method-granular while REST rules are path-granular, so the docs' own advice to propose "the narrowest path" is advice the auto gate does not verify.

## 💡 Innovation: Treat auto mode as method-level trust

The finding reduces to one sentence for operators: **with auto mode on, widening only the path of a credentialed method the agent already holds, on the same binary, host, and port, adds no prover finding. On an unflagged destination like `api.github.com:443` it then passes both risk gates, and approval rests on the remaining state, policy, and validated-merge conditions.** That is my reading of the code, not an observed run. How much that matters depends on what the credential itself is allowed to do upstream; the sandbox policy is only the inner fence.

Here is what I would do with that, in order.

1. **Keep `proposal_approval_mode` at `manual` for any sandbox with REST credentials.** It is the default. Set it gateway-wide, because the docs say "a gateway-wide value overrides sandbox values," and review the rule that `openshell rule get` shows, not the agent's description of it.
2. **If you need auto mode, put the boundary check in front of it.** `SubmitPolicyAnalysis` is on the gateway's interceptable-method allowlist, and a validate-phase interceptor runs before the gateway handles the request. An interceptor could compose the effective policy with the proposed rule and run the prover's boundary check against an operator-owned ceiling, rejecting anything that returns other than `within_boundary`. That is my design suggestion. I have not built or run it, and the prover docs say the boundary check needs "the complete effective policy as it would be after the change."
3. **Run the boundary check on live policy anyway.** The documented recipe is `openshell sandbox get my-sandbox --policy-only > candidate.yaml` followed by `openshell-prover check candidate.yaml --boundary boundary.yaml`. Run on a schedule, it catches a rule that was approved by any path, including auto mode, as soon as the policy exceeds the ceiling.
4. **Treat every boundary result except `within_boundary` as a failure.** The prover docs say exactly that, and they list REST shapes that return `unsupported`, such as rules that match query parameters or use `?` or bracket expressions in paths.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-05-openshell-auto-approval-sees-methods-not-paths/references/openshell-extension-points.png" alt="OpenShell extension points diagram: on the data plane the agent reaches the supervisor through the isolation backend and middleware before models and APIs; on the control plane you reach the gateway through interceptors that modify, validate and observe, and drivers connect the gateway to runtimes and secret stores">
  <figcaption>OpenShell's extension points. The control-plane interceptor slot, with its validate role, is where an operator can add a path-aware check before a proposal reaches the gateway's own approval logic. Source: <a href="https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/extensibility/overview.mdx">https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/docs/extensibility/overview.mdx</a>. Publisher/creator: NVIDIA Corporation and OpenShell contributors. License: <a href="https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE">https://raw.githubusercontent.com/NVIDIA/OpenShell/71c3cd957abef062eb7f37010056717cd49f2ed3/LICENSE</a>. Attribution: NVIDIA/OpenShell, docs/images/openshell-extension-points.svg, Apache License 2.0, pinned at commit 71c3cd95; converted from SVG to PNG.</figcaption>
</figure>

For the project itself, two small changes would close the gap I traced. One is to make the risk check path-aware for credentialed REST endpoints, for example by recording a path pattern in the capability key, so that a wider pattern for an existing method surfaces as new. The other is to let auto mode consult an operator boundary, which is roughly what the RFC called an org ceiling. Both are my suggestions, not plans I found in the repository.

This is the same lesson as other agent gates audited on this blog: the gate's unit of inspection decides what "approved" means. In [OpenHarness](/posts/openharness-permission-order-audit/), the order of permission checks decided what an operator's deny rules meant. If you are comparing agent platforms, read the [Cloudflare OS approval audit](/posts/cloudflare-os-mcp-approvals-still-wait/) next: it traces another agent platform's approval gate, where how an action is integrated decides whether it pauses for a human, so you can compare what each gate actually inspects. The [OpenConnector audit](/posts/open-connector-default-custody-audit/) covers the credential-gateway side of the same problem.

### Limitations of this audit

- I did not run an OpenShell gateway or a sandbox. The auto-approval outcome for the widened rule is inferred from code read at the pinned commit, not observed.
- The boundary runs used the released 0.1.2 binary, not a build of the pinned commit. I checked that the gateway's key format and approval comparison are the same at the v0.1.2 tag.
- My search for boundary-check callers covered four file types at one commit. A later commit, or an out-of-tree interceptor, could wire it in.
- This is not a vulnerability report. Auto mode is opt-in, the advisor is off by default, the docs define `capability_expansion` exactly as a new HTTP method, and a person reviewing in manual mode sees the full rule.

## 🎯 Key Takeaways

| Insight | Implication | Next step |
|---|---|---|
| The gateway keys proposal findings by binary, host, port, category, and method | A wider path for an existing credentialed method on the same binary, host, and port adds no prover finding | Treat auto mode as method-level trust, not path-level trust |
| Auto-approval's risk gates are `prover: no new findings` and empty security notes, and neither reads paths | In my code reading, same-method path widening on an unflagged destination such as `api.github.com:443` passes both risk gates; approval then rests on state, policy, and validated-merge conditions | Keep `proposal_approval_mode` at `manual` gateway-wide where REST credentials exist |
| The released boundary check rejected `PUT /repos/**` with counterexample `PUT /repos/a` | The project already has a path-aware check | Run it in CI and on live sandbox policy against an exact-path ceiling |
| In a search of the pinned source, no gateway code calls the boundary check | The two provers answer different questions | Add a validate interceptor on `SubmitPolicyAnalysis` if you need auto mode |

## 🤔 New Questions

- Should a credentialed capability key include a normalized path pattern, and how would that interact with the REST shapes the boundary check already returns `unsupported` for, such as `?` or bracket expressions?
- Could the gateway accept an operator boundary file and run the boundary check before any automatic approval, as RFC 0002's "org ceiling" suggests?
- How often do real agents propose a wider path after a narrow one was approved? The advisor's logs record `CONFIG:APPROVED` with `auto:true`, so a fleet could measure it.
- Should the agent-facing guide tell agents that a wider path for an existing method will not be flagged, or would that only teach them to ask for more?

## References

**Code & Implementation (pinned at `71c3cd95`):**
- [NVIDIA/OpenShell repository](https://github.com/NVIDIA/OpenShell/tree/71c3cd957abef062eb7f37010056717cd49f2ed3)
- [README.md](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/README.md)
- [openshell-server/src/grpc/policy.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-server/src/grpc/policy.rs)
- [openshell-prover/src/queries.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-prover/src/queries.rs)
- [openshell-prover/src/finding.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-prover/src/finding.rs)
- [openshell-prover/src/policy.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-prover/src/policy.rs)
- [openshell-prover/src/containment.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-prover/src/containment.rs)
- [openshell-policy/src/merge.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-policy/src/merge.rs)
- [openshell-gateway-interceptors/src/routes.rs](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/crates/openshell-gateway-interceptors/src/routes.rs)
- [examples/governance-interceptor/README.md](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/examples/governance-interceptor/README.md)
- [openshell-server/src/grpc/policy.rs at v0.1.2](https://github.com/NVIDIA/OpenShell/blob/v0.1.2/crates/openshell-server/src/grpc/policy.rs)
- [OpenShell v0.1.2 release, including the standalone prover](https://github.com/NVIDIA/OpenShell/releases/tag/v0.1.2)

**Documentation:**
- [Policy Advisor](https://docs.nvidia.com/openshell/latest/how-it-works/policies/advisor)
- [Policy Prover](https://docs.nvidia.com/openshell/latest/how-it-works/policies/prover)
- [Architecture](https://docs.nvidia.com/openshell/latest/about/architecture)
- [Gateway Interceptors](https://docs.nvidia.com/openshell/latest/extensibility/gateway-interceptors)
- [RFC 0002: Agent-Driven Policy Management](https://github.com/NVIDIA/OpenShell/blob/71c3cd957abef062eb7f37010056717cd49f2ed3/rfc/0002-agent-driven-policy-management/README.md)
