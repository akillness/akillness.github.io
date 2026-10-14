---
title: "SIMA 2's Self-Improvement Score Is Not a Game-QA Verdict"
description: "The SIMA 2 report separates held-out transfer, Gemini reward scores and manually guided progression. Those results answer different questions, not a game-QA verdict."
categories: [AI, Agents]
tags: [embodied-ai, game-qa, evaluation, self-improvement, gemini]
date: 2025-11-13 03:00:00 +0800
last_modified_at: 2026-10-14 16:39:00 +0900
archive_developed: 2026-10-14
archive_development_note: "Re-read SIMA 2 report 2512.04797v1 and the official launch page; separated later training from initial held-out transfer, distinguished evaluation protocols and removed unsupported integration examples."
published: true
mermaid: false
image_policy: source-first-fallback
image:
  path: /assets/img/posts/2025-11-13-sima-2-gemini-powered-ai-agent-3d-worlds/evaluation-namespaces.png
  alt: "Original schematic separating SIMA 2's task-setting, action, reward and later-training roles from its distinct evaluation protocols."
  credit: "Original illustration by akillness. A source-derived logical-role schematic, not source evidence or a measured result."
---

## Can an improving game agent also judge its own test?

An agent that gets better at playing a game is an exciting testing candidate. It is not automatically a trustworthy judge of whether the game is correct.

That distinction is where this SIMA 2 rebuild begins. The old note moved quickly from reasoning and self-improvement to production companions and procedural-level testing. Its conceptual Python wrapper even returned `'success': True` at the end of an action loop. Reaching the return statement did not establish that the requested task had been completed.

I re-read Google DeepMind's announcement and the version-pinned technical report instead of keeping that implied integration story. The useful finding is that **initial transfer, later self-improvement, and different forms of evaluation must remain separate**. Collapsing them into one “the agent succeeded” field would discard the conditions that make the reported result meaningful.

This is a source audit and a proposed way to read evaluation records. I did not run SIMA 2, train a game agent or measure defect detection.

## What changed since the November 2025 launch note?

There are three dates to keep straight:

| Evidence | Recorded date | What that date establishes |
| :--- | :--- | :--- |
| [Google DeepMind announcement](https://deepmind.google/blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/) | November 13, 2025 | The date on the official launch page |
| [arXiv 2512.04797v1](https://arxiv.org/abs/2512.04797v1) | December 4, 2025 | The public v1 submission date |
| [Linked technical-report PDF](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/SIMA_Tech_Report_2025.pdf) | December 5, 2025 | The date printed on its cover |

The arXiv record checked on **October 14, 2026** still lists v1 as its only version. I use that immutable version for the technical distinctions below. The announcement remains useful context, but its broad description is not a substitute for an experiment's protocol.

The report is later-dated evidence for this rebuild, not something I will label a November 13 paper. These public dates also do not tell me what material might have existed privately before submission. The original post date and route stay unchanged; the rebuild date identifies when this more precise account was added.

## Human gameplay precedes the self-generated experience

The report's model account is more specific than “Gemini powers the agent.” In **§3.3**, SIMA 2 starts from a **pretrained Gemini Flash-Lite checkpoint** and is supervised-finetuned on a mixture of gameplay and Gemini pretraining data. The gameplay-data discussion describes human demonstrations as the bulk of training data by volume, supplemented by generated annotations and bridging data. See [v1, pp. 7–9](https://arxiv.org/html/2512.04797v1).

That matters when reading the later self-improvement claim. An experiment that improves an existing agent without collecting additional human demonstrations has not shown that the agent never used human data.

I would keep two provenance fields in a proposed experiment record: **how the starting agent was trained** and **what new experience produced this improvement**. Neither should overwrite the other. Otherwise, “self-generated improvement data” can quietly turn into the much stronger and unsupported claim “human-free training.”

The same distinction applies to time. The report describes subsequent training iterations using collected experience. It does not establish an instant weight update during a player's current conversation, and I do not infer a deployment topology or a particular optimizer from that training narrative.

## ASKA is held out first, then used for improvement

The report identifies **ASKA and a subset of MineDojo as initially held-out environments**. Its initial online reinforcement-learning phase is limited to training environments and explicitly excludes those held-out environments. Later, **§4.5.1** studies self-improvement in ASKA. Those are different stages, not contradictory uses of “held out.” See [v1, §3.1.1, p. 10 and pp. 23–25](https://arxiv.org/html/2512.04797v1).

A first encounter can test transfer from earlier training. A later agent trained on its own experience in ASKA can test improvement in that environment. The latter should not be reported as if the agent still had no learning exposure to ASKA.

For a game-team experiment, my proposed labels would be `initial-held-out-transfer` and `post-improvement-in-environment`. They are editorial bookkeeping suggestions, not field names published by DeepMind. Their purpose is to make a comparison reject the wrong question before anyone draws a stronger conclusion from the score.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2025-11-13-sima-2-gemini-powered-ai-agent-3d-worlds/evaluation-namespaces.png" alt="Original schematic separating SIMA 2 task setting, acting, reward grading and later training from main human/programmatic evaluation, fixed ASKA tasks and manually guided progression.">
  <figcaption>Original illustration by akillness, authored as SVG and rendered to PNG. Logical roles and evaluation namespaces derived from the inspected report; not source evidence, deployment architecture, an API contract or measured results. Based on v1 §§3.4 and 4.5; the source chart is not reproduced.</figcaption>
</figure>

[Open the original SVG](/assets/img/posts/2025-11-13-sima-2-gemini-powered-ai-agent-3d-worlds/evaluation-namespaces.svg).

## Task setting and reward scoring are different jobs

The self-improvement section gives Gemini two distinct roles:

- A **Gemini-based task setter** proposes achievable tasks conditioned on the current situation.
- A separate **Gemini-based reward model** judges trajectory videos using a **0–100 rubric**.

For the purposes described in **§4.5**, a reward score of **50 or greater** is considered a success. The rubric was calibrated against a small dataset of human-preference pairs. Those details are reported in [v1, p. 23 and Figure 16](https://arxiv.org/html/2512.04797v1).

The word *calibrated* needs its object. Here, the report describes a rubric checked against human preferences. That is not a statement that a score of 50 means a 50% probability of task success. It is also not independent human or programmatic certification of every scored trajectory.

Keeping the task setter and judge separate clarifies their responsibilities, but separation of roles alone does not establish an independently validated game-QA oracle. A task can be useful for training while its reward still measures something different from the assertion a release test needs.

For example, “the agent appears to have built a shelter” and “the save/load path preserves the shelter's ownership and state” would be different proposed checks. The latter is my hypothetical QA example, not a SIMA 2 experiment in the report. A convincing gameplay video would not, by itself, supply that state-persistence evidence.

## Three evaluation namespaces, not one success column

A tempting shortcut is to describe every chart as another view of the same agent-success rate. The report supplies enough detail to avoid that shortcut.

| Reported protocol | What is evaluated | How the result is assessed | Keep out of its interpretation |
| :--- | :--- | :--- | :--- |
| Main embodied-task evaluation, **§3.4** | Task performance in the benchmark setting | Ground-truth/programmatic methods where applicable and human evaluation; human videos receive **five independent ratings** | Do not replace these methods with the self-improvement reward rubric |
| ASKA self-improvement, **Figure 15** | Improvement on a **fixed task set**, separated from automatic task setting | Gemini reward-model scores; the section uses **≥50** as its success threshold | Not an independently certified defect-detection result or first-time transfer after later ASKA training |
| ASKA tech-tree progression, **Figure 16** | Progress through milestones against game time | The improved agent is **manually instructed** to progress through the tech tree | Not the same protocol as the fixed-task score experiment, nor an unguided task-selection result |

Sources: [v1, pp. 10–11 and Figure 9](https://arxiv.org/html/2512.04797v1); [v1, §4.5.1 and Figures 15–16](https://arxiv.org/html/2512.04797v1). The table is my comparison of those protocols, not a new benchmark.

Even the comparison with a human reference in Figure 15 stays within its fixed-task reward-score setting. It should not become a claim about arbitrary human-level gameplay, release readiness or bug-finding coverage.

The correction cuts both ways. It would be equally inaccurate to say that *all* SIMA 2 evaluation is performed by a Gemini reward model. The main evaluation explicitly includes human and programmatic methods. A critique that erases those methods would make the source look weaker than the evidence supports.

## Genie 3 transfer has a defined split too

The Genie 3 self-improvement study makes another useful distinction: **urban environments are used for training**, while **natural environments and held-out tasks are used for testing**. The report discusses improvement in the training setting and transfer to that held-out test setting. See [v1, §4.5.2 and Figure 17, pp. 25–26](https://arxiv.org/html/2512.04797v1).

That is a concrete experimental split, not a promise that arbitrary generated worlds will behave the same way. I did not identify an independent evaluation judge in the inspected account of this experiment, so I do not add one to the description. This is a limit of what this audit established, not a claim that no such judge could exist elsewhere.

A proposed replication would need to preserve the world/task split and identify its judge separately. Reusing the broad phrase “generalizes to new worlds” without those two pieces would hide which form of novelty was actually tested.

## What I would record before calling this a QA result

The old wrapper's terminal success literal is useful audit material precisely because it is not evidence about DeepMind's implementation. The archived example's helper names were conceptual integration scaffolding. Its normal return path supplied a success value regardless of whether the final requested goal had been independently established. I inspected that code statically; I did not execute it as a real SDK.

Rather than replace it with another imaginary integration, I would start a game-testing design with this proposed record:

| Field to preserve | Question it should answer |
| :--- | :--- |
| Starting checkpoint and training stage | Was this initial transfer, or had improvement already used this environment? |
| World and task split | Which environment/task data was excluded, and until which stage? |
| Task provenance | Was the goal fixed, generated by a task setter or manually instructed? |
| Judge identity and evidence | Is this a programmatic assertion, a human rating or a model rubric? |
| Score definition and threshold | What does the number mean in this particular protocol? |
| Separate QA assertion | Which correctness property was actually checked, with what state or trace evidence? |

This is a **design proposal**, not an implemented harness or a measured improvement. It would make a training score easier to read without pretending to turn that score into a game-quality certificate.

The [multimodal scoring-contract audit](/posts/multimodal-sentence-transformers-practical-guide/) makes a related distinction: a score's definition is not evidence that an application threshold is calibrated. The [RAG versus Jev article](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/) separates ranking from the different downstream question of answerability. In this setting, gameplay progress and a QA verdict likewise answer different questions.

The official announcement's Responsible Development section and the report's conclusion describe a **limited research preview** for a small cohort of academics and game developers. That reported access description does not supply a public SDK or API contract. I did not verify a live account entitlement or a usable SIMA integration route in this audit.

## Key Takeaways

- SIMA 2's starting training includes human gameplay data; later improvement without additional human demonstrations is a narrower claim.
- Initial held-out transfer and performance after improvement in ASKA must remain separate stages.
- ASKA's **≥50 reward-rubric threshold** is not a probability statement or an independent game-QA verdict.
- Main task evaluation, fixed-task reward scores and manually guided tech-tree progression have different judges or protocols. Do not collapse their results.
- The useful game-testing takeaway is a proposed provenance record plus a separate correctness assertion, not an invented SDK or an unmeasured production benefit.

## New Questions

- How closely would a reward rubric track independently specified correctness assertions on the same gameplay trajectories?
- Which failure types would require hidden state, save/load inspection or engine instrumentation rather than video judgment?
- How would a replication preserve the distinction between first-time transfer and subsequent environment-specific learning?
- What independently documented access and integration contract would be needed before an actual game-team trial?

## References

### Research report and version history

- SIMA Team, Google DeepMind, [SIMA 2 technical report, arXiv 2512.04797v1](https://arxiv.org/abs/2512.04797v1). Submitted December 4, 2025; current record inspected for version changes. Read on 2026-10-14.
- [Version-pinned report HTML](https://arxiv.org/html/2512.04797v1): §§3.1.1, 3.3, 3.4 and 4.5; Figures 9 and 15–17. Read on 2026-10-14.
- [Official linked technical-report PDF](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/SIMA_Tech_Report_2025.pdf): cover dated December 5, 2025. Figure reuse was not cleared because the arXiv license indication and PDF rights notice were not resolved at asset scope. Read on 2026-10-14.

### Official announcement and access context

- Google DeepMind, [SIMA 2: An agent that plays, reasons, and learns with you in virtual 3D worlds](https://deepmind.google/blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/), November 13, 2025. Responsible Development and launch framing. Read on 2026-10-14.

### Audit trail and related analyses

- [The pre-rebuild archive at commit 28dcdccdd6e15362fa66e2518c399019c1120aa2](https://github.com/akillness/akillness.github.io/blob/28dcdccdd6e15362fa66e2518c399019c1120aa2/_posts/2025/11/2025-11-13-sima-2-gemini-powered-ai-agent-3d-worlds.md): the conceptual wrapper, not a DeepMind API implementation. Read on 2026-10-14.
- [Multimodal Sentence Transformers scoring and input contracts](/posts/multimodal-sentence-transformers-practical-guide/). Related distinction between a score definition and calibration. Read on 2026-10-14.
- [RAG versus Jev: ranking is not answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/). Related distinction between intermediate evidence and a downstream decision. Read on 2026-10-14.
