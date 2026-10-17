---
title: "The Jev Pipeline Tied Opus at 37/40, but the Cost Tables Conflict"
description: "A first-party 37/40 tie comes with conflicting Opus cost tables; the source lacks raw billing evidence to resolve the later 150–250× estimate."
date: 2026-10-17 14:20:07 +0900
categories: [AI, Agents]
tags: [jev, trueforge, agent-harness, human-in-the-loop, source-audit]
image_policy: source-first-fallback
image:
  path: /assets/img/posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate/pipeline-comparison.png
  alt: "Comparison of the author-reported 40-request workflow: Jev plus Opus review and Opus-only selection both scored 37 of 40; one high-confidence Jev miss bypassed review."
---

## What did 37/40 actually compare?

Akshay Pachaar’s [walkthrough](https://x.com/akshay_pachaar/article/2109678653974155459), posted October 12, 2026 UTC (October 13 KST), describes a weekly client-follow-up pipeline. Its closing note thanks TrueFoundry for working with the author on the article. It starts with 40 requests and 300 GitHub issues, 200 open and 100 closed. A shared-word script narrows the issue list to ten candidates per request. In one version, Jev chooses a candidate or “none”; Claude Opus 5.5 reviews low-confidence matches. In the comparison version, Opus chooses from the same shortlist without Jev.

The author reports 37 correct out of 40 for both versions. That is a tie between two pipelines on one small, author-run set, not a general Jev-versus-Opus model result. I inspected the article and current product sources; I did not reproduce the run.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate/pipeline-comparison.png" alt="Comparison of the author-reported 40-request workflow: Jev plus Opus review and Opus-only selection both scored 37 of 40; one high-confidence Jev miss bypassed review." width="2880" height="1800" loading="lazy" decoding="async">
  <figcaption>Original illustration by Aside, authored as an SVG and rendered locally to PNG. It visualizes reported counts, not a reproduced run; not source evidence.</figcaption>
</figure>

The difference is in the review path, not the final score:

| Author-reported path | Review account | Final score |
| --- | --- | ---: |
| Jev selection + Opus review | 16 cases reviewed; five wrong matches caught; one high-confidence miss bypassed review | 37/40 |
| Opus-only selection from the same shortlist | Five cases reviewed; none reported as a wrong match caught | 37/40 |

The workflow may have used reviewer effort differently, but the published score does not show an accuracy gain over the baseline. The article does not provide the 40 request/label pairs, the 300-issue snapshot, or the shortlist code, so a reader cannot independently recompute the score from its public materials. It also cannot tell us whether the top-ten shortlist contained the correct issue in every case. Jev cannot select an issue that retrieval excluded, and the article itself notes that shared-word matching can miss semantic matches. For that separate retrieval boundary, see [RAG vs Jev: ranking is not answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/).

## The cost tables conflict, and neither is a system bill

The source’s two decision-cost tables conflict. The earlier [“Measured for all 40 requests” table](https://pbs.twimg.com/media/HUcNSJwaYAAdjME.jpg) lists $0.0015 with Jev and $0.005–$0.015 without Jev. A later [“Measured cost of the decisions” table](https://pbs.twimg.com/media/HUcNV5TbgAA8GYj.jpg) lists $0.0015 for Jev and $0.22–$0.38 for Claude Opus 5.5, alongside $12–$20 per year and a 150×–250× ratio. The prose beside that later table calls the Opus comparison an estimate. Both tables give the same Jev figure, but the source does not explain the different Opus ranges or provide raw billing data to resolve them.

The later range divided by $0.0015 yields about 147–253×, consistent with its rounded 150×–250× label. The earlier range implies about 3.3–10×. These are conditional ratios calculated from the two source tables, not a way to decide which Opus cost describes the run. The Jev calculation is separately traceable: the author assumes about 900 input tokens per request, or 40 × 900 = 36,000 tokens. TypeSafe’s model page lists Jev input at $0.042 per million tokens with free output, so that assumption gives $0.001512 before rounding. This arithmetic is not an invoice or independent request log.

Anthropic’s [official pricing page](https://platform.claude.com/docs/en/about-claude/pricing) lists Opus 5.5 at $4 per million input tokens and $20 per million output tokens. Those rates do not verify either Opus figure: the source does not publish the input/output token counts or a detailed bill calculation. Its table headings say “Measured,” while nearby prose calls the later comparison estimated; the public material does not reconcile that labeling conflict.

Neither table is an end-to-end Jev-plus-review workflow bill. The article does not break out costs for Opus reviews, shortlist generation, the harness, retrieval, Daytona execution, storage, or network use. The later 150×–250× ratio is therefore a source-reported comparison with unresolved cost inputs, not a verified saving for the weekly system.

Versioning is another gap for reproduction. The current [TypeSafe models page](https://docs.typesafe.ai/models) lists Jev 1.14 as the newest release and says it became available October 14, while `jev-latest` points to Jev 1.13. The case article does not identify its Jev model ID. The current page cannot tell us which version produced the reported result, so a new comparison should pin the model rather than rely on a moving alias.

## Confidence routed work, but did not guarantee correctness

The author says Jev answers below 80% confidence for open issues, or below 90% for closed issues, went to Opus review. The reported Jev path sent 16 cases to review, where five wrong matches were caught. But the walkthrough also identifies a Jev miss that received its highest confidence and passed without review. A threshold did not catch that error.

That does not make confidence useless; it means the score should be evaluated on the task where it will route work. TypeSafe’s [confidence guidance](https://docs.typesafe.ai/confidence) says threshold values depend on domain performance and should be tested against one’s own data. The case article gives no confidence-bin counts or calibration curve for the 40 requests, and it does not describe reviewer blinding or agreement. Its results therefore do not establish that 80% or 90% is a safe operating threshold for another backlog.

Treat confidence as one routing signal, then measure the missed errors that pass above the threshold. Keep that routing signal separate from the policy check that authorizes a write. The distinction is covered in the earlier [Jev policy-gate audit](/posts/jev-selected-probability-policy-gate/).

## “Every write” depends on the tool annotations

TrueForge’s current [tool-approval documentation](https://trueforge.dev/create-agent/overview#tool-approval) describes configurable selectors. I also inspected the pinned `@truefoundry/trueforge@0.179.2` implementation at commit [`198a2ead`](https://github.com/truefoundry/trueforge/blob/198a2ead7bcc32b00aef75d22eea6fa1569d1734/packages/trueforge-core/src/core/mcp/toolSelectors.ts). Its `@write` selector matches tools marked `readOnlyHint: false` that are not destructive; `@destructive` matches tools marked `destructiveHint: true`. The implementation says unannotated tools are exempt unless explicitly named or covered by `@all`.

So a claim that “every write” pauses for approval is stronger than the default selector behavior by itself. It could be true for a configured agent if every effectful connector tool is properly annotated, named, or covered by `@all`. The case does not publish its selector list or the GitHub and Notion tool annotations, so I cannot verify that its particular setup gated every write. This is a configuration question, not evidence that the author’s run lacked approval.

A separate public TrueForge benchmark does not close that gap. The pinned [benchmark README](https://github.com/truefoundry/trueforge/blob/198a2ead7bcc32b00aef75d22eea6fa1569d1734/benchmark/README.md) describes a TrueFoundry-built benchmark harness using 14 DevRev L1–L2 tasks from Enterprise-Bench, run three times per arm with a blind LLM judge. Its [runner](https://github.com/truefoundry/trueforge/blob/198a2ead7bcc32b00aef75d22eea6fa1569d1734/benchmark/bench_matrix.py) sets `require_approval_for_tools` to an empty list and disables user-question pauses for its autonomous benchmark configuration. That is a different experiment, and it does not test the weekly case’s write-approval claim.

## A sandbox is not a network policy

The source article identifies Daytona as the execution sandbox; it does not make Daytona responsible for candidate retrieval, Jev’s choice, or TrueForge’s approval decision. TrueForge’s [sandbox docs](https://trueforge.dev/sandbox) say outbound internet is unrestricted by default unless an allowlist or block-all policy is configured.

Daytona’s own [network-limit documentation](https://www.daytona.io/docs/en/network-limits.md) adds an important service-level qualification: Tier 1 and 2 inherit restricted organization policies, while Tier 3 and 4 have full internet access by default and can set explicit sandbox allowlists or block all outbound traffic. The case article does not state the organization tier or the sandbox’s network settings. The actual egress policy for that run is therefore unknown; generic sandbox isolation language cannot settle it.

## What to validate before a controlled pilot

A useful next test would preserve the reported design while making its limits measurable:

1. Pin Jev, Opus, TrueForge, the issue snapshot, prompts, and shortlist code. Publish a redacted request-to-label score sheet so the 40-case result can be checked.
2. Measure shortlist recall before evaluating Jev. Then report precision/recall by confidence band, including high-confidence errors and the number of examples in each band.
3. Treat the Jev-assisted and Opus-only paths as complete pipeline variants. Include review tokens and review outcomes in the cost and quality comparison, not just first-pass decision rates.
4. Enumerate every write-capable MCP tool, verify its annotations or explicit selector entry, and test that approval pauses before each side effect.
5. Inspect the Daytona organization tier and set an explicit egress policy. Record secret names and scopes, approved hosts, and the measured network policy; never log secret values.

## Key Takeaways

- The author reports a 37/40 tie between two issue-matching pipelines on one 40-request set; this is not a general model-equivalence result.
- The source’s cost tables conflict: one lists Opus at $0.005–$0.015, another at $0.22–$0.38. The later 150×–250× comparison is not resolved by published billing evidence.
- One reported high-confidence Jev miss bypassed review, and the public case does not establish calibration for another backlog.
- TrueForge approval depends on tool annotations or explicit selectors; Daytona egress depends on the effective network policy and account tier.

## New Questions

- What was the exact Jev model ID, and can the full request-to-label score sheet be shared?
- Which Opus cost figure reflects the run, and can token counts or billing records reconcile the $0.005–$0.015 and $0.22–$0.38 tables?
- Did the ten-candidate shortlist contain the correct issue for every request, and what was its recall?
- Which GitHub and Notion MCP tools were annotated or explicitly included in the approval selector?
- Which Daytona tier and egress settings were active, and were any sandbox secrets mounted?

## References

**Case report and newsletter**

- Akshay Pachaar, [“I put Jev inside an Open Agent Harness”](https://x.com/akshay_pachaar/article/2109678653974155459), posted October 12, 2026 UTC (October 13, 01:12 KST). Author-reported case; the author thanks TrueFoundry for working with him on the article. Metrics are reported, not independently reproduced.
- The article’s embedded [“Measured for all 40 requests” table](https://pbs.twimg.com/media/HUcNSJwaYAAdjME.jpg) and later [“Measured cost of the decisions” table](https://pbs.twimg.com/media/HUcNV5TbgAA8GYj.jpg), visually inspected October 17, 2026. Both list Jev at $0.0015 but give different Opus costs; nearby prose describes the later comparison as an estimate.
- Daily Dose of Data Science, [“Run Jev Inside an Open Agent Harness”](https://blog.dailydoseofds.com/p/run-jev-inside-an-open-agent-harness), October 16, 2026. Newsletter summary, not independent corroboration.

**Official product documentation**

- TypeSafe, [Models and pricing](https://docs.typesafe.ai/models) and [Confidence](https://docs.typesafe.ai/confidence), observed October 17, 2026.
- Anthropic, [Claude model pricing](https://platform.claude.com/docs/en/about-claude/pricing), observed October 17, 2026.
- TrueFoundry, [Tool approval](https://trueforge.dev/create-agent/overview#tool-approval) and [Sandbox](https://trueforge.dev/sandbox), observed October 17, 2026.
- Daytona, [Network limits](https://www.daytona.io/docs/en/network-limits.md), observed October 17, 2026.

**Pinned implementation and benchmark**

- TrueFoundry, [`@truefoundry/trueforge@0.179.2` approval implementation](https://github.com/truefoundry/trueforge/blob/198a2ead7bcc32b00aef75d22eea6fa1569d1734/packages/trueforge-core/src/core/mcp/toolSelectors.ts), [benchmark README](https://github.com/truefoundry/trueforge/blob/198a2ead7bcc32b00aef75d22eea6fa1569d1734/benchmark/README.md), and [benchmark runner](https://github.com/truefoundry/trueforge/blob/198a2ead7bcc32b00aef75d22eea6fa1569d1734/benchmark/bench_matrix.py), pinned commit `198a2ead7bcc32b00aef75d22eea6fa1569d1734`.
