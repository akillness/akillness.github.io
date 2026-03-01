---
title: "The 4 LLM Inference Patterns — and Why Deployment Feels Different"
description: "Prefill vs. decode changes the economics of LLM serving. Here’s how SISO/LISO/SILO/LILO shape latency, cost, and routing." 
categories: [AI, Research]
tags: [llm, inference, kv-cache, serving, latency]
date: 2026-02-28 21:30:00 +0900
mermaid: true
math: false
image:
  path: /assets/img/ai/llm-inference-patterns-1.jpg
  alt: "LLM inference patterns overview"
---

## 🤔 Curiosity: The Question

Over the last year, I’ve deployed agents into real workflows and hit the same surprise: **LLM inference doesn’t behave like classic ML inference.** The output is *generated*, not fixed. That means the cost and latency curve bends in ways you don’t see with “normal” models.

The LinkedIn post on **“4 patterns of LLM inference”** made the framing click. It’s not just *prefill* and *decode*—it’s how those stages combine into **four distinct runtime profiles** that should change how we deploy.

![LLM inference patterns](/assets/img/ai/llm-inference-patterns-1.jpg){: .light .w-75 .shadow .rounded-10 }

---

## 📚 Retrieve: The Knowledge

### Key terms worth re‑anchoring

- **Prefill**: the model processes the full prompt and builds the **KV cache**. This is typically **compute‑bound** and fast per token.  
- **Decode**: the model generates tokens one‑by‑one using the KV cache. This is **memory‑bound** and grows with output length.  
- **KV Cache**: cached key/value tensors from attention layers that prevent recomputation across steps—critical for fast decoding.

Useful references that explain this split clearly:
- NVIDIA on inference optimization & KV cache: https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/  
- vLLM anatomy of prefill vs decode: https://blog.vllm.ai/2025/09/05/anatomy-of-vllm.html

### The 4 patterns

| Pattern | Input | Output | Primary bottleneck | Typical risk |
|---|---|---|---|---|
| **SISO** | Short | Short | none (fast) | Under‑utilized GPU |
| **LISO** | Long | Short | prefill | prompt cost dominates |
| **SILO** | Short | Long | decode | token generation latency |
| **LILO** | Long | Long | both | heavy infra & memory pressure |

### Pattern‑specific optimization playbook

| Pattern | Optimization focus | Serving tactic |
|---|---|---|
| **SISO** | High concurrency, batching | Aggressive dynamic batching, smaller models |
| **LISO** | Prefill throughput, KV cache reuse | Larger VRAM, prompt‑cache, parallel prefill |
| **SILO** | Decode speed, memory bandwidth | KV cache efficiency, speculative decoding |
| **LILO** | Both stages + memory pressure | Tensor/pipe parallelism, multi‑node, paging KV |

### Minimal mental model

```mermaid
flowchart LR
  A[Prompt] --> B[Prefill / KV cache]
  B --> C[Decode loop]
  C --> D[Output]
```

The longer the output, the more time is spent in **decode**. The longer the prompt, the more cost you pay in **prefill**. Deployment strategy should follow that split.

---

## 💡 Innovation: The Insight

### Why this matters for AI × Games

Game pipelines are a mix of **short queries (SISO)** and **long chain‑of‑thought tasks (SILO/LILO)**. If we route everything to one model, we overpay and slow the system down.

### What I’d do in production

1) **Route by inference pattern**  
   - Short NPC tasks → smaller models (SISO)  
   - Long narrative generation → larger models (SILO/LILO)

2) **Optimize for decode‑heavy workloads**  
   - When output length dominates, **KV cache + memory bandwidth** becomes the priority.

3) **Match infra to pattern**  
   - LISO/LILO workloads need **higher VRAM** and parallelism; SISO should focus on concurrency.

### New Questions This Raises

- Can we **classify inference pattern at runtime** and auto‑route models in <1ms?
- What’s the simplest **pattern‑aware router** that still saves real money?
- How should we benchmark *agent productivity per dollar* across these patterns?

---

## References

- LinkedIn post: https://www.linkedin.com/posts/arazvant_the-4-patterns-of-llm-inference-deploying-activity-7432739901659299843-X0qG
- NVIDIA: https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/
- vLLM blog: https://blog.vllm.ai/2025/09/05/anatomy-of-vllm.html
