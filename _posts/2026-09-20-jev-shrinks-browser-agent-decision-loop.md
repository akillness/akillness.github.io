---
title: "Jev shrinks the browser-agent decision loop for faster actions"
description: "A Source Audit of Jev Ultrafast and Jev Desktop: the indexed action space, the narrow matched speed result, and the boundary between faster decisions and unproven end-to-end gains."
categories: [AI, Agents]
tags: [jev, browser-agents, ai-agents, browser-use, typesafe, agent-infrastructure]
date: 2026-09-20 20:34:51 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-20-jev-shrinks-browser-agent-decision-loop/jev-decision-loop.svg
  alt: "Original diagram of Jev's indexed browser-agent decision loop from observed controls to operation and target heads, freshness checks, and a narrow text helper"
---

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; no first-hand playtest or human participant result is claimed.

## 🤔 Curiosity: Is Jev faster, or is it simply asked fewer bad questions?

A recent X post makes a dramatic claim: Jev is **20 to 200 times faster** and **40 to 400 times cheaper**. The post then points readers to ten Jev-related projects, including [Browser Use's `jev-ultrafast`](https://github.com/browser-use/jev-ultrafast) and [Jev Desktop](https://github.com/yikangy873-gif/jev-desktop).

That is a useful discovery lead, but it is not yet a benchmark. The numbers belong to the post's author. They do not automatically become evidence just because a repository link follows them.

I narrowed this audit to the first two projects because they expose enough primary material to inspect: pinned source, a dated measurement report, a visible safety boundary, tests, and licenses. I did not turn the other eight links into a listicle. That would repeat the post while leaving the underlying claims unexamined.

The sharper question is this:

> **Does Jev make browser agents faster by making the model smarter, or by making the decision space smaller and more executable?**

The evidence points to the second explanation.

Jev Ultrafast's interesting optimization is not a claim that a language model suddenly understands every webpage 200 times better. It is a control-loop redesign. The page becomes an indexed table of observed elements. Jev chooses an operation and a compatible target. The executor rechecks freshness and geometry before acting. A separate small language model writes text only when a field actually needs text.

That is a much narrower claim than the X post. It is also more useful to engineers.

## 📚 Retrieve: What the pinned repositories actually implement

### The decision loop is an indexed table, not a screenshot prompt

The Jev Ultrafast README describes a **dynamic, indexed action space**. A browser observation becomes something like this:

```text
[1] button    Change ticket type · Round trip
[2] combobox  Where from?        · San Francisco
[3] combobox  Where to?          · empty
[4] textbox   Departure          · empty
```

The model does not receive one giant flat list of every possible action. The implementation groups valid actions by operation:

| Operation | What Jev can see | What becomes a target |
|---|---|---|
| `CLICK` | Buttons, links, menu items, suggestions, calendar days | An observed element index |
| `TYPE_TEXT` | Editable controls | An observed field index, then a text helper supplies the value |
| `SELECT` | Native dropdown options | An element and option index pair |
| `DONE` | A control-flow decision | A separate verifier still needs to prove the outcome |
| `BLOCKED` | No supported safe progress | Control returns without inventing a selector |

This distinction matters. A flat action list allows the model to choose a target that is syntactically present but semantically incompatible with the selected operation. Jev constructs operation-specific target heads. A click decision sees click targets. A select decision sees observed options. The implementation also gives each observed node one stable index for the current snapshot instead of asking the model to invent a CSS selector or coordinate.

![Original diagram of Jev's indexed browser-agent decision loop from observed controls to operation and target heads, freshness checks, and a narrow text helper](/assets/img/posts/2026-09-20-jev-shrinks-browser-agent-decision-loop/jev-decision-loop.svg)

The README calls the target questions speculative because they are predicted in the same request even though only one operation will be executed. That looks wasteful until the alternative is a second network round trip after the operation choice. Jev pays for the speculative heads once, then validates only the head that the operation selected.

### The source code makes the boundary concrete

The pinned `model.py` is small enough to read end to end. Its `action_space()` function turns browser actions into three structures:

1. an indexed element table;
2. operation-specific target maps; and
3. explicit controls such as `DONE` and `BLOCKED`.

The `choose()` function sends the operation question and all target questions to the TypeSafe System One endpoint in one request. After the response arrives, `validate_choice()` checks that the selected choice exists, that the probability keys match the allowed IDs, that probabilities are finite and in range, and that they sum within the configured tolerance.

The important safety detail is easy to miss in a quick README read:

```python
if operation in targets:
    # Unused target heads cannot cause an action. Validate the head selected by the operation.
    target_answer = validate_choice(
        result["answers"].get(operation.lower() + "_target", {}),
        targets[operation],
    )
```

The executor does not trust every speculative answer just because it arrived in the JSON response. It validates the operation first, then validates only the corresponding target head.

That is the part I would carry into a production agent. The model output should be an input to a narrow validator, not a selector language. The browser executor should receive an already-observed node identity, not arbitrary JavaScript, a shell command, or a coordinate invented by the model.

The implementation also keeps text generation in a separate lane. If the chosen operation is `TYPE_TEXT`, `field_text()` requires a separate text-model key, sends the field context to an OpenAI-compatible endpoint, and accepts only a JSON object with one non-empty `text` string within the length limit. If the helper is missing or malformed, nothing is typed.

That separation is valuable because it prevents a text model from silently becoming the entire control policy. Jev chooses **which field**. The text helper supplies **what value** belongs there. Those are different failure domains.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-jev-shrinks-browser-agent-decision-loop/references/model-pinned-code.png" alt="Pinned Jev model.py source showing operation-specific target heads and selected-head validation">
  <figcaption>Pinned implementation capture showing the operation-specific target-head path discussed above. Source: <a href="https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py">https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py</a>. Publisher/creator: Browser Use contributors (browser-use/jev-ultrafast). License: <a href="https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE">https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE</a>. Attribution: Browser Use contributors, jev_ultrafast/model.py, pinned at commit 1231850a.</figcaption>
</figure>

### The visual demo is useful, but the measurement boundary matters more

The repository's Google Flights example is concrete: Zurich to London, one natural-language goal, actual text generation, loading waits, and a visible result. The current video completes that task in **7.073 seconds at 1x**.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-jev-shrinks-browser-agent-decision-loop/references/demo-first-frame.png" alt="First frame of the Jev Ultrafast Google Flights demo showing the browser task in progress">
  <figcaption>First frame extracted from the pinned Jev Ultrafast demo animation. Source: <a href="https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/demo.gif">https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/demo.gif</a>. Publisher/creator: Browser Use contributors (browser-use/jev-ultrafast). License: <a href="https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE">https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE</a>. Attribution: Browser Use contributors, Jev Ultrafast demo, pinned at commit 1231850a.</figcaption>
</figure>

The clock begins after initial page observation. It includes TypeSafe calls, generated text, browser work, stale decisions, and loading waits. It excludes initial navigation and the fresh independent verification that runs after the timed task. That is a reasonable task-time boundary, but it is not page-open-to-human-success latency.

The repository then provides a small matched comparison rather than only one showcase recording:

| Measure | Original runtime | Optimized runtime | What the result supports |
|---|---:|---:|---|
| Median task time | 9.450 s | 7.092 s | A 25.0% lower median on this task and setup |
| Median TypeSafe requests | 22 | 17 | Fewer requests in the matched comparison |
| Median browser protocol calls | 1,092 | 101 | Much less browser-protocol churn in this task |
| Verified runs | 3/3 | 3/3 | Both arms completed the small comparison |

The report says there were six alternating runs, one task, one existing Chrome profile, identical model settings, and the same result checker. The optimized runtime was faster in all three pairs. It also reports a two-sided sign-test p-value of **0.25** and explicitly calls three pairs too few for a strong statistical claim.

That caveat is not a footnote to hide. It is the result's correct size. We have evidence for a narrow controlled-input comparison. We do not have evidence for a universal browser-agent multiplier.

The recording reports **17 Jev requests**, ten interactions plus one explicit wait, and two helper calls. The two text calls cost **$0.00006272** through OpenRouter in that recording. The report is careful to say this is the text-helper charge, not the total task cost. TypeSafe usage includes token counts but no billed dollar amount in the report, and browser costs are excluded.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-jev-shrinks-browser-agent-decision-loop/references/flights-result.png" alt="Jev Ultrafast Google Flights result showing a Zurich to London search with visible flight options">
  <figcaption>Official result capture from the pinned Google Flights example. Source: <a href="https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/flights-result.png">https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/flights-result.png</a>. Publisher/creator: Browser Use contributors (browser-use/jev-ultrafast). License: <a href="https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE">https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE</a>. Attribution: Browser Use contributors, Jev Ultrafast, pinned at commit 1231850a.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-jev-shrinks-browser-agent-decision-loop/references/inspector.png" alt="Jev Ultrafast inspector showing indexed controls, operation probabilities, target probabilities, and executed actions">
  <figcaption>Official inspector capture showing the indexed-control and probability views. Source: <a href="https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/inspector.png">https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/inspector.png</a>. Publisher/creator: Browser Use contributors (browser-use/jev-ultrafast). License: <a href="https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE">https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE</a>. Attribution: Browser Use contributors, Jev Ultrafast, pinned at commit 1231850a.</figcaption>
</figure>

### What the benchmark does not cover

The report's limits are as important as its median. The DOM reader supports common HTML and ARIA controls, but it does not implement the full accessible-name specification or traverse shadow roots and frames. Canvas controls, uploads, pop-up tabs, nested scrolling, and arbitrary keyboard widgets remain outside this MVP.

There is also a semantic boundary around `DONE`. A model can select `DONE` with a valid probability distribution and still be wrong about the page. The README therefore requires independent outcome verification. In production, `DONE` is a proposed state transition, not a receipt.

This is the same evidence discipline I used in the [Orca telemetry audit](/posts/orca-telemetry-universal-claim-audit/): a universal safety or performance sentence should be decomposed into enumerable checks. A single green result is not allowed to speak for controls, pages, or workflows that were never in the measurement.

## The Jev Desktop adaptation is faster to understand than to overclaim

The second repository, Jev Desktop, brings the same shape into Codex Computer Use and native macOS apps. Its architecture is intentionally bounded:

```text
Codex scopes the goal and allowed actions
        ↓
Computer Use observes an accessibility snapshot
        ↓
Jev chooses an operation and compatible target
        ↓
local bridge validates the selected head
        ↓
Computer Use executes and re-observes
        ↓
Codex verifies the visible result
```

There are two strong choices here.

First, consequential controls such as send, publish, payment, deletion, upload, login, installation, or permission changes return to Codex instead of executing inside the fast loop. This keeps a decision accelerator from becoming an authorization system.

Second, prepared field values stay local. Jev Desktop selects a prepared slot for `TYPE_TEXT`; it does not call another text model to invent a value. That is a different trade-off from Jev Ultrafast's browser demo, where a small OpenAI-compatible helper generates field text. Neither is universally right. The correct choice depends on whether the caller already knows the value and whether generating it is part of the task.

The repository reports **123 offline automated tests** covering operation and target-head isolation, stale state, immutable session policy, bridge authentication, input limits, cancellation, sanitized failures, prepared-value locality, and independent verification.

The README is also unusually direct about performance: it **does not yet prove an end-to-end speedup**. The earlier runner already used one TypeSafe request per action, so the main possible gain is not automatically another round trip. In the measured samples, Computer Use observation remains the main latency source.

That is the sentence I would want more projects to write. A decision layer can improve structure, safety, and inspectability without having earned a speedup claim yet.

## 💡 Innovation: The production pattern is a validity budget

My read is that Jev's useful abstraction is a **validity budget**.

A browser agent does not need to reason over every action that a human could theoretically perform. It needs to choose from the actions that are valid for the current observed state, then prove that the selected action is still valid at execution time.

That maps cleanly onto game-production tools:

| Game or production surface | Jev-like boundary | Evidence needed before shipping |
|---|---|---|
| In-game admin panel | Enumerate visible controls and allowed operations | Control coverage, stale-state tests, permission tests |
| Unity or Godot editor assistant | Index current inspector fields and menus | Re-observation after selection, undo/rollback, modal coverage |
| QA reproduction harness | Choose only observed replay actions | Deterministic traces, failure classification, replay verification |
| Live-ops dashboard | Keep publish, delete, and payment outside the fast loop | Human authorization boundary and audit log |
| Localization tool | Let the model choose a field, keep approved text values local | Locale validation and no invented strings |

The design hypothesis is not that every game tool should call Jev. It is that **high-frequency low-consequence decisions should be separated from low-frequency high-consequence authority**.

That distinction helps avoid a common agent failure mode: improving the model's action selection while accidentally widening what the model is allowed to do. A faster click loop should not gain permission to publish a build, spend money, delete a save, or send a player-facing message.

The [Docbank audit](/posts/docbank-self-sovereign-documents/) makes a complementary argument at the data layer: an agent should not be asked to be careful with paths and revisions when the system can enforce stable identity and optimistic concurrency mechanically. Jev applies the same instinct to UI actions. Put the constraint in the interface between observation, decision, and execution.

### A bounded adoption checklist

If I were evaluating a Jev-like layer for an internal game tool, I would require these checks before discussing speed:

1. **Enumerate the action space.** Record which operations and target IDs are sent for each observed screen.
2. **Separate authority from selection.** Keep publish, delete, payment, upload, login, and permission changes outside the fast path.
3. **Validate selected heads only after routing.** Unselected speculative answers must be inert data.
4. **Re-observe before mutation.** Treat a stale indexed element as a normal recovery path, not an exceptional crash.
5. **Verify outcomes independently.** A selected `DONE` is not evidence that the goal is true.
6. **Measure the whole loop.** Report p50 and p95 task time, observation latency, model latency, browser protocol calls, retries, and verification time separately.
7. **Test hard surfaces.** Include frames, shadow roots, canvas, native menus, uploads, pop-up tabs, nested scroll regions, and permission-sensitive controls.
8. **Keep text generation explicit.** State whether field values are prepared, generated, or user-approved, and measure that cost separately.

The order matters. If the action-space and authority contracts are vague, a lower latency number only tells us that the agent can move faster inside an unclear box.

## 🎯 Key Takeaways

| Finding | What it actually means | What it does not mean |
|---|---|---|
| 7.073-second Flights recording | One dated task completed inside a declared timing boundary | A universal browser-agent speed promise |
| 9.450 s to 7.092 s median | A 25.0% lower median across three matched pairs per arm | A statistically strong general benchmark |
| 1,092 to 101 browser protocol calls | Less protocol churn in that matched task | The same reduction on canvas, frames, or arbitrary widgets |
| Operation-specific target heads | Fewer invalid choices reach the executor | A guarantee that the chosen action is correct |
| 123 Jev Desktop tests | Stronger offline coverage of the adapter's contracts | A controlled end-to-end speed comparison |
| Independent `DONE` verification | The system treats completion as a claim to check | A model confidence score becomes proof |

### Limitations and trade-offs

- **The sample is small.** Six alternating runs and three matched pairs per arm are useful engineering evidence, not a broad benchmark.
- **The web is live.** Network responses, routing, caches, browser version, and account state can affect the Flights result.
- **The supported UI surface is narrow.** Accessibility quality determines how much of the page can enter the indexed action space.
- **A smaller action space can hide missing actions.** Unsupported controls may produce `BLOCKED`, which is safer than guessing but still a product limitation.
- **The two repositories make different text choices.** Jev Ultrafast permits a separate helper model; Jev Desktop keeps prepared values local.
- **TypeSafe is a service dependency.** The loop needs endpoint availability, credentials, latency, and a clear data boundary.
- **Speed is not authority.** A fast selector should not be allowed to cross a consequential-action boundary.

## 🤔 New Questions

Jev makes the browser loop easier to reason about, but it also exposes the next research questions:

1. Does the protocol-call reduction survive pages dominated by shadow roots, frames, canvas, or nested scrolling?
2. How much of the 25% median comes from removing invalid decisions versus reducing DOM observation churn?
3. What happens to p95 latency when the TypeSafe endpoint is slow, rate-limited, or temporarily unavailable?
4. Can a game-editor adapter preserve stable element identity across inspector refreshes, modal dialogs, undo, and domain reloads?
5. When does the deterministic fast path beat Jev, and can the router prove that it chose the simpler path?
6. Can independent outcome verification be expressed as a reusable contract rather than a project-specific afterthought?

Those are better questions than "Is Jev 200 times faster?" They tell us what to measure before turning a clever decision layer into production authority.

## References

### Original discovery source

- [The supplied X post by goan999999](https://x.com/goan999999/status/2101284406359179732) - discovery lead and the source of the 20-200x / 40-400x promotional wording. The post is not treated as an independent benchmark, and its media is not reused here.

### Primary repository evidence

- [Browser Use Jev Ultrafast at pinned commit `1231850a`](https://github.com/browser-use/jev-ultrafast/tree/1231850a0bf1a0c0341fe408ef1668dbbfdfac46)
- [Jev Ultrafast README](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md)
- [Pinned performance report](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/performance.md)
- [Pinned `model.py` implementation](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py)
- [Browser Use MIT license](https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/LICENSE)

### TypeSafe documentation

- [TypeSafe introduction](https://docs.typesafe.ai/introduction)
- [TypeSafe speculative fan-out pattern](https://docs.typesafe.ai/patterns/fan-out)

### Community adaptation

- [Jev Desktop at pinned commit `9b02783e`](https://github.com/yikangy873-gif/jev-desktop/tree/9b02783ed96a81f2529827492de708ca1956c265)
- [Jev Desktop README](https://github.com/yikangy873-gif/jev-desktop/blob/9b02783ed96a81f2529827492de708ca1956c265/README.md)
- [Jev Desktop MIT license](https://raw.githubusercontent.com/yikangy873-gif/jev-desktop/9b02783ed96a81f2529827492de708ca1956c265/LICENSE)

### Related reading

- [Orca's privacy page survives 82 of its 83 telemetry events](/posts/orca-telemetry-universal-claim-audit/)
- [Docbank and the agent-ready document contract](/posts/docbank-self-sovereign-documents/)
