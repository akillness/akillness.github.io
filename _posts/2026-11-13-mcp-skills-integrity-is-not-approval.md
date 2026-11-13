---
title: "MCP Skill Verification Is Not Approval"
description: "A source audit of SkillsClient 2.4.0 separates file integrity, dynamic skills, server identity and host approval."
categories: [AI, Agents]
tags: [mcp, security, agents, typescript-sdk]
date: 2026-11-13 21:50:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-11-13-mcp-skills-integrity-is-not-approval/cover.png
  alt: "AI-generated illustration of a card, a sealed folder and a closed gate on a dark background."
image_policy: source-first-fallback
---

An agent discovers a remote skill. Its files match their advertised SHA-256 digests. Is the skill now safe to load?

No: the hash establishes a narrower fact. It checks that retrieved bytes match an entry supplied by the server; it does not establish that the server or its instructions deserve trust. This distinction matters because an MCP skill can contain instructions that a host may later put into model context. The interesting engineering work sits between receiving a consistent file and deciding whether to act on it.

This Source Audit reads the MCP Skills extension alongside the TypeScript SDK 2.4.0 client implementation and upstream tests. It is a code-and-specification comparison, not a claim that a particular host is vulnerable or that an integration was run in production. [C-RELEASE] [C-CLIENT] [C-SEP]

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-11-13-mcp-skills-integrity-is-not-approval/cover.png" alt="AI-generated illustration of a card, a sealed folder and a closed gate on a dark background." width="1672" height="941">
  <figcaption>AI-generated illustration by god-tibo-imagen: a card, sealed folder and separate gate symbolize the distinction between an advertised manifest and host approval; not source evidence.</figcaption>
</figure>

## What does the client actually verify?

The 2.4.0 release introduces `SkillsClient` as part of Skills over MCP. In the pinned implementation, a `Skill` entry may describe its files with a list of resource URIs, sizes and digests. The client's `read` method resolves the requested reference against the skill root. For a manifest-backed entry, it first finds the file in that list; an unlisted reference is refused before a resource request is sent. [C-RELEASE] [C-CLIENT]

When a listed file is read, the implementation compares the returned bytes with the listed size and SHA-256 digest. For the skill's own `SKILL.md`, it also parses the frontmatter and compares it with the entry's frontmatter. The returned `SkillFile` has a `verified` flag, which is true when the file had a corresponding listed resource and the checks completed successfully. [C-CLIENT]

Those checks address an important mismatch: the host may make a decision from a listing and fetch the actual instructions later. The file must still agree with the entry it retained. The check also applies to supporting files, so a reference that was not in the approved file set should not silently become part of that set. This is an interpretation of the extension's stated integrity rules, not a claim that every host implements them. [C-SEP]

| Situation | What the pinned client does | What this does not prove |
|---|---|---|
| Listed file matches size and digest | Returns bytes after checks; `verified` is true | The origin or the instruction content is trustworthy |
| Listed file has a size or digest mismatch | Raises a verification error | Whether the mismatch was malicious, stale or accidental |
| Manifest-backed file is not listed | Refuses the reference before the resource request | That the server has no other resources |
| `SKILL.md` frontmatter differs from the entry | Raises a frontmatter verification error | That matching frontmatter is safe to obey |
| Entry says `resources: "dynamic"` | Skips listed-file, size and digest checks; returns `verified: false` | That dynamic content is malicious, or that a host may silently treat it as content-bound |

The table describes this specific SDK source, not a compatibility promise for every MCP implementation. The upstream tests include explicit cases for unlisted references, changed bytes, dynamic skills and cached responses. I inspected those tests; I did **not** run them locally for this article. [C-CLIENT] [C-TESTS]

## Why a matching digest is not an origin check

A SHA-256 match answers: “Are these the bytes represented by this digest?” It does not answer: “Who is authorized to publish these instructions?” The final extension proposal makes the crucial qualification explicit: the server supplies both content and unsigned digests. An intermediary able to change both can make them agree. The proposal therefore says a digest match is not itself a security boundary. [C-SEP]

Consider two hypothetical cases. In the first, a server publishes a manifest, then the stored file changes accidentally. The retained digest can expose the mismatch. In the second, a malicious server publishes both a harmful instruction file and its matching digest. The integrity check can pass because there is no inconsistency to detect. These are conceptual examples, not incidents or experimental results.

The consequence is not “hashes are useless.” The consequence is to preserve the boundary they actually enforce. Use digest verification to bind a later read to an advertised file set; use a separate origin and approval policy to decide whether that file set may become an instruction source. A visible green `verified` indicator should not be labeled “trusted” unless the host has established additional facts.

## Dynamic skills change the evidence available

The pinned client's type and implementation explicitly distinguish entries whose `resources` value is `"dynamic"`. They have no enumerated file list to compare against. For those entries `read` still checks that references stay within the skill and compares the skill's own frontmatter with the entry, but it skips listed-file membership, size and digest checks and reports `verified: false`. [C-CLIENT]

That is not automatically a defect: dynamic content can have legitimate uses. It is a materially different basis for approval. The final SEP says such content has no content integrity and cannot be content-bound in the same way as an enumerated manifest. A host can decline it or apply a deliberately different policy; it should not present `verified: false` as if the manifest-backed checks had succeeded. [C-SEP]

There is a second subtle point in the source. If a file came from the client's response cache and a verification check fails, `read` fetches it once more with a refresh. If the response came from the server rather than the cache, the same verification error is thrown without that cache-recovery retry. This is cache handling, not a second independent source of truth. The upstream tests assert both paths, but they are not evidence of a live service's behavior. [C-CLIENT] [C-TESTS]

## Where does approval belong?

The `SkillsClient` source documents its own scope: it lists, gets and reads skills and checks files, while **approval, origin tagging and loading policy stay with the host**. The current extension overview likewise distinguishes reading a resource from activating a skill: host skill-loading logic handles verification and any required approval before instructions enter model context. [C-CLIENT] [C-SPEC]

A host design therefore needs to track more than a skill name. The overview identifies a skill by its originating server and URI together; a name is only a label. Two servers can publish skills with the same label or URI without those skills becoming the same origin. A registry, cache or approval record keyed only by the name risks conflating distinct sources. [C-SPEC] [C-SEP]

A practical design checklist follows from those boundaries:

1. **Keep origin with identity.** Associate the host's server identity with the skill URI in listings, caches and approvals. Do not let a same-named remote skill silently replace another origin.
2. **Bind persisted approval to the complete manifest.** The current overview says persisted approval binds to the full set of file URIs and digests; an added, removed or changed file revokes it and requires approval again before loading or execution. [C-SPEC]
3. **Verify on use.** Resolve the requested file against the retained entry and check its bytes before using it. Treat an unlisted file or changed bytes as a reason to stop, not as a cosmetic warning.
4. **Make dynamic content explicit.** `verified: false` is useful information. The overview says persisted approval must not be treated as covering arbitrary future dynamic content. A host may decline dynamic skills. [C-SPEC]
5. **Separate reading, loading and execution.** General loading approval depends on host policy; host-side code execution and permission grants such as `allowed-tools` require explicit per-skill user approval. Activating a nested skill requires fresh user consent; reading its `SKILL.md` as supporting content does not activate it. [C-SPEC]
6. **Keep cross-server access explicit.** The overview requires per-call approval naming both servers for cross-server reads. [C-SPEC]

This checklist is an operational synthesis of the cited sources, not a substitute for the complete extension specification. It does not specify a UI, authenticate a server, or grant permission to execute scripts. Whether an implementation meets its security requirements still depends on the host's actual trust and permission model.

For a related example of an MCP safety property depending on how software is assembled, see [MCP security depends on transport construction](/posts/mcp-security-depends-on-transport-construction/). For a different contract boundary between declared schemas and client behavior, see [MCP isError results meet different client checks](/posts/mcp-iserror-output-schema-contract/).

## Scope and version limits

The implementation observations above are pinned to TypeScript SDK tag `v2.4.0`, commit `951fe5603a7ec0b2dcb6a0b95d92cd86f93ad9e5`. The release notes describe the server-side `attach` API as experimental; that qualifier should not be generalized into a claim that every other API has the same stability status. [C-RELEASE]

The final SEP is a historical design record and directs readers to the current specification for authoritative requirements. The current extension overview was read on 13 November 2026 and may evolve. No runtime benchmark, host integration, production deployment, threat-model validation or independent test execution is claimed here. [C-SEP] [C-SPEC]

## Key Takeaways

- A manifest-backed `SkillsClient.read` checks the requested file against the server's listed size and digest; `SKILL.md` receives a frontmatter comparison too.
- A consistent server-provided digest does not authenticate the origin or make instructions safe to obey.
- Dynamic entries return `verified: false` in the pinned client because the file-list, size and digest checks are unavailable.
- Origin identity, user approval and the decision to load instructions remain host responsibilities.

## New Questions

- How should a host explain a changed file set to a user without reducing approval to a meaningless hash?
- Which dynamic-skill use cases justify allowing unverifiable content, and what additional controls fit each case?
- How can a host preserve the originating server's identity across caches, model-facing paths and audit logs?

## References

**Extension specification**

- **C-SPEC:** [MCP Skills extension overview](https://modelcontextprotocol.io/extensions/skills/overview), read 13 November 2026.
- **C-SEP:** [SEP-2640: Skills Extension](https://modelcontextprotocol.io/seps/2640-skills-extension), final historical record, read 13 November 2026.

**Implementation and tests**

- **C-RELEASE:** [TypeScript SDK 2.4.0 release notes](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/v2.4.0).
- **C-CLIENT:** [SkillsClient source, pinned commit](https://github.com/modelcontextprotocol/typescript-sdk/blob/951fe5603a7ec0b2dcb6a0b95d92cd86f93ad9e5/packages/client/src/ext/skills/skillsClient.ts).
- **C-TESTS:** [SkillsClient read tests, same commit](https://github.com/modelcontextprotocol/typescript-sdk/blob/951fe5603a7ec0b2dcb6a0b95d92cd86f93ad9e5/packages/client/test/ext/skills/read.test.ts). Test source inspected; not run locally.
