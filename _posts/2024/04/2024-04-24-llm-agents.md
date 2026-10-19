---
title: "Why LLM Agent Results Do Not Combine into One Score"
description: "An evidence audit of ReAct, Generative Agents, and a 2025 LLM-agent survey, showing why their task-specific results cannot be combined into one universal success score."
date: 2024-04-24 19:57:00 +0800
last_modified_at: 2026-10-19 20:11:00 +0900
categories: [AI, Agents]
tags: [llm-agents, agent-evaluation, benchmark, tool-use, multi-agent-systems]
mermaid: false
archive_developed: "2026-10-19"
archive_development_note: "Re-read ReAct v3, Generative Agents v2, and the LLM-agent survey v7; removed the unsupported cross-paper percentage chart and blanket 2026 sandbox/PRM claims; replaced the figure with an original benchmark-scope diagram."
correction_date: "2026-10-19"
correction_note: "Removed the unsupported 32/54/71/79/88% progression and causal claims; replaced the figure credited to arXiv:2309.07864v3 because no reuse permission was documented."
image:
  path: /assets/img/posts/2024-04-24-llm-agents/benchmark-scope.svg
  alt: "Diagram of the evidence fields needed to interpret an agent benchmark: task and environment, model and tools, baseline, metric, and protocol, alongside examples of distinct research outcomes."
---

## Can five agent percentages describe one improvement curve?

An earlier version of this post showed a chart rising from 32% for direct prompting to 88% for a multi-agent system. It also mentioned AgentBench and ToolBench, but never connected any bar to a dataset, model, baseline, trial protocol, or source. The post's own references did not trace the values to a reproducible experiment, so I removed the chart instead of trying to reverse-engineer it.

The replacement is narrower: I compare what three pinned research sources actually measure. **The key finding is that their results answer different questions, so they cannot be combined into one general “agent success rate.”** ReAct reports task-specific success-rate gains; Generative Agents studies believable behavior in a simulated town; and a later survey organizes the field and its evaluation strategies. None supplies a shared score scale for the other two.

*Originally published 2024-04-24. Re-audited on 2026-10-19 against arXiv:2210.03629v3, arXiv:2304.03442v2, and arXiv:2308.11432v7.*

> **Correction (2026-10-19).** The earlier chart's five percentages and the conclusion that each added architecture layer caused a predictable increase were not backed by the cited references. I removed them. I also replaced the reused figure credited to arXiv:2309.07864v3: its record showed only a non-exclusive license to distribute to arXiv, and no separate reuse permission was documented for this site.
{: .prompt-warning }

## What the cited sources actually evaluate

| Source and pinned version | Evaluation question | What the source reports | Boundary that matters |
| :--- | :--- | :--- | :--- |
| [ReAct, arXiv:2210.03629v3](https://arxiv.org/abs/2210.03629v3) | Can reasoning traces be interleaved with actions on language and interactive tasks? | The abstract reports that ReAct outperforms imitation and reinforcement-learning methods by an absolute success rate of 34% on ALFWorld and 10% on WebShop, respectively. | These are results for named tasks and comparisons, not a score for every agent or architecture. |
| [Generative Agents, arXiv:2304.03442v2](https://arxiv.org/abs/2304.03442v2) | Can language-model agents produce believable individual and social behavior in an interactive simulation? | The paper describes 25 agents in a small-town setting, with natural-language experience records, reflection, and retrieval for planning; its ablations find observation, planning, and reflection each contribute to believability. | Believability in this simulation is not general task-completion accuracy, and the paper's “sandbox” is a simulated town, not a security sandbox. |
| [A Survey on LLM-based Autonomous Agents, arXiv:2308.11432v7](https://arxiv.org/abs/2308.11432v7) | How can the field's construction approaches, applications, evaluation strategies, and open problems be organized? | The survey proposes a unified framework and reviews evaluation strategies across several application areas. The current arXiv record is version 7, revised 2025-03-02. | A synthesis of prior work is not a new controlled benchmark result or a single cross-paper success rate. |

This table is an evidence map, not a leaderboard. The measures differ in task, environment, comparison, and outcome. A number is interpretable only with the setup that produced it.

## ReAct's gains stay attached to its tasks and baselines

ReAct combines reasoning traces with actions, allowing an agent to use observations from the environment while solving a task. Its abstract states that on ALFWorld and WebShop, ReAct outperforms imitation and reinforcement-learning methods by an absolute success rate of 34% and 10%, respectively. That is useful evidence for those comparisons. It does not mean that adding a tool loop raises an arbitrary agent's success rate by the same amount, or that the reported gains transfer unchanged to a different model, prompt, tool set, or task.

The old chart erased those boundaries. Its bars implied a controlled sequence in which direct prompting became retrieval, then ReAct, then ReAct plus memory, then a multi-agent system. But the references did not show a single experiment that changed one component at a time across that sequence. Without a shared protocol, the apparent upward curve was not a measured effect.

## “Sandbox” in Generative Agents means a simulated world

Generative Agents describes an interactive environment inspired by The Sims, populated by 25 agents. The authors evaluate whether agents produce believable individual behaviors and emergent social interactions, and use ablations to examine the contribution of observation, planning, and reflection.

Here, **sandbox** names the simulation world in which the agents act. The abstract describes a simulated town and does not report an operating-system isolation mechanism or a security test. Calling this result evidence for secure code execution would exceed what the abstract supports. Runtime security claims need their own implementation-specific evidence.

## What changed since the original 2024 note

The current version of the LLM-agent survey is v7, revised on 2025-03-02. It remains a survey: it maps agent construction, applications, evaluation strategies, and open challenges. That update is useful context, but it does not turn the separate ReAct and Generative Agents evaluations into comparable measurements.

I also removed the previous draft's broad claims that modern runtimes universally use micro-VMs, that sandboxing completely neutralizes escape or prompt-injection risks, and that modern planners use process-reward models to verify every sub-step. Those claims require current, system-specific sources; the papers cited here do not establish them. This post now covers only what the pinned papers support, rather than presenting itself as a comprehensive 2026 survey.

## A practical checklist for reporting an agent result

The source comparison suggests a simple reporting rule: keep the conditions beside the number. For a benchmark result to be useful to another team, report at least:

1. **Task and environment:** the exact benchmark, version, and allowed state transitions.
2. **Model and agent configuration:** model snapshot, prompt, tools, memory, and orchestration components.
3. **Baseline:** which methods were compared and whether the comparison changes one component or the whole system.
4. **Metric:** success, believability, groundedness, or another outcome, with its unit and denominator.
5. **Protocol:** trial count, random seeds, stopping rules, retries, and uncertainty where available.
6. **Operational outcomes:** cost, latency, tool errors, recoveries, and safety failures, kept distinct from task success.

This checklist is a recommendation drawn from the differences among the sources, not a formal benchmark standard. It prevents a task-specific gain from being presented as a universal property of an architecture.

For implementation patterns, see the site's separate [agentic application design-patterns analysis](/posts/agentic-application-design-patterns/). For a broader field map, compare it with the separate [LLM-agent survey note](/posts/survey-on-llm-based-autonomous-agents/). They answer different questions from this benchmark-scope audit.

## Key Takeaways

- Do not compare agent percentages unless the task, model, baseline, metric, and protocol are aligned.
- ReAct's reported gains belong to ALFWorld and WebShop comparisons; Generative Agents evaluates believability in a particular simulation.
- The Generative Agents paper's “sandbox” is a simulated environment, not evidence of runtime isolation or security.

## New Questions

1. What minimum shared protocol would make results from interactive task benchmarks comparable across agent designs?
2. How should agent evaluations report retries, cost, latency, and safety failures without hiding them inside a single success rate?
3. Which parts of an agent system should be held constant when testing whether memory, planning, or tool use caused an improvement?

## References

- Yao, S. et al. (2023). *ReAct: Synergizing Reasoning and Acting in Language Models*. arXiv:2210.03629v3. https://arxiv.org/abs/2210.03629v3 (read 2026-10-19).
- Park, J. S. et al. (2023). *Generative Agents: Interactive Simulacra of Human Behavior*. arXiv:2304.03442v2. https://arxiv.org/abs/2304.03442v2 (read 2026-10-19).
- Wang, L. et al. (2025). *A Survey on Large Language Model based Autonomous Agents*. arXiv:2308.11432v7. https://arxiv.org/abs/2308.11432v7 (read 2026-10-19).
- Xi, Z. et al. (2023). *The Rise and Potential of Large Language Model Based Agents: A Survey*. arXiv:2309.07864v3. https://arxiv.org/abs/2309.07864v3 (the source of the removed figure; read 2026-10-19).
- arXiv.org. *Non-exclusive license to distribute*. https://arxiv.org/licenses/nonexclusive-distrib/1.0/license.html (read 2026-10-19). The page records a distribution license granted to arXiv; it was not treated as third-party figure-reuse permission.
