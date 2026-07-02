---
title: "Why AI Coding Agents Fail — and Why the Harness Matters More Than the Model"
description: "Engineering Discipline is an open-source harness for AI coding agents that adds clarification, complexity routing, worker-validator separation, checkpoint recovery, implementation guardrails, and AI code cleanup."
categories: [AI, Agents, Developer-Tools]
tags: [AIEngineering, CodingAgent, OpenSource, ClaudeCode, DeveloperTools, SoftwareEngineering, AIHarness, Codex, Cursor, GeminiCLI]
date: 2026-04-02 10:00:00 +0900
pin: false
mermaid: false
math: false
image:
  path: "https://opengraph.githubassets.com/06b3d92437a4a53267c8c28d9741fd0021b2a33d7f9e84c55747d685ced1f7db/tmdgusya/engineering-discipline"
  alt: "Engineering Discipline GitHub preview"
---

## 🤔 Curiosity: Why do we still route everything through one LLM?

AI coding agents usually fail for a simple reason.

They start writing code before they actually understand what they are supposed to build.

Give an agent a vague prompt like “build this,” and it often follows the same pattern. It starts coding immediately, fills the missing requirements with guesses, and then keeps patching those guesses when reality pushes back.

If the guess is wrong, it rolls back.
Then it guesses again.
Then it breaks something else.
Then it spends more context trying to explain its own confusion.

That loop is what kills long-running agent sessions.

The real problem is not just weak code generation. It is premature execution under ambiguity.

That is exactly the problem I built `engineering-discipline` to solve: an open-source skill set for making AI coding agents behave less like overeager autocomplete systems and more like disciplined engineers.

A second problem hides underneath the first one.

We still route too much work through one model, one pass, and one execution stream. But real software delivery is not one thing. It is clarification, planning, implementation, review, recovery, and cleanup. Treating all of that as a single uninterrupted LLM monologue is exactly how you get fragile output and collapsing context.

---

## 📚 Retrieve: What engineering-discipline actually does

`engineering-discipline` is built around one core idea:

Do not let the agent improvise its way into a broken implementation loop.

Instead, force structure into the workflow before, during, and after code generation.

### 1) Clarification before code

Before the agent writes a single line of code, it goes through a clarification phase.

This is not a one-shot prompt rewrite. It is an iterative Q&A loop that removes ambiguity while also exploring the codebase in parallel.

That parallel codebase exploration matters. Requirement clarification without understanding the repository is incomplete, because what the user wants and what the codebase can support are often not the same thing.

#### Concrete example

A user says:

> Add authentication.

A weak agent immediately starts inventing answers to questions nobody settled:

- JWT or session?
- login only or signup too?
- role support?
- refresh tokens?
- route-level protection?
- database migration needed?

A disciplined system slows down and resolves:

- which auth model is actually required,
- what patterns already exist in the codebase,
- which routes are in scope,
- whether backward compatibility matters,
- and what must not be touched.

That difference alone eliminates a huge amount of wasted execution.

### 2) Automatic complexity routing

Once the task becomes clear, the system automatically evaluates complexity and routes the job differently depending on what kind of work it is.

Simple tasks go through:

`plan → execute → review`

Complex tasks go through:

`milestone planning → DAG decomposition → long-run execution`

This matters because one of the biggest mistakes in agent design is treating all tasks the same way.

A small bug fix and a multi-phase architectural change should not use the same orchestration logic.

In `engineering-discipline`, if a task is simple, it stays lightweight. If it is complex, it gets broken into milestone dependencies and executed as a longer-running structured workflow.

That is not process theater. That is matching workflow shape to problem shape.

### 3) Worker-validator separation

This is one of the most important parts of the whole design.

The agent that writes the code and the agent that validates the result are separated.

And the validator does not get the worker’s execution history.

It only sees:

- the plan,
- and the codebase itself.

That information isolation matters for the same reason human code review matters.

A reviewer who watched every implementation decision is more likely to sympathize with the author’s reasoning. A reviewer who comes in cold is much more likely to evaluate the result on its actual merits.

That is the structure `engineering-discipline` tries to create.

The validator is not asked:

> Did the worker’s process make sense?

It is asked:

> Does this code actually satisfy the plan and hold up under inspection?

That is a much healthier review boundary.

### 4) Checkpoint-based recovery

Long-running agent workflows often fail in the most wasteful way possible: one problem late in the run causes the whole thing to restart from the beginning.

That is expensive, fragile, and unnecessary.

`engineering-discipline` adds checkpoints at the milestone level. If execution fails, the system restarts from the relevant checkpoint instead of replaying the entire task.

#### Concrete example

Imagine a feature broken into four milestones:

- define schema changes,
- implement backend endpoints,
- wire frontend integration,
- validate end-to-end behavior

If the last phase fails because one UI assumption was wrong, there is no reason to regenerate the earlier milestones from scratch.

Checkpointed recovery protects both context and cost. More importantly, it makes long-horizon execution feel like engineering instead of roulette.

### 5) Implementation discipline

Another common failure mode in AI coding agents is not lack of capability. It is lack of restraint.

The agent notices something nearby and thinks:

> While I’m here, I should clean this up too.

That instinct destroys long-running work.

`engineering-discipline` uses a Karpathy-style guardrail layer that forces the agent to:

- read the existing code before modifying it,
- stay within the requested scope,
- avoid speculative cleanup,
- and resist touching unrelated code just because it looks suboptimal.

That sounds simple, but it matters a lot.

A huge amount of agent failure comes from unearned expansion: not solving the requested problem, but wandering into adjacent problems.

Humans do this too. Good engineers learn not to.

Agents need the same discipline.

### 6) AI code smell cleanup without behavioral drift

The final layer is `Clean AI Slop`.

This targets the recognizable smell of AI-generated code:

- excessive comments,
- unnecessary abstractions,
- paranoid error handling for impossible states,
- filler structure,
- verbose naming,
- and defensive scaffolding that exists mostly because the model wanted to sound careful.

The important part is how cleanup happens.

Not through one giant rewrite, but through category-specific passes, with tests run after each pass so behavior does not change.

That is the right way to clean AI-generated code.

One smell at a time.
One pass at a time.
One verification loop at a time.

It is slower than “rewrite everything,” but much safer. And safety is the point.

---

## 🖼️ Source Image

![Engineering Discipline GitHub preview](https://opengraph.githubassets.com/06b3d92437a4a53267c8c28d9741fd0021b2a33d7f9e84c55747d685ced1f7db/tmdgusya/engineering-discipline)

---

## 💡 Innovation: The harness matters more than the model

The most interesting thing about `engineering-discipline` is not just that it creates more process.

It is that stronger process seems to improve performance across models.

The harness was originally tuned for Minimax, but it ended up working even better when paired with Codex or Opus.

That is the real signal.

If a model swap improves outcomes because the discipline layer is strong, then the model is not the full story.
The harness is.

That cuts against how a lot of people still think about AI engineering.

Many teams are still treating model choice as the main lever:

- upgrade the API,
- switch providers,
- pick the current leaderboard winner,
- and hope reliability improves automatically.

Sometimes it does.
Often it doesn’t.

Because a weak harness wastes a strong model.

A strong harness, on the other hand, can make multiple models perform better by reducing the failure modes that matter most:

- ambiguity,
- scope drift,
- self-validating execution,
- full-restart recovery,
- and AI-generated code bloat.

That is why I think the bigger lesson here is not “use this exact stack.”

It is this:

> The future of coding agents is not “let the AI figure it out.” It is “make the AI work under engineering discipline.”

That is a much better direction.

### A simplified mental model

```python
def run_task(request, codebase):
    brief = clarify(request, codebase)
    route = assess_complexity(brief)

    if route == "simple":
        plan = craft_plan(brief)
        result = execute_with_worker(plan, codebase)
        review = validate_independently(plan, codebase)
        cleaned = clean_ai_slop(result)
        return finalize(cleaned, review)

    if route == "complex":
        dag = build_milestone_dag(brief)
        state = load_or_create_checkpoint_state(dag)

        for milestone in next_ready_milestones(state):
            plan = craft_plan(milestone)
            result = execute_with_worker(plan, codebase)
            review = validate_independently(plan, codebase)
            cleaned = clean_ai_slop(result)
            save_checkpoint(milestone, cleaned, review)

        return assemble_final_result(state)
```

This is not the literal implementation. It is the operational idea.

And that idea is the real product.

---

## Final Thoughts

AI coding agents do not fail only because they hallucinate.

They fail because we let them execute before understanding, modify code without enough context, validate their own work with too much self-knowledge, and restart entire workflows when only one phase failed.

`engineering-discipline` treats those as workflow failures, not just model failures.

And that is the right diagnosis.

If this pattern spreads, the best coding agents will not be the ones that generate the flashiest first draft. They will be the ones that:

- clarify before acting,
- route tasks by complexity,
- separate execution from validation,
- recover from checkpoints,
- enforce scope discipline,
- and clean generated code without changing behavior.

That is not magic.
It is engineering.
And that is exactly why it works.

---

## Sources

- Project link: <https://lnkd.in/gESjBvj3>
- GitHub: <https://github.com/tmdgusya/engineering-discipline>
