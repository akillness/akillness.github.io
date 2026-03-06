---
title: "LocalCowork: A No‑Cloud Agent That Finally Feels Instant"
description: "LFM2‑24B‑A2B hits ~385ms tool dispatch on a MacBook with 67 tools and 14.5GB memory — all local, zero network calls." 
categories: [AI, Research]
tags: [local-ai, agents, mcp, tooling, privacy]
date: 2026-03-06 21:00:00 +0900
mermaid: true
math: false
image:
  path: /assets/img/ai/localcowork-demo-1.png
  lqip: data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAABQBQCdASogABYAPwVssFArpiUisAwBcCCJYwDAQ1/AWWRymoC3vXEksaMFSqAMyDtttAAA/u/EOxDYcPCE4j6m0cNPV7jcCdUk/ud8jpHP8dYh7TgPsyimgz9IG5639YQDJSaAtrXAHBYO9wI2C7Nc70iyQ6oVvaf2Dj3OjD8EoSgIAAA=
  alt: "LocalCowork demo (Liquid AI blog)"
---

## 🤔 Curiosity: The Question

Most local agents fail for a simple reason:  
**they can understand the request, but they can’t pick the right tool fast enough to feel instant.**

So we pushed the whole stack *onto a laptop*:
- **LFM2‑24B‑A2B** running locally
- **67 tools across 13 MCP servers**
- **Zero network calls**

The question was simple:

> **What happens when tool selection is sub‑second and private by default?**

---

## 📚 Retrieve: The Knowledge

### What LocalCowork is

**LocalCowork** is an open‑source desktop agent that runs entirely on‑device:  
model + tools + data, with **no cloud, no API keys, no data egress**.

The blog post outlines the exact setup:
- **Apple M4 Max, 36GB unified memory**
- **LFM2‑24B‑A2B (MoE, ~2B active params)**
- **~14.5GB memory footprint**
- **~385ms average tool‑selection latency**

### The tool surface (why this matters)

It isn’t a toy set. The benchmark uses **67 tools across 13 MCP servers**:
- filesystem, document, OCR, security, audit
- knowledge/RAG, meeting, system, clipboard
- calendar, email, task, data, screenshot pipeline

The repo exposes a **tool registry contract** (MCP tool schema).  
This is a *real harness surface*, not an ad‑hoc prompt list.

### Real workflows tested

A full pipeline ran locally:
1) Search receipt images
2) OCR + parse vendor/items/total
3) Detect duplicates
4) Export CSV
5) Flag anomalies
6) Generate reconciliation report

That’s a multi‑step, multi‑tool workflow **without a single outbound API call**.

### Benchmarks (from the report)

| Model | Active Params | Tool Accuracy | Latency | Multi‑step |
|---|---:|---:|---:|---:|
| **LFM2‑24B‑A2B** | ~2B (MoE) | **80%** | **390ms** | 26% |
| Gemma 3 27B | 27B | 91% | 24,088ms | 48% |
| Mistral‑Small‑24B | 24B | 85% | 1,239ms | 66% |
| Qwen3‑32B | 32B | ~70% | 28,385ms | — |

The key takeaway: **speed is the product**.

---

## 💡 Innovation: The Insight

### Why this changes the local‑agent story

The model isn’t just smart — it’s **fast enough to keep the loop tight**.  
That’s the real unlock for local agents:

- Low latency → low correction cost  
- Private by default → safe for real workflows  
- Tool registry contract → maintainable harness  

### What I’d build with this

**1) Local QA assistant**  
Scan builds, diff logs, generate reports — *no data leaves the studio.*

**2) Producer ops agent**  
Docs + calendar + audit logs, all offline‑capable.

**3) On‑device compliance workflows**  
If your studio handles sensitive IP, this is the path.

### Key Takeaways

| Insight | Implication | Next Step |
|---|---|---|
| Sub‑second tool dispatch is the product | UX beats raw IQ | Optimize tool routing |
| MCP tool registry is a harness contract | Scaling becomes possible | Standardize tool schemas |
| Local‑first = real privacy | Enables regulated workflows | Ship on‑device pilots |

### New Questions This Raises

- Can multi‑step success move past 26% with better confirmation loops?  
- What’s the minimal tool set for “instant” UX?  
- How do we design audits that humans actually read?

---

## References

- Liquid AI blog: https://www.liquid.ai/blog/no-cloud-tool-calling-agents-consumer-hardware-lfm2-24b-a2b
- LocalCowork cookbook: https://github.com/Liquid4All/cookbook/tree/main/examples/localcowork
- LFM2‑24B‑A2B model: https://huggingface.co/LiquidAI/LFM2-24B-A2B-Preview
- MCP: https://modelcontextprotocol.io/
