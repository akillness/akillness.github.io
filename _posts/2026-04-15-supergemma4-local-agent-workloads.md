---
title: "SuperGemma4: A Faster, Sharper Gemma 4 for Local Agent Workloads"
description: "A practical review of SuperGemma4, the Apple Silicon MLX-tuned Gemma 4 26B variant that improves coding, logic, browser tasks, Korean prompts, and local agent responsiveness."
categories: [AI, Local-LLM, Developer-Tools]
tags: [supergemma4, gemma4, mlx, apple-silicon, local-llm, agents, korean, coding, hugging-face]
date: 2026-04-15 09:00:00 +0900
pin: false
mermaid: false
math: false
image:
  path: "https://cdn-thumbnails.huggingface.co/social-thumbnails/models/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2.png"
  alt: "SuperGemma4 model card social preview"
---

## 🤔 Curiosity: What if the best local Gemma 4 experience is not the official one, but the one tuned for actual agent work?

A lot of open-weight model releases still hide the real trade-off.

You get the official checkpoint, the benchmark slide, the multimodal headline, and the usual language about capability. Then you actually try to use it locally and discover the more important questions:

- Does it feel fast enough to stay in the loop?
- Does it survive code generation and tool-style prompting?
- Does it hold up in Korean, not just English?
- Does it stay useful when you push it through browser tasks, planning, and agent workflows?

That is why SuperGemma4 is more interesting than a normal fine-tune announcement.

This release is based on Google’s Gemma 4 26B IT, but the pitch is much more practical than abstract. The author is not claiming a brand-new foundation model. The claim is simpler and, honestly, more valuable for builders: this version is faster on the same Apple Silicon machine, stronger on real local tasks, and still stable while preserving its uncensored identity.

That matters because local model users do not need another generic “open model is amazing” headline. They need a model that can actually sit inside their workflow and not become the bottleneck.

---

## 📚 Retrieve: What SuperGemma4 is actually shipping

According to the Hugging Face model card, `Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2` is:

- based on `google/gemma-4-26B-A4B-it`
- released in MLX 4-bit format
- sized for roughly 13 GB locally
- tuned for Apple Silicon workloads
- positioned as a fast text-only flagship rather than a multimodal model

The model card’s framing is direct: this is the version to run if you want the fast line instead of the multimodal line.

### Headline numbers

The strongest part of the release is that the gains are not limited to one cherry-picked metric.

- Quick bench overall: `91.4 → 95.8` (`+4.4`)
- Average generation speed: `42.5 tok/s → 46.2 tok/s` (`+8.7%`)

And the category gains line up with the tasks that usually determine whether a local assistant is actually usable:

- Code: `92.3 → 98.6` (`+6.3`)
- Browser: `87.5 → 89.6` (`+2.1`)
- Logic: `86.9 → 95.2` (`+8.3`)
- System Design: `97.8 → 98.9` (`+1.1`)
- Korean: `90.7 → 95.0` (`+4.3`)

That distribution is what makes the release notable.

This is not just a claim that the model became “better” in some vague leaderboard sense. It claims improvements exactly where local agent systems tend to get exposed:

- writing and refactoring code,
- following multi-step instructions,
- handling browser/tool-oriented prompts,
- producing coherent Korean outputs,
- and staying responsive enough to keep humans in the loop.

### Why the “fast” identity matters

The model card explicitly says this is the fast text-only line.

That is a smart product decision.

For many local workflows, especially on Apple Silicon, lower latency is not just a nice optimization. It changes whether the model feels deployable. A model that answers well but takes too long gets removed from the loop. A model that responds faster, even with only a modest speed gain on paper, often feels dramatically better in daily use.

### Recommended serving path

The model card recommends a very simple launch path:

```bash
mlx_lm.server \
  --model Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2 \
  --port 8080
```

The important operational note is that `mlx_lm.server` should auto-detect the bundled chat template. The author explicitly warns against passing a literal `--chat-template` path in the wrong launch flow, because that can corrupt responses.

That detail is more important than it looks.

A lot of local-model complaints get blamed on weights when the actual issue is serving configuration. Here, the model card is unusually explicit about the difference.

### Quick local test

The model card also provides a simple generation example:

```bash
mlx_lm.generate \
  --model Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2 \
  --prompt "Write a Python function that returns prime numbers up to n." \
  --max-tokens 512
```

If you want to treat it like a local OpenAI-compatible model inside a tool loop, the client shape is straightforward:

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8080/v1", api_key="not-needed")

resp = client.chat.completions.create(
    model="Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2",
    messages=[
        {"role": "system", "content": "You are a concise coding and automation assistant."},
        {"role": "user", "content": "Write a Python function that returns prime numbers up to n."}
    ],
    temperature=0.2,
)

print(resp.choices[0].message.content)
```

That matters because a local model becomes much more useful once it can drop into an existing OpenAI-style app stack without custom glue everywhere.

---

## 🖼️ Source Images

### Hugging Face social preview

![SuperGemma4 social preview](https://cdn-thumbnails.huggingface.co/social-thumbnails/models/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2.png)

This image is not just decorative. It points to the actual release artifact and keeps the post anchored to the official source rather than only to a secondary summary.

---

## 💡 Innovation: Why SuperGemma4 matters for local AI builders

What makes SuperGemma4 interesting is not just that it is uncensored.

Plenty of “uncensored” models exist. Many of them are unstable, noisy, or only good at generating the kind of outputs that make for viral screenshots but not reliable workflows.

The stronger claim here is different:

> preserve uncensored behavior without sacrificing coding, tool use, logic, browser prompts, or Korean stability.

If that holds up in broader usage, that is a better direction for local open models.

### 1) This is a model shaped around real local agent workloads

Imagine a small assistant running on a Mac mini or MacBook that needs to:

1. read a bug report,
2. propose a fix plan,
3. generate a patch,
4. write a browser automation step,
5. summarize results for the user in Korean.

That workflow does not primarily reward flashy multimodal branding. It rewards:

- responsiveness,
- clean structured outputs,
- strong coding behavior,
- stable multi-step reasoning,
- and good multilingual prompt handling.

SuperGemma4’s published gains line up almost perfectly with that workload profile.

### 2) The Korean improvement is more important than it looks

A lot of open models technically support Korean. Fewer feel natural under real prompting pressure.

What users actually notice is not whether a model can answer one Korean question. They notice whether it:

- keeps the structure clean,
- avoids weird mixed-language drift,
- follows detailed instructions,
- and stays coherent across longer turns.

A move from `90.7` to `95.0` in the Korean category may not sound dramatic to casual readers, but for bilingual users it can be the difference between “interesting local demo” and “daily driver candidate.”

### 3) The speed gain changes orchestration behavior

The raw throughput change from `42.5 tok/s` to `46.2 tok/s` is not a miracle jump. But in agent loops, even moderate speed improvements compound quickly.

If you have a workflow that performs repeated:

- planning,
- code generation,
- tool correction,
- browser-step reasoning,
- and summarization,

then a modest speed increase across every turn reduces waiting, iteration drag, and the temptation to switch back to a remote API.

In other words, speed is not just a benchmark number. It changes product ergonomics.

### 4) The best local models may become narrower and better

One of the strongest implications of releases like this is that not every local model needs to be “everything.”

A text-first, latency-aware, Apple-Silicon-tuned model with better code, logic, browser, and Korean performance may be more valuable than a heavier model that does more things less reliably.

That is especially true for:

- local coding assistants,
- browser automation agents,
- private enterprise copilots,
- bilingual tooling,
- and always-on desktop agents.

That is why I think SuperGemma4 is not just another model upload. It represents a healthier optimization target for local AI: less benchmark theater, more practical capability per machine.

---

## Final Thoughts

If I were choosing a local model for an Apple Silicon agent stack today, I would care less about whether it can do everything and more about whether it can do recurring work well:

- answer quickly,
- write code reliably,
- survive tool-style prompting,
- reason through steps,
- and handle Korean without falling apart.

SuperGemma4 looks like a model built around exactly that priority.

That makes it more interesting than a generic release note, and more useful than a lot of louder model launches.

---

## Sources

- GeekNews summary: https://news.hada.io/topic?id=28584
- Official Hugging Face model card: https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2
