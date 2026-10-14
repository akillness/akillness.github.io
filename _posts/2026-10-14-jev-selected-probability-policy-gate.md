---
title: "Jev Choices Need Their Own Probability at the Policy Gate"
description: "A pinned Jev SDK audit and a synthetic local test keep selected-choice probability separate from policy fallbacks, confidence, and tool authorization."
date: 2026-10-14 10:02:00 +0900
categories: [AI, Agents]
tags: [jev, typesafe-ai, probability, authorization, source-audit]
image_policy: source-first-fallback
image:
  path: /assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/concept-illustration.png
  alt: "AI-generated conceptual illustration of a teal tile tethered to its own weight before a closed amber gate, with other pairs apart."
---

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/concept-illustration.png" alt="AI-generated conceptual illustration of a teal tile tethered to its own weight before a closed amber gate, with other pairs apart." loading="lazy">
  <figcaption>AI-generated illustration by ChatGPT image generation via Aside. A selected-pair metaphor before a separate barrier, not a Jev response, measured probability or real authorization event. This is not source evidence.</figcaption>
</figure>

## Whose probability reached the executor?

Suppose a projected decision says `choice="page_team"`, but its probability map contains only `inspect_read_only` and `stop`. Can an adapter use the largest number in that map as permission to page the team?

A deliberately unsafe local adapter does exactly that in this audit's synthetic counterexample. A separate checked adapter returns a handoff instead. **The missing selected probability cannot be replaced by another option's probability.**

The October 14 newsletter's sponsored incident-response story made this question worth testing. It did not supply the case repository, revision or test trace through its canonical product links, so I did not reproduce that application or verify its claimed review results or adoption metrics. The finding here comes from public TypeSafe contracts, pinned SDK source and a small, independent local experiment.

**Source Audit scope:** JavaScript SDK v0.6.0 at `66880ccd`, Python SDK v0.7.4 at `e70bf99a`, and public documentation/OpenAPI observed on October 14, 2026. The local script ran under Node v26.5.0 with hand-authored inputs. No TypeSafe request, deployed incident app, CodeRabbit test, GPU benchmark or real tool executor was run.

## A typed answer still has relational invariants

### A cast is not a selected-key check

The public OpenAPI `ChoiceAnswer` requires `type`, `choice`, `confidence` and `probabilities`. Its descriptions say the selected choice is a highest-probability requested criterion and the probability map covers the criteria with values in [0,1] that approximately sum to one.

The machine schema does not encode the selected-key relationship, request-key equality, probability bounds, sum or argmax constraints. A service can enforce more than its published schema, so that observation is not evidence that the service returns malformed answers.

The pinned JavaScript SDK retains the corresponding static types, but its successful `systemOne` return path parses a body and returns `parsed as T`. The inspected `parseBody` performs JSON parsing; there is no selected-key/distribution validator in that return path. Request questions do have their own validation. This is a bounded source finding, not a claim that every SDK path lacks validation.

The Python SDK is an important contrast. Its public answer models and response decoder perform strict field/type parsing. The inspected `ChoiceAnswer` uses float and dictionary fields without relational selected-key or numeric-distribution validators in those models. It would be inaccurate to say that Python has no validation. Neither SDK was executed here.

### Probability and confidence are different fields

TypeSafe's public Choice example pairs `probabilities.returns=0.61` with `confidence=0.42`. The latter summarizes distribution concentration; it is not another spelling of the selected option's probability. The [earlier alternatives audit](/posts/jev-alternatives-training-api-contracts/) discusses that formula and the different backend contracts, so I will not repeat that comparison here.

There is also a useful limit on criticism of `max`. On a valid documented Choice, the selected option is an argmax, so the map's maximum is its own probability. The error is using a maximum **as a fallback before validating the association**, not using a maximum in every circumstance.

Keep the answer linked to the request's complete criterion set before computing a concentration statistic. A map from another question, an incomplete map or a renamed selection should not silently inherit a score.

### Calibration does not grant a capability

TypeSafe's primer explains that calibration describes groups of predictions, not a guarantee about one answer. This audit did not measure Jev calibration in incident response or game operations.

Even a well-calibrated prediction does not give a principal permission to page a team, edit a repository or read restricted logs. Probability, current evidence and authorization answer different questions. A valid `other` or low-probability result is also different from malformed data: an invalid payload is not a measurement of uncertainty.

## Test the association without pretending to test the model

I used a fixed three-label request projection: `page_team`, `inspect_read_only` and `stop`. The deliberately broken adapter contains this fallback:

```js
const p = answer.probabilities[answer.choice]
  ?? Math.max(...Object.values(answer.probabilities));
```

With the following **projected synthetic input**, its returned action string is `page_team`:

```json
{
  "type": "choice",
  "choice": "page_team",
  "probabilities": {
    "inspect_read_only": 0.90,
    "stop": 0.10
  }
}
```

This is not a complete valid wire answer, nor an observed Jev response. The test deliberately consumes only `type`, `choice` and `probabilities`; it does not validate or consume `confidence` or the full HTTP envelope.

The checked adapter requires an allowed choice, the exact fixed criterion keys, an own-property probability for the selection, finite numbers in [0,1], a sum within `1e-6` of one, and a selected probability no lower than the maximum beyond that tolerance. The tolerance is this test's declared policy, not a measured TypeSafe guarantee. Invalid projections return `action="handoff"` with `reason="invalid_response"`, rather than fabricating a zero or borrowing another score.

The toy gate then applies illustrative probability bands: below 0.55 means handoff; below 0.80 may select a read-only **policy fallback**; at or above 0.80 may select the original action. These are not calibrated safety thresholds or universal Jev recommendations.

Crucially, when policy chooses `inspect_read_only` for a `page_team` prediction at 0.60, the returned metadata remains:

```json
{
  "action": "inspect_read_only",
  "actionSource": "policy-read-only-fallback",
  "selectedChoice": "page_team",
  "selectedChoiceProbability": 0.60
}
```

It does not relabel 0.60 as the model's probability for `inspect_read_only`. That fallback requires its own entry in `allowedActions`, just as the high-probability selected action does. A `freshEvidence` boolean is checked separately.

### Run the synthetic check yourself

Download the [portable adapter and test script](/assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/decision-gate.mjs) into a scratch directory and run:

```sh
node decision-gate.mjs
```

It writes `decision-gate-results.json` beside the script. The download changes only the local command path recorded in the original report, not the decision logic. The [published synthetic results](/assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/decision-gate-results.json) and [bounded discovery note](/assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/discovery-context.md) keep the input scope visible. Run it in a disposable folder, not a production executor.

A [sanitized independent reproduction review](/assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/independent-reproduction-review.json) records the portable file hash, matching decision logic and rerun scope.

### What actually passed

The local script passed **17 cases and 22 assertions**. A separate reviewer copied the identical source into scratch space and independently obtained the same counts under Node v26.5.0.

| Synthetic case family | Checked adapter outcome | What the test establishes |
|---|---|---|
| Selected key missing; another option is 0.90 | Handoff with invalid-response reason | No maximum-probability borrowing in this adapter |
| Unknown action/key, nonfinite or string values, bad sum, non-maximum selection | Handoff with invalid-response reason | Rejection of these hand-authored projection errors |
| Selected probability 0.40 / 0.60 / 0.80 / 0.85 | Handoff / authorized read-only fallback / original action / original action | The illustrative branch boundaries tested here |
| High probability with denied action or stale-evidence flag | Hold | Neither probability nor a score refresh overrides these toy policy checks |
| Medium probability with read-only capability denied | Hold | The fallback does not grant itself permission |
| Read-only fallback from a 0.60 paging selection | Original selection and probability retained in metadata | Policy action and model selection stay distinguishable |

The NaN and Infinity cases are in-memory defensive fixtures, not JSON responses from a provider. The script returns decision records only. It does not dispatch tools, implement an authenticated principal, check resource ownership or expiry, bind a dynamic question ID, or prove production authorization. The two policy fields are deliberately much smaller than a real authorization system.

![The selected choice and its own probability pass through projection checks before a separate policy gate; invalid input and denied permission do not dispatch an action.](/assets/img/posts/2026-10-14-jev-selected-probability-policy-gate/decision-boundary.svg)

*Original explanatory SVG, not a model benchmark or execution trace. The script returns records, not tool calls. No directly relevant source raster with verified commercial-reuse permission was established in the bounded inspection.*

For a game-operations assistant, I would preserve the same distinction when a model recommends rolling back a build but policy permits only inspection. Keep the original selection and statistic in the audit record, then record the policy-selected action separately. That is a proposed integration pattern, not experience with a deployed game service.

Before shipping, the next tests would cover request/state binding, authenticated principal and object ownership, action-specific risk thresholds, explicit no-match handling, and the real executor's refusal behavior. Passing this local projection test cannot substitute for them. This also extends the [ranking-versus-answerability boundary](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/): a useful score is not proof of a different downstream property.

### The serving links answer a different question

The email also pointed toward Uzu/local inference and discussed GPU memory. Mirai's [Uzu speculative-decoding note](https://trymirai.com/blog/speculative-decoding-in-uzu) describes a serving implementation; vLLM's memory guidance concerns its own runtime. I inspected these as supplementary context, not decision-gate evidence. No claimed throughput was reproduced, and vLLM GPU-memory behavior should not automatically be transferred to an Apple unified-memory engine.

## Key Takeaways

- Preserve `choice -> probabilities[choice]` from the same validated answer. Do not borrow a different option's probability when the selected key is missing.
- A successful parse and TypeScript cast do not, by themselves, validate that relational association. The source finding does not establish a Jev service failure.
- Selected probability, the documented confidence field, calibration and execution permission are different properties.
- A policy fallback needs its own permission and must not relabel the original option's score as its own.
- The 17-case result covers a synthetic projection and toy policy only, not the private newsletter app, model quality or production safety.

## New Questions

- Which request and evidence revisions should the executor require before accepting a decision?
- How should a valid no-match result differ from malformed data in logs and human handoff?
- What empirical threshold is appropriate for each independently authorized action in the actual application?

## References

### Primary contracts and pinned implementation

- [Public TypeSafe OpenAPI](https://api.typesafe.ai/openapi.json), observed October 14, 2026; `info.version=0.2.0`.
- [JavaScript SDK types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/types.ts), [successful return path](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L311-L347), and [body parser](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L472-L489).
- [Python answer models](https://github.com/typesafe-ai/typesafe-sdk-python/blob/e70bf99a89f27102247613bcd5d1aa8923a1cda9/src/typesafe_sdk/_schemas/models.py) and [response decoding](https://github.com/typesafe-ai/typesafe-sdk-python/blob/e70bf99a89f27102247613bcd5d1aa8923a1cda9/src/typesafe_sdk/_core/response_types.py).
- [Choice documentation](https://docs.typesafe.ai/primitives/choice.md), [confidence definition](https://docs.typesafe.ai/confidence.md), and [calibration explanation](https://docs.typesafe.ai/introduction/machine-learning-primer.md), dated observation October 14, 2026.

### Local reproduction and limits

- Archived original `decision-gate.mjs` and its results, retained in the internal evidence package: original source SHA-256 `dc3bbd8897f54a46627de72971f34107bb9aebb9a73a55f14fe61e8f983d44c3`, Node v26.5.0, 17 cases/22 assertions. Hand-authored inputs, no network or executor.
- Independent scratch-copy experiment review, included in the evidence package. It validates the matching script, not model calibration or the newsletter case.

### Supplementary serving context, not reproduced measurements

- [Mirai's speculative decoding in Uzu](https://trymirai.com/blog/speculative-decoding-in-uzu) and [pinned Uzu README](https://github.com/trymirai/uzu/blob/e7e8e1e0180dbd66ed4e2f076b8d9ebc38846e77/README.md).
- [vLLM v0.25.0 optimization/preemption guidance](https://docs.vllm.ai/en/v0.25.0/configuration/optimization/) and [memory conservation](https://docs.vllm.ai/en/v0.25.0/configuration/conserving_memory/).

### Discovery context and related audits

- Daily Dose of Data Science, October 14, 2026 sponsored HANDS-ON email. Product links do not supply a case revision; claimed private-app results and adoption metrics are not treated as verified. Personal tracking links omitted.
- [Eight Jev Alternatives Do Not Share One Training or API Contract](/posts/jev-alternatives-training-api-contracts/).
- [RAG vs Jev: Ranking Is Not Answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/).
