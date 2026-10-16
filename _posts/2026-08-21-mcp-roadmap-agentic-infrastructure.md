---
title: "Choose the MCP protocol era before dropping sessions"
description: "A Source Audit separates modern MCP metadata, legacy initialization and optional dual-era behavior before applying the roadmap's stateless-server advice."
date: 2026-08-21 11:00:00 +0900
last_modified_at: 2026-10-16 19:54:06 +0900
published: true
categories: [AI, Agents]
tags: [mcp, model-context-protocol, protocol-design, agentic-workflows]
archive_developed: 2026-10-16
archive_development_note: "Re-read the MCP roadmap and modern, legacy and dual-era protocol documents; replaced a universal sessionless-server recommendation with an era-specific compatibility decision."
image:
  path: /assets/img/posts/2026-08-21-mcp-roadmap-agentic-infrastructure/protocol-era.png
  alt: "Original document comparison of legacy initialization, modern per-request metadata and optional dual-era MCP operation"
image_policy: source-first-fallback
mermaid: false
pin: false
---

## Can you remove MCP sessions without breaking older clients?

The documents do not support a universal yes. The captured MCP contract distinguishes modern requests carrying per-request metadata from legacy requests that establish a session through `initialize`. An implementation may support both. Removing the modern protocol's session machinery therefore does not answer what an integration must retain for its legacy path.

**Integration inference:** identify the protocol era before applying the archived article's stateless-server recommendation. Treat that as a compatibility decision, not as a result from a tested client/server pair. This Source Audit compares official documents read on 2026-10-16; it does not claim that any particular MCP implementation interoperated, scaled or deployed successfully.

That distinction repairs a specific overreach in the historical note. Its description said that sessions were gone, while its production advice generalized that direction into a server-design recommendation. The modern change is real in the inspected specification. Its scope, rather than its existence, is the issue.

## Modern metadata and legacy initialization are different contracts

The captured [Versioning and Compatibility page](https://modelcontextprotocol.io/specification/latest/basic/lifecycle) defines modern revisions as `2026-07-28` and later, with version, identity and capabilities carried as per-request metadata. It defines legacy revisions as `2025-11-25` and earlier, using an `initialize` handshake. Dual-era means an implementation supports both families.

Those are protocol-era definitions, not alternate names for HTTP and stdio. The same lifecycle document describes a dual-era server answering modern requests statelessly while an `initialize` request selects negotiated legacy semantics on an HTTP session or a stdio process. An explanation that reduces the change to HTTP session headers alone misses this cross-transport initialization distinction.

| Contract case | What the captured lifecycle document says | Decision inference for an integration |
|---|---|---|
| Modern request | Per-request metadata rather than an initialization handshake | Scope the sessionless claim to the modern contract |
| Legacy request | Initialization establishes negotiated legacy semantics | Do not erase the legacy requirements by citing a modern roadmap |
| Optional dual-era implementation | Modern and legacy requests select their respective semantics | Identify both supported paths before deciding which state can disappear |

The optional case matters. Dual-era support is a way to serve both families, not a requirement that every modern implementation retain every older mechanism. Conversely, the existence of modern semantics does not turn an explicitly supported legacy path into modern traffic. The compatibility question needs the implementation's declared era support, not just the date of the newest document.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-08-21-mcp-roadmap-agentic-infrastructure/protocol-era.png" alt="Original document comparison of legacy initialization, modern per-request metadata and optional dual-era MCP operation" width="1600" height="900">
  <figcaption>Original illustration by Fodev JEO editorial harness (SVG diagram, local rsvg-convert export); not source evidence.</figcaption>
</figure>

[Editable SVG diagram](/assets/img/posts/2026-08-21-mcp-roadmap-agentic-infrastructure/protocol-era.svg)

## HTTP session headers are a narrower question

The [2026-07-28 Streamable HTTP specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http) supplies the transport-specific detail. It describes one POST MCP endpoint and a server running as an independent process that can handle multiple client connections. Those statements describe the contract; they are not a load-test result.

Its backward-compatibility section explicitly contrasts earlier Streamable HTTP revisions, `2025-03-26` through `2025-11-25`, with modern semantics. The older revisions allowed session-ID assignment, standalone GET SSE streams, server-initiated JSON-RPC requests on SSE and `Last-Event-ID` resumption. Those mechanisms are absent from modern semantics. The older [2025-11-25 transport document](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) supplies the corresponding historical context.

For older-client traffic, the captured modern-only transport guidance says the server SHOULD ignore `Mcp-Session-Id` and `Last-Event-ID`; it should not mint or echo session IDs. A dual-era server's legacy path is a different case. Flattening both cases into “the server must never have a session” would turn a scoped compatibility rule into a universal design claim.

**Integration inference:** keep the protocol-era decision separate from the HTTP-mechanism decision. First establish whether the path is modern, legacy or part of an optional dual-era implementation. Then read the matching transport rules. In particular, “the standalone GET stream is absent” is narrower than an unqualified claim that all streaming has disappeared.

## Choose an era before choosing a server design

The useful output of this audit is an ordered decision, not a new architecture diagram. Start with which client eras the intended integration must support. If only modern traffic is in scope, the modern contract is the relevant boundary. If a legacy path remains in scope, inspect its initialization and session requirements rather than importing the modern-only answer into it.

For a dual-era implementation, write the two cases separately. “Modern requests use per-request metadata” and “initialization selects legacy semantics” can both be true. A design description that keeps only the first sentence has not described the supported compatibility surface completely.

| Before changing the server | What to establish from the documents | What remains unverified here |
|---|---|---|
| Remove initialization handling | Which protocol era the intended path speaks | Whether a particular implementation handles that path correctly |
| Remove HTTP session and resume behavior | Whether the path follows modern-only or negotiated legacy semantics | Behavior of the actual client/server combination |
| Make a stateless-server recommendation | Whether the recommendation is explicitly modern-scoped or must account for legacy support | Deployment, scaling and application-state consequences |

These are **integration inferences**, not a claim that the specification has proved the resulting design safe. A single POST endpoint does not supply the missing execution evidence. Nor does a document-defined dual-era path demonstrate that a particular library implements it. Keep the contract selection and the interoperability result as separate records.

For another version-source boundary, [the Unity MCP release-note drift audit](/posts/unity-mcp-release-notes-drift-audit/) examines why released artifacts and documentation version strings need separate checking. For a different MCP boundary, [the Cloudflare OS approval audit](/posts/cloudflare-os-mcp-approvals-still-wait/) separates an approval simulation from the authority to execute an MCP write. Neither comparison supplies a transport compatibility test for this article.

## What changed since the August roadmap note

The roadmap is still context, but it is no longer the article's organizing argument. The captured [roadmap post](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/blog/content/posts/2026-08-22-mcp-roadmap.md) and [maintained roadmap](https://modelcontextprotocol.io/development/roadmap) describe direction for the next specification release and beyond. They identify agentic messaging primitives, HTTP-native transport unification and hardening, agent identity and enterprise-ready security, improved primitives, and SDK developer experience. Priorities may shift or be deferred.

A list of those areas cannot establish that every proposal shipped, or that one server design fits every supported protocol era. The revised article therefore uses the roadmap to identify the question, then uses the captured transport and lifecycle contracts to constrain the answer. The contribution is the compatibility decision missing from the old universal recommendation, not the discovery that MCP has a roadmap.

There is also a chronology limit. This historical URL retains its original 2026-08-21 publication date, while the captured roadmap blog item is dated 2026-08-22. The October re-read does not establish contemporaneous access or explain that discrepancy. The rebuild note records the current analysis without inventing a story about what was available when the old note was written.

## What the documents do not establish

The evidence here is normative documentation, not observed implementation. No MCP client/server pair, conformance suite, provider call, deployment, scaling exercise or security test was run. The decision framework is useful for narrowing what must be checked; it is not evidence that the resulting integration already passed those checks.

The source set also has boundaries. The `latest` lifecycle and changelog captures identify the `2026-07-28` revision at retrieval. They should not be read as a promise that a moving `latest` URL will always resolve to the same text. Draft pages and accepted proposal histories provide context, not independent proof of a released implementation. Two failed source captures were excluded rather than treated as supporting documents.

The next engineering question is consequently concrete: which era does the actual client/server path implement, and what evidence supports that behavior? Until that evidence exists, “modern protocol sessions are absent” and “this deployment is ready to remove compatibility state” remain different statements.

## Key Takeaways

- The captured lifecycle contract distinguishes modern per-request metadata, legacy initialization and optional dual-era support; that distinction is not merely HTTP versus stdio.
- HTTP session IDs, standalone GET streams and resume headers need their own version-scoped reading. Modern-only guidance is not a universal description of a dual-era legacy path.
- The original contribution is an era-first compatibility decision. It does not claim tested interoperability, stateless application behavior or a deployment result.

## New Questions

- Which protocol eras must the intended integration actually support?
- If it is dual-era, what evidence covers the modern path and the negotiated legacy path separately?
- What client/server execution would establish the compatibility result that these documents alone cannot supply?

## References

All sources below were read on 2026-10-16. Versioned transport links identify the inspected protocol revision. The roadmap repository link was captured from `main` at retrieval, not pinned to an immutable commit; `latest` and roadmap URLs are moving documents, not frozen implementation evidence.

### Version and transport contracts

- [Versioning and Compatibility, latest capture identifying 2026-07-28](https://modelcontextprotocol.io/specification/latest/basic/lifecycle)
- [Streamable HTTP, version 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
- [Earlier transport contract, version 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Changelog, latest capture identifying 2026-07-28](https://modelcontextprotocol.io/specification/latest/changelog)

### Roadmap and proposal context

- [Roadmap blog source, dated 2026-08-22](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/blog/content/posts/2026-08-22-mcp-roadmap.md)
- [Maintained MCP roadmap](https://modelcontextprotocol.io/development/roadmap)
- [SEP-2575, stateless MCP proposal history](https://modelcontextprotocol.io/seps/2575-stateless-mcp)
- [SEP-2567, sessionless MCP proposal history](https://modelcontextprotocol.io/seps/2567-sessionless-mcp)
