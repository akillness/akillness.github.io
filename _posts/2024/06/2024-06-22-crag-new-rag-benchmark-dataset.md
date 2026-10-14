---
title: "CRAG Two Years On: The RAG Benchmark That Scores Silence Above a Wrong Answer"
description: "Meta's CRAG re-read at arXiv v2 and its pinned repository: how the 1/0/−1 truthfulness score works, why plain RAG raised accuracy but cut truthfulness, and what KDD Cup changed."
categories: [AI, Research]
tags: [rag, benchmark, crag, evaluation, hallucination, knowledge-graph, kdd-cup]
date: 2024-06-22 19:10:00 +0800
last_modified_at: 2026-10-14 13:10:00 +0900
archive_developed: "2026-10-14"
archive_development_note: "Rebuilt from a June 2024 summary of a social-media post. I re-read the CRAG paper at arXiv v2 (1 November 2024), the facebookresearch/CRAG repository at commit ad15188 (README, docs/dataset.md, CC BY-NC 4.0 license), the KDD Cup 2024 winning-solution paper, and the CRAG-MM challenge and repository pages. Every number below is quoted with its table and scope; the old invented diagram and the Korean translation block were removed."
published: true
---

## What does a RAG system lose by answering when it should not?

The 2024 version of this note repeated three numbers from a LinkedIn summary: advanced LLMs score under 34% on CRAG, straightforward RAG reaches 44%, and the best industry systems answer 63% of questions without hallucination. All three are in the paper. What the summary dropped is the part that makes CRAG different from every accuracy leaderboard before it: a wrong answer costs a point, a missing answer costs nothing, and once you score that way the "44%" story reverses. Straightforward RAG raised accuracy and lowered truthfulness at the same time, because retrieval brought in more hallucinations than it fixed.

This rebuild re-reads [CRAG: Comprehensive RAG Benchmark](https://arxiv.org/abs/2406.04744v2) (Yang, Sun, Xin et al., Meta Reality Labs, FAIR and HKUST; arXiv v2 dated 1 November 2024, published in the NeurIPS 2024 Datasets and Benchmarks track) together with the repository at commit `ad15188`, and then follows what happened to the benchmark through the KDD Cup 2024 results and the multimodal successor that ran as KDD Cup 2025.

## What CRAG actually contains at the pinned repository

CRAG is a factual question-answering set with a simulated retrieval environment attached. The paper's own tables give the shape of the data.

| Dimension | Content | Where it is defined |
|---|---|---|
| Size | 4,409 question–answer pairs | Paper abstract; Table 3 totals |
| Domains | Finance 1,039 · Movie 1,125 · Sports 833 · Open 788 · Music 624 | Paper Table 3 |
| Question types | Simple (1,205), simple with condition (689), set, comparison, aggregation, multi-hop, post-processing-heavy, false premise | Paper Table 4 and the type definitions |
| Dynamism | Real-time 437 (10%) · fast-changing 564 (13%) · slow-changing 1,007 (23%) · static 2,401 (54%); Finance holds 434 of the 437 real-time questions | Paper Table 3 and Table 7 |
| Popularity | `head`, `torso`, `tail` label per question | `docs/dataset.md` schema |
| Web retrieval | Up to 50 full HTML pages per question from the Brave Search API, each with name, URL, snippet, HTML and last-modified time; `k=5` for Task 1, `k=50` for Task 3 | Paper §3 and A.1.6; `docs/dataset.md` |
| Structured retrieval | Mock knowledge graphs with 2.6 million entities behind mock APIs | Paper §3 |
| Query time | A `query_time` field records when the question and search happened, so time-sensitive answers are judged at that moment | `docs/dataset.md` |
| Splits | Validation 30%, public test 30%, private test 40%; the released validation plus public test is 2,706 examples | Paper A.2.3 |
| Licence | Creative Commons Attribution-NonCommercial 4.0 | `LICENSE` at commit `ad15188` |

The three tasks stack on each other. Task 1 (retrieval summarization) hands the system five pages that are "likely, but not guaranteed, to be relevant". Task 2 adds the mock KG APIs. Task 3 keeps the APIs and widens the web candidates to 50 pages, so it also tests ranking under noise. The paper estimates web recall at about 69% for the top five pages and 85% for all 50, using Llama 3 70B as the judge of whether a page is sufficient, which means that for a sizeable share of Task 1 questions the correct behaviour is to say that the answer is not in the provided context.

## The score that penalizes a confident wrong answer

Human evaluation grades each answer as perfect, acceptable, missing or incorrect. Automatic evaluation collapses the first two into "accurate" and scores accurate as 1, missing as 0 and incorrect as −1; the average over the evaluation set is the system's **truthfulness**. The paper's auto-eval is a two-step rule: an exact match counts as accurate, otherwise two LLM judges (gpt-3.5-turbo-0125 and llama-3-70B-instruct) each classify the response and the reported numbers are the average of the two. Against human grading the paper reports an F1 of 94.7% for the ChatGPT judge and 98.9% for the Llama 3 judge.

With that scoring in hand, Table 5 of the paper reads very differently from the three-number summary:

| Setting | Model | Accuracy | Hallucination | Missing | Truthfulness (auto-eval) |
|---|---|---|---|---|---|
| LLM only | GPT-4 Turbo | 33.5 | 13.5 | 53.0 | 20.0 |
| LLM only | Llama 3 70B Instruct | 32.3 | 28.9 | 38.8 | 3.4 |
| Task 1 (5 pages) | GPT-4 Turbo | 35.9 | 28.2 | 35.9 | 7.7 |
| Task 2 (5 pages + KG) | GPT-4 Turbo | 41.3 | 25.1 | 33.6 | 16.2 |
| Task 3 (50 pages + KG) | GPT-4 Turbo | 43.6 | 30.1 | 26.3 | 13.4 |
| Task 3 (50 pages + KG) | Llama 3 70B Instruct | 40.6 | 31.6 | 27.8 | 9.1 |

GPT-4 Turbo without retrieval declined to answer more than half the questions and hallucinated on 13.5%; that caution is why its truthfulness (20.0) is the best row in the table. Give the same model fifty pages and a knowledge graph and accuracy climbs to 43.6%, but hallucination more than doubles to 30.1% and truthfulness falls to 13.4. The paper states the conclusion plainly: none of the straightforward RAG solutions reach a truthfulness above 20%, "because all RAG solutions introduce more hallucinations generated from irrelevant retrieval results". The 44% accuracy figure that travelled through social media was the headline of a result whose point was the opposite.

That is the same distinction this site drew in the [RAG vs. Jev + RAG analysis](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/): a well-ranked passage is not evidence that the question is answerable from it, and a pipeline that cannot say "not in context" converts retrieval noise into confident errors.

## What the industry systems scored, and what "63%" meant

Table 6 of the paper evaluates five consumer products by human grading, with questions equal-weighted across categories and, separately, weighted by estimated traffic.

| System (equal-weighted) | Perfect | Acceptable | Hallucination | Missing | Truthfulness (human) | Latency (ms) |
|---|---|---|---|---|---|---|
| Copilot Pro | 62.6 | 11.7 | 17.9 | 7.8 | 50.6 | 11,596 |
| Gemini Advanced | 60.8 | 10.1 | 16.6 | 12.5 | 49.3 | 5,246 |
| ChatGPT Plus | 59.8 | 13.3 | 25.0 | 1.9 | 41.5 | 6,195 |
| Meta SG | 52.5 | 9.7 | 16.0 | 21.8 | 41.4 | 3,431 |
| Perplexity.ai | 55.8 | 8.8 | 25.3 | 10.1 | 34.9 | 4,634 |

So "63% without hallucination" is the perfect-answer rate of the best system on the equal-weighted set (70.0% on the traffic-weighted one), with a truthfulness of 50.6 once its 17.9% hallucinations are subtracted. The row that should worry a product team is ChatGPT Plus: the lowest missing rate in the table (1.9%) bought with the second-highest hallucination rate (25.0%), which is exactly the trade CRAG's score was designed to expose. The latency column is also worth keeping: the best-scoring system was the slowest, at 11.6 seconds per answer, and no product was under three seconds.

## What changed since 2024: KDD Cup results, NeurIPS, and CRAG-MM

The benchmark was built to run a competition, and the competition results are the most useful follow-up. In the KDD Cup 2024 Meta CRAG Challenge every query carried a 30-second time budget, Stage 1 used auto-eval on the public set, and Stage 2 re-graded the top teams by hand on the 40% private split. Team db3 from Peking University took first place in all three tasks with scores of 28.4%, 42.7% and 47.8%, using a tuned LLM for answer generation and a regularized API set for the knowledge-graph tasks; team APEX placed second on Tasks 2 and 3. Read against Table 5, the winning Task 3 score of 47.8 is a truthfulness-style number well above the 13.4 that straightforward GPT-4 Turbo RAG managed, which is the clearest evidence in the record that abstention policy and retrieval filtering, not model size, moved the benchmark.

| Milestone | Date | What it established | Source |
|---|---|---|---|
| KDD Cup 2024 CRAG Challenge | Winners announced 26 August 2024 | Three tasks, 30 s per query, $31,500 prize pool; db3 first on all tasks (28.4 / 42.7 / 47.8) | AIcrowd announcement; db3 paper |
| Paper v2 | 1 November 2024 | NeurIPS 2024 Datasets and Benchmarks track; Tables 5–6 as quoted above | arXiv 2406.04744v2 |
| Repository migration | Created 8 March 2024; last push 14 June 2025 (a one-line edit to the popularity definition) | Data, mock APIs, `local_evaluation.py`, three baselines; CC BY-NC 4.0 | `facebookresearch/CRAG` at `ad15188` |
| CRAG-MM / KDD Cup 2025 | Challenge Jan–Aug 2025; repository created 30 September 2025; paper arXiv 2510.26160 | Multimodal, multi-turn successor built on egocentric images from Ray-Ban Meta glasses, 13 domains; the challenge page counted 5k images including 3k egocentric, the later repository README counts 6.2K egocentric images | `kddcup25.github.io`; `facebookresearch/CRAG-MM` |

Two details in that table are practical rather than historical. The repository has been quiet since the migration: the last merge, on 14 June 2025, is a one-line rewording of the `popularity` definition in `docs/dataset.md`, and the data files still carry the `v4` suffix from the competition era. Anyone benchmarking against CRAG in 2026 is therefore using the 2024 question set with its 2024 `query_time` stamps, which is fine for the static majority and increasingly hard to interpret for the 23% of questions that are real-time or fast-changing. And the CC BY-NC 4.0 licence means the question set and the mock APIs can be used to evaluate an internal system, but not redistributed inside a commercial product or a paid evaluation service without a separate agreement.

## How to use CRAG's scoring on your own retrieval stack

I did not run `local_evaluation.py` for this rebuild; the steps below are read from the paper and the repository, not from a reproduction.

- **Adopt the 1/0/−1 score before adopting the data.** The scoring rule is the transferable part. A retrieval system for game-design documents or support tickets can be graded the same way on a few hundred hand-labelled questions, and the "missing" column will tell you whether your abstention path works at all.
- **Report hallucination and missing separately from accuracy.** Table 5 shows why: two systems with the same accuracy can differ by a factor of six in truthfulness. Any dashboard that shows only accuracy is hiding the number CRAG was built to surface, which is the same provenance problem this site found in the [Moli benchmark audit](/posts/moli-benchmark-provenance-audit/), where a single headline figure blended runs its own bench kept apart.
- **Grade time-sensitive questions at `query_time`.** 23% of CRAG is slow-changing and 23% is real-time or fast-changing; the ground truth was fixed at the moment of the search. Your own evaluation set needs the same timestamp discipline or the "wrong" answers will include answers that were right when asked.
- **Slice by popularity and dynamism.** The paper reports much lower accuracy on long-tail entities and fast-changing facts; a system that looks fine on the head of the distribution can be unusable on the tail your users actually hit.
- **Budget latency with the score.** The industry table pairs its best truthfulness with the worst latency. If the product has a time budget like the competition's 30 seconds, measure under it.

## Key Takeaways

- CRAG scores accurate answers +1, missing 0, incorrect −1; the average is truthfulness, and that is the number the benchmark exists to measure.
- In the paper's own Table 5, GPT-4 Turbo without retrieval reaches 20.0 truthfulness while the full 50-page RAG setting falls to 13.4, because hallucination rises from 13.5% to 30.1% as accuracy rises from 33.5% to 43.6%.
- The "63%" industry figure is Copilot Pro's perfect-answer rate; its truthfulness is 50.6 and its latency 11.6 seconds.
- KDD Cup 2024's winner reached 47.8 on Task 3 under a 30-second budget, far above the straightforward baselines, by changing abstention and retrieval policy rather than the model.
- The dataset and mock APIs are CC BY-NC 4.0, the repository's only 2025 change was a one-line documentation edit, so the question set is still the 2024 release; the multimodal successor CRAG-MM ran as KDD Cup 2025.

## New Questions

- How much of db3's gain came from the tuned model refusing more often, and how much from better page filtering? The winning paper reports the scores, not the missing-rate breakdown.
- Does the two-judge auto-eval still agree with human grading at 94–99% F1 for answers produced by 2026 models, which are far more fluent at confident wrong answers than the 2024 baselines?
- What does a truthfulness-style score look like for a multi-turn assistant, where a wrong answer in turn one contaminates turn two? CRAG-MM's multi-turn set is the first public attempt to measure that.
- For a game studio's internal RAG over design documents, what is the right penalty ratio? CRAG's −1 for a wrong answer assumes a consumer trust model that may be too lenient for pipelines whose answers are executed by tools.

## References

Read on 2026-10-14.

**Paper**

- [CRAG – Comprehensive RAG Benchmark, arXiv:2406.04744v2](https://arxiv.org/abs/2406.04744v2), Xiao Yang, Kai Sun, Hao Xin, Yushi Sun et al.; v2 dated 1 November 2024; [NeurIPS 2024 Datasets and Benchmarks Track](https://proceedings.neurips.cc/paper_files/paper/2024/hash/1435d2d0fca85a84d83ddcb754f58c29-Abstract-Datasets_and_Benchmarks_Track.html). Numbers used: Tables 3–7, §4 (metrics and evaluation), A.1.6, A.2.3.

**Repositories (pinned)**

- [facebookresearch/CRAG at ad151888](https://github.com/facebookresearch/CRAG/tree/ad1518887dd4d9ebcd7de95388c7a62751e7705c): README, [docs/dataset.md](https://github.com/facebookresearch/CRAG/blob/ad1518887dd4d9ebcd7de95388c7a62751e7705c/docs/dataset.md), [LICENSE (CC BY-NC 4.0)](https://github.com/facebookresearch/CRAG/blob/ad1518887dd4d9ebcd7de95388c7a62751e7705c/LICENSE). GitHub API metadata on 2026-10-14: 307 stars, 4 open issues, last push 2025-06-14.
- [facebookresearch/CRAG-MM at 36b6b4bc](https://github.com/facebookresearch/CRAG-MM/tree/36b6b4bcd5405b440d9f0f6d74cef6f2fcace2be): CRAG-MM dataset access and evaluation; paper [arXiv:2510.26160](https://arxiv.org/abs/2510.26160).

**Competition record**

- [Winning Solution For Meta KDD Cup '24, arXiv:2410.00005v1](https://arxiv.org/html/2410.00005v1), Xia, Chen, Gao (team db3): first place on all three tasks with 28.4%, 42.7%, 47.8%; 30-second query budget.
- [Revisiting the Solution of Meta KDD Cup 2024: CRAG, arXiv:2409.15337](https://arxiv.org/abs/2409.15337), team APEX: second on Tasks 2 and 3.
- [KDD Cup 2024 CRAG challenge announcement (AIcrowd forum, 14 February 2024)](https://discourse.aicrowd.com/t/welcome-to-kdd-cup-2024-crag-comprehensive-rag-benchmark-challenge/9554): prize pool and timeline.
- [Meta CRAG-MM Challenge 2025 workshop page](https://kddcup25.github.io/index.html): image counts, domains, KDD Cup 2025 dates.
