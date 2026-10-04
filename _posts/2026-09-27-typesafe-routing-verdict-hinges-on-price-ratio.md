---
title: "TypeSafe's routing verdict hinges on the price ratio"
description: "A Source Audit of Diogo Almeida's TypeSafe coding-agent notes and a PDF built from them: the routing break-even, a withdrawn token statistic, and what the synthesis smoothed over."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, typesafe, jev, context-engineering, kv-cache]
date: 2026-09-27 23:02:00 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/routing-break-even.svg
  alt: "Original bar chart comparing a pure frontier-model session with a large-to-small-to-large routed session under two price pairs and two context sizes"
---

> **Editorial method:** This source audit was researched and drafted with AI assistance under an evidence policy. I checked the cited documents and live price tables; I did not run a live Jev or routed-agent test.

## 🤔 Curiosity: Does the polished PDF still say what the notes said?

A [12-page PDF titled **"Jev Engineering for Coding Agents"**](https://drive.google.com/file/d/17h982xvsL3E7b80iGmOCfKp9qTOW9ohv/view) is typeset like a conference paper, with an abstract, index terms, numbered sections, and original diagrams. Its front page identifies it as an independently compiled synthesis for study, "based on design notes by Diogo Almeida (TypeSafe)", and says it is not affiliated with or endorsed by TypeSafe.

The ideas are worth the attention. [TypeSafe](https://typesafe.ai/) announced **Jev**, its first System One model, on September 15, 2026. Jev does not generate text: you send it a state and typed questions, and it returns a `choice`, a `score`, or a `noul` with probabilities. `noul` is not a typo; TypeSafe's own [coding-agent page](https://docs.typesafe.ai/introduction/coding-agents) defines it as a 0–1 value for a true/false statement. Almeida's notes ask how a TypeSafe-centric coding agent might work without KV-cache constraints, then explore routing, tool calling, compaction, subagents, restarts and batteries.

A synthesis is only as good as its fidelity to the source, though. This audit asks two narrow questions:

> **Does the PDF keep the evidence and the hedges of the original notes? And does the headline routing arithmetic actually say what both documents conclude?**

The short answer: the arithmetic is reproduced correctly, but its verdict depends on the price ratio between the two models, and with the current Opus 5.5/Sonnet 5 pair it flips for small contexts. The token statistic both documents cite comes from a preprint whose public arXiv record is marked withdrawn; its submission history shows June 30, 2026. The record gives no reason. The PDF also drops two visible cues from the Doc: that the sample proportions were a ChatGPT-generated guess and the "SLOP" appendix heading.

## 📚 Retrieve: What the sources show

### The primary source is a public Google Doc

The PDF does not link its source, but the source is findable. In the [Latent Space episode with Diogo Almeida](https://www.latent.space/p/jev) published on September 21, 2026, the show notes point to a note on the "Tyranny of the KV Cache", and in the transcript Almeida says he wants to explore "coding agents free from the tyranny of the KV cache" and release a document of his thoughts. That document is a public Google Doc titled [**"[public] thoughts on a typesafe coding agent"**](https://docs.google.com/document/d/1G61uUB0FifUnmmrPzFQojZ3KpczYKmXGpgEXDJ2l_Zg/edit), shared with anyone who has the link.

The full text of that Doc was compared with the PDF section by section on September 24. The structure maps cleanly: "Why yet another agent", six "weird things caused by the tyranny of the KV cache" (routing, tool calling, compaction, sub-agents, restarts, batteries), then basic, advanced, and "weirder" feature ideas, and three appendices. The PDF's six symptoms, its visibility ladder (don't show, short summary, long summary, full), conditional AGENTS.md, security-aware routing, and background processing all come from the Doc.

### The routing arithmetic, re-derived

The Doc's first "weird thing" is that routing does not work. It compares two paths using list prices of **$5 input / $25 output per million tokens for Opus** and **$3 / $15 for Sonnet**, where X is context tokens, Y is generated output, and Z is additional tokens read during the work (command output, file reads):

| Path | Cost terms | Total |
|---|---|---|
| 1. Pure Opus | generate 25·Y, read 5·Z | **25Y + 5Z** |
| 2. Opus → Sonnet → Opus | Sonnet loads context 3·X, generates 15·Y, reads 3·Z; Opus reloads what changed 5·(Y+Z) | **3X + 20Y + 8Z** |

With the Doc's sample shape of X = 0.65, Y = 0.12, Z = 0.23, pure Opus costs 4.15 and the routed path costs 6.19, so "pure opus is 2/3 the cost". The PDF reproduces these numbers exactly.

Setting the two totals against each other gives the break-even directly. The routed path is cheaper only when

```text
3X + 20Y + 8Z < 25Y + 5Z   ⇔   Y > 0.6 · (X + Z)
```

That is stronger than either document says. Both frame the loss around long sessions (large X). But with the sample's Z = 0.23, routing needs Y > 0.138 **even when X = 0**, and the sample's Y is 0.12. Under these prices the routed path loses with an empty context too, though only by 2.2% (4.24 against 4.15). The session length is not what sinks it; the read-heavy work is.

### The verdict flips with the price ratio

The formula has a hidden parameter. Write the large model's input price as *a* and the small model's as *b*, with output at 5× input for both, which holds for every pair here. Then, for `r < 0.8`, the routed path is cheaper when

```text
Y > r · (X + Z) / (4 − 5r),   where r = b / a
```

At `r ≥ 0.8`, it cannot be cheaper under this model: at exactly `0.8` it can only tie when `X = Z = 0`; above `0.8`, it loses for any nonzero work.

At the Doc's prices r = 0.6, which gives the 0.6 threshold above. Anthropic's [current Claude Platform pricing page](https://platform.claude.com/docs/en/about-claude/pricing) still lists Claude Opus 5 at $5/$25 and Sonnet 4.6 at $3/$15, so the Doc's pair is real. It also lists a newer pair, **Claude Opus 5.5 at $4/$20 and Claude Sonnet 5 at $2/$10**, where r = 0.5 and the threshold falls to one third. Run the same sample shape through it:

![Original chart: pure frontier versus routed cost under two price pairs and two context sizes](/assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/routing-break-even.svg){: w='960' h='470' }
_Original chart computed from the Doc's formula with Y = 0.12 and Z = 0.23. Prices from Anthropic's official pricing page as read on September 27, 2026._

With the newer pair, the long session still loses (4.36 against 3.32), but with an empty context the routed path is **7.8% cheaper** (3.06 against 3.32). At `r = 0.8`, the denominator goes to zero, so the threshold expression has no finite break-even value. "Routing doesn't work" is therefore a statement about a price ratio and a session shape, not a law.

The sketch also leaves out prompt-caching costs. It includes no cache-read charge for the large model's previously loaded prefix, while the same pricing page lists cache hits at 0.1× base input (0.05× on Opus 5.5) and cache writes at 1.25× for the five-minute window. Repeated turns can therefore incur cache-read charges that this single-handoff sketch omits. Treat the formula as a single hand-off sketch, which is how the Doc presents it.

### The sample shape was guessed by ChatGPT, and the PDF drops that

Here is the first fidelity gap. The Doc introduces the sample proportions with **"let's have chatgpt vibe some proportion of X / Y / Z"**. The PDF introduces the same numbers as "a plausible session shape". The numbers are unchanged; their provenance is gone. A reader of the PDF would reasonably assume the 0.65 / 0.12 / 0.23 split was measured.

The second gap is similar. The PDF's Table III gives token shares by subtask, such as reading file contents at 30–40% and searching at 10–18%, and a chart of "midpoint estimates". Its sources section calls the table "an illustrative estimate". The Doc's corresponding appendix heading is **"SLOP: A breakdown of coding agent subtasks"**, with no token-share table beneath it. The synthesis turns that informal heading into a formatted table and chart. "Illustrative" is a disclosure, but the polished presentation may read as more settled than the source supports.

### The token statistic rests on a withdrawn paper

Both documents cite one hard number: in GPT-5.4 trajectories, reading and searching account for **56.2% of all tool-use turns and 46.5% of the main agent's total tokens**. The Doc attributes it to [microsoft/fastcontext](https://github.com/microsoft/fastcontext); the PDF calls it "as reported by Microsoft's fastcontext project".

The number is present in the first version of [FastContext: Training Efficient Repository Explorer for Coding Agents](https://arxiv.org/html/2606.14066v1), which reports that reading and searching take 9.96 of 17.72 tool-use turns per instance on average, 56.2%, and 46.5% of the main agent's total tokens, in trajectories from GPT-5.4-high with Mini-SWE-Agent. The current [arXiv record](https://arxiv.org/abs/2606.14066) states **"This paper has been withdrawn"**; its submission history shows v4 marked withdrawn on June 30, 2026. The public record gives no reason. The GitHub URL cited in the Doc returned 404 in both the web page and GitHub API checks on September 27, 2026.

A separate repository, [evalstate/fastcontext](https://github.com/evalstate/fastcontext/tree/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4), was created on July 3, 2026, after the withdrawal. Its pinned tree carries an MIT license with a "Copyright (c) Microsoft Corporation" notice and includes the paper's figures:

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/references/fastcontext-overview.png" alt="FastContext overview figure: a main coding agent delegates a context query to an exploration subagent that runs read-only tools in parallel and returns file-line citations">
  <figcaption>FastContext's overview figure, from a post-withdrawal copy of the repository. Source: <a href="https://github.com/evalstate/fastcontext/tree/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4">https://github.com/evalstate/fastcontext/tree/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4</a>. Publisher/creator: Microsoft Corporation (FastContext authors), redistributed by evalstate/fastcontext. License: <a href="https://raw.githubusercontent.com/evalstate/fastcontext/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4/LICENSE">https://raw.githubusercontent.com/evalstate/fastcontext/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4/LICENSE</a>. Attribution: FastContext overview figure, Copyright (c) Microsoft Corporation, MIT License, pinned at commit 788342a5.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/references/fastcontext-token-breakdown.png" alt="FastContext token-composition chart comparing main-agent token use before and after delegating exploration on three benchmarks">
  <figcaption>FastContext's token-composition chart, the kind of evidence behind the 56.2% and 46.5% figures, from a paper that is now withdrawn. Source: <a href="https://github.com/evalstate/fastcontext/tree/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4">https://github.com/evalstate/fastcontext/tree/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4</a>. Publisher/creator: Microsoft Corporation (FastContext authors), redistributed by evalstate/fastcontext. License: <a href="https://raw.githubusercontent.com/evalstate/fastcontext/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4/LICENSE">https://raw.githubusercontent.com/evalstate/fastcontext/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4/LICENSE</a>. Attribution: FastContext breakdown figure, Copyright (c) Microsoft Corporation, MIT License, pinned at commit 788342a5.</figcaption>
</figure>

A withdrawal does not prove the measurement was wrong. The public record gives no reason, so this audit does not infer one. It does change the status of the evidence: the statistic is attached to a withdrawn preprint, not an active paper. The Doc treats its generality with care, saying "if this generalizes"; neither document mentions that withdrawn status, and the project URL they cite no longer resolves. The broader intuition that coding agents spend more on reading than writing may still be right, but this source alone no longer establishes it.

### What else the synthesis added or softened

| Item | In the Doc | In the PDF | Verdict |
|---|---|---|---|
| Routing numbers | 4.15 vs 6.19, "pure opus is 2/3 the cost" | Same numbers and chart | Faithful |
| Sample X / Y / Z | "let's have chatgpt vibe some proportion" | "a plausible session shape" | Hedge removed |
| Token-share breakdown | Titled "SLOP" | Table III + chart, "illustrative estimate" | Warning weakened |
| FastContext statistic | Quoted, "if this generalizes" | "as reported by Microsoft's fastcontext project" | Source withdrawn in June; not noted |
| Security routing | "Chinese models are way cheaper and likely yoinking all the data (e.g. DeepSeek V4 is insanely cheap)" | "some open-weight models served through low-cost providers" may not keep data private | Softened and generalized |
| Permission policy code, sensitivity-tier table, Jev question table | Not present | Present | Compiler additions consistent with the Doc's ideas, not the author's text |
| headroom link | `chopratejas/headroom` | "headroom" | The old URL now 301-redirects to `headroomlabs-ai/headroom` |

The softened security wording is understandable as a general privacy caution, but it changes the source's meaning: the Doc makes a specific, unsourced accusation about a named model family, while the PDF turns it into a general privacy caution. Readers who quote the PDF are not quoting Almeida.

### The batteries the notes want to ship

The Doc's appendix lists tools a TypeSafe-native harness could integrate: headroom, rtk, ast-grep, ast-outline, FastContext, and fff. Two of them show why "batteries cost context" is the right frame. [headroom](https://github.com/headroomlabs-ai/headroom/tree/c02929846cafa4b9bc68c9d2ef47f41a10a6989d) is a context-compression layer. Its pinned README gives one project-reported example: a 55,957-token agent prompt compressed to the 24,340 tokens actually sent to the model. Its dashboard also tracks provider cache time-to-live, which is directly relevant to the KV-cache economics in the Doc. The savings claims were not independently rerun for this audit.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/references/headroom-cache-ttl-dashboard.png" alt="headroom dashboard screenshot showing prompt-cache time-to-live and savings panels">
  <figcaption>headroom's cache-TTL dashboard as committed to its repository. Source: <a href="https://github.com/headroomlabs-ai/headroom/tree/c02929846cafa4b9bc68c9d2ef47f41a10a6989d">https://github.com/headroomlabs-ai/headroom/tree/c02929846cafa4b9bc68c9d2ef47f41a10a6989d</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/c02929846cafa4b9bc68c9d2ef47f41a10a6989d/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/c02929846cafa4b9bc68c9d2ef47f41a10a6989d/LICENSE</a>. Attribution: headroom dashboard-cache-ttl-main.png, Apache License 2.0, pinned at commit c0292984.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/references/headroom-savings.png" alt="headroom community-savings dashboard with project-reported token, cost, request, and instance totals above a 48-hour token-savings chart">
  <figcaption>headroom's published community-savings dashboard; the displayed totals and chart are the project's own and were not independently remeasured here. Source: <a href="https://github.com/headroomlabs-ai/headroom/tree/c02929846cafa4b9bc68c9d2ef47f41a10a6989d">https://github.com/headroomlabs-ai/headroom/tree/c02929846cafa4b9bc68c9d2ef47f41a10a6989d</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/c02929846cafa4b9bc68c9d2ef47f41a10a6989d/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/c02929846cafa4b9bc68c9d2ef47f41a10a6989d/LICENSE</a>. Attribution: headroom headroom-savings.png, Apache License 2.0, pinned at commit c0292984.</figcaption>
</figure>

[fff](https://github.com/dmtrKovalenko/fff/tree/e3f694a2e4f82bb755418e8d305dcff779c59c27) is the Doc's example of search built for long-running processes. Its pinned README says the index and file cache stay resident in one long-lived process, avoiding a new CLI process for each query. That architecture is relevant to retrieval-heavy sessions, regardless of the exact token share; I did not benchmark it here.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-27-typesafe-routing-verdict-hinges-on-price-ratio/references/fff-search-benchmark-chart.png" alt="Line chart of cumulative tokens over wall time for Opus 4.6 feature-completion runs with and without fff MCP, averaged across 20 runs">
  <figcaption>fff's published Opus 4.6 feature-completion chart (20-run average) with and without fff MCP; token and timing figures are the project's own, not independently remeasured here. Source: <a href="https://github.com/dmtrKovalenko/fff/tree/e3f694a2e4f82bb755418e8d305dcff779c59c27">https://github.com/dmtrKovalenko/fff/tree/e3f694a2e4f82bb755418e8d305dcff779c59c27</a>. Publisher/creator: Dmitriy Kovalenko (dmtrKovalenko/fff). License: <a href="https://raw.githubusercontent.com/dmtrKovalenko/fff/e3f694a2e4f82bb755418e8d305dcff779c59c27/LICENSE">https://raw.githubusercontent.com/dmtrKovalenko/fff/e3f694a2e4f82bb755418e8d305dcff779c59c27/LICENSE</a>. Attribution: fff chart.png, MIT License, Copyright (c) 2025 Dmitriy Kovalenko, pinned at commit e3f694a2.</figcaption>
</figure>

## 💡 Innovation: What I would take into a harness

The Doc's real contribution is the framing: price routing **per context rebuild**, not per token. That survives the audit intact. What changes is that the routing decision should be computed, not assumed. The break-even is cheap enough to evaluate before every hand-off:

```javascript
// Should this subtask leave the large model? Prices are per million tokens.
// x, y, z are token counts in millions: context loaded, output generated,
// and extra tokens read. Mirrors the Doc's single hand-off formula,
// so it ignores cache-read and cache-write multipliers.
function routedIsCheaper({ x, y, z }, large, small) {
  const pure = large.output * y + large.input * z;
  const routed = small.input * x + small.output * y + small.input * z
    + large.input * (y + z); // the large model rereads what changed
  return { pure, routed, route: routed < pure };
}

const opus55 = { input: 4, output: 20 };
const sonnet5 = { input: 2, output: 10 };
routedIsCheaper({ x: 0, y: 0.12, z: 0.23 }, opus55, sonnet5);    // route: true
routedIsCheaper({ x: 0.65, y: 0.12, z: 0.23 }, opus55, sonnet5); // route: false
```

In a real harness, x is the number the Doc's meta-attention idea shrinks: if context assembly can hand the helper a small, purpose-built context, x approaches zero and output-heavy subtasks start to clear the threshold. As a design example, a game pipeline might generate asset metadata, localization strings, or boilerplate from a short spec, while a build-failure investigation might need more log-reading than output. Those are not measured workload shares; a real routing decision should use recorded X, Y, and Z.

The second lesson is about evidence, and it applies to anyone building on this discussion. Before quoting a synthesis, trace each number to where it lives today. The two numbers most likely to be repeated from this PDF, the "plausible" session shape and the 56.2% reading-and-searching share, turn out to be a ChatGPT guess and a withdrawn paper.

If Jev is the first system-one model you have looked at, my earlier audit of [Jev's browser-agent decision loop](/posts/jev-shrinks-browser-agent-decision-loop/) covers what its speed claims do and do not show.

## 🎯 Key Takeaways

| Insight | Implication | Next Steps |
|---|---|---|
| Routing is cheaper only when Y > r(X+Z)/(4−5r) | "Routing doesn't work" holds at r = 0.6 but not at r = 0.5 for small contexts | Compute the break-even per subtask instead of banning or defaulting to routing |
| The Doc's sample shape was guessed by ChatGPT | The 4.15 vs 6.19 comparison is an illustration, not a measurement | Measure X, Y, Z from your own agent logs before quoting ratios |
| The 56.2% / 46.5% statistic comes from a withdrawn paper | "Retrieval dominates tokens" remains plausible, but this audit does not establish it from an active source | Measure your own traces or use a current, verifiable benchmark |
| The PDF dropped the "chatgpt vibe" note and "SLOP" heading, and softened a vendor claim | A faithful-looking synthesis can still shift meaning | Quote the primary Doc, not the PDF, when attributing claims to Almeida |
| Context assembly is what makes routing viable | Shrinking x is the lever, not cheaper tokens | Prototype chunk-level visibility decisions before adding more models |

## 🤔 New Questions

- How much does the break-even move once cache reads on the large model's prefix are priced in over a multi-turn session?
- What are real X, Y, Z shares for a coding agent on a game codebase, where build logs are long and edits are small?
- Can a typed decision model like Jev estimate x for a subtask cheaply enough that the routing check pays for itself?
- Will the FastContext authors republish, and with the same 56.2% figure?

### Limitations

This audit compares text, not intent: the Doc is an informal working note and its author never claimed measured proportions. The PDF's compiler is anonymous, so this audit cannot tell which changes were deliberate. The FastContext withdrawal notice gives no reason, so the article makes no claim about the validity of its measurements. No Jev, headroom, fff, or routed-agent run is included; tool claims above are reported as the projects' own.

## References

**Primary sources:**
- [[public] thoughts on a typesafe coding agent — Diogo Almeida (Google Doc)](https://docs.google.com/document/d/1G61uUB0FifUnmmrPzFQojZ3KpczYKmXGpgEXDJ2l_Zg/edit)
- [Jev: System One models for Prod, not God — Latent Space, September 21, 2026](https://www.latent.space/p/jev)
- [Introducing System One Models & Jev — TypeSafe blog](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [Jev with coding agents — TypeSafe docs](https://docs.typesafe.ai/introduction/coding-agents)

**Pricing:**
- [Anthropic pricing — Claude Platform docs](https://platform.claude.com/docs/en/about-claude/pricing)

**Research papers:**
- [FastContext: Training Efficient Repository Explorer for Coding Agents (arXiv:2606.14066, withdrawn)](https://arxiv.org/abs/2606.14066)


**Code & implementation:**
- [evalstate/fastcontext (post-withdrawal copy, pinned 788342a5)](https://github.com/evalstate/fastcontext/tree/788342a5c1f5ffbd9280fdbc813cc6bdb0024db4)
- [headroomlabs-ai/headroom (pinned c0292984)](https://github.com/headroomlabs-ai/headroom/tree/c02929846cafa4b9bc68c9d2ef47f41a10a6989d)
- [dmtrKovalenko/fff (pinned e3f694a2)](https://github.com/dmtrKovalenko/fff/tree/e3f694a2e4f82bb755418e8d305dcff779c59c27)
- [rtk-ai/rtk](https://github.com/rtk-ai/rtk)
- [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep)
- [ast-outline](https://ast-outline.github.io/)

**Related posts:**
- [Jev shrinks the browser-agent decision loop for faster actions](/posts/jev-shrinks-browser-agent-decision-loop/)
