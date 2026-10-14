---
published: true
layout: post
title: "LLM Inference Parallelism Is a Rank-Topology Problem"
description: "A source audit of how vLLM maps tensor, pipeline, data, expert, and context parallelism onto GPU ranks, and why formulas do not travel cleanly between engines."
categories: [AI, Research]
tags: [llm-inference, tensor-parallelism, model-serving, mixture-of-experts, gpu-topology, agent-systems]
date: 2026-10-13 09:42:59 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-10-13-llm-inference-parallelism-layout/parallelism-rank-topology.svg
  alt: "A rank-topology diagram comparing vLLM tensor, pipeline, data, expert, and decode-context parallelism without treating every label as an extra GPU pool"
---

## Which GPUs did you just count?

A serving configuration can contain labels such as tensor parallelism (TP), pipeline parallelism (PP), data parallelism (DP), expert parallelism (EP), and context parallelism (CP). It is tempting to multiply every number beside every label and call the result the GPU count. That shortcut can be wrong because the labels do not all describe independent pools of devices.

The useful question is not “How many parallelism strategies are enabled?” It is “Which ranks exist, which ranks belong to each group, and what state is split or replicated across them?” That distinction matters for agent-serving systems, where long prompts, variable concurrency, MoE routing, and KV-cache pressure can collide in one deployment.

This post is a source audit of framework documentation, not a performance report. The vLLM claims use the v0.25.0 documentation; the comparison uses Megatron Core 0.16 and SGLang’s long-context pipeline-parallel page pinned to commit e2728ac. Later framework releases may differ. The small but important conclusion: a strategy name is not automatically another GPU multiplier.

## Technical Analysis: What the framework docs actually count

Start with the pinned vLLM v0.25.0 documentation. Its single-node command combines TP=4 with PP=2 and labels the result “Eight GPUs total.” For a multi-node deployment, vLLM’s guidance maps TP to the number of GPUs per node and PP to the number of nodes. Those settings describe one model replica spread across pipeline stages, not two unrelated GPU fleets. See the [vLLM v0.25.0 scaling guide](https://docs.vllm.ai/en/v0.25.0/serving/parallelism_scaling/).

Data parallelism changes the accounting in a different way. The [vLLM v0.25.0 DP guide](https://docs.vllm.ai/en/v0.25.0/serving/data_parallel_deployment/) says DP=4 requires four GPUs, while DP=4 together with TP=2 requires eight. DP ranks serve separate request streams, and each DP engine has an independent KV cache. For MoE models, though, the same guide warns that DP ranks are not fully independent: forward passes must align and expert layers synchronize on every forward pass. When requests are in progress on any rank, ranks with no requests scheduled perform empty “dummy” forward passes to keep them aligned. A router can account for queued requests and cache state when balancing traffic, but “four replicas” does not mean four engines share one cache automatically.

The most useful example is MoE expert parallelism. In vLLM, the [vLLM v0.25.0 EP guide](https://docs.vllm.ai/en/v0.25.0/serving/expert_parallel_deployment/) defines `EP_SIZE = TP_SIZE × DP_SIZE`. With TP=2 and DP=4, the deployment has eight GPUs: expert layers use an eight-rank EP group, while attention uses TP=2 inside each of the four DP groups. In that documented layout, enabling EP does not add an extra eight GPUs on top of the existing eight. It changes how the same ranks are grouped for expert and attention layers. The v0.25.0 guide also labels EP experimental and warns that its argument names and defaults may change.

| Label | What is split or replicated | What the cited vLLM docs let you count |
|---|---|---|
| TP | Parts of model tensors and layer computation | TP=4 uses four GPUs in the documented single-node example |
| PP | Model layers across pipeline stages | TP=4 plus PP=2 is an eight-GPU example |
| DP | Replicas and request streams, plus MoE coordination | DP=4 needs four GPUs; DP=4 plus TP=2 needs eight; while any rank has requests in progress, unscheduled ranks run empty dummy forward passes |
| EP | MoE expert layers across expert ranks | In vLLM, EP size is derived from TP × DP; it is not another independent pool in the example. EP is experimental in v0.25.0; argument names and defaults may change |
| Decode CP / DCP | KV-cache state along the token-sequence dimension | In vLLM v0.25.0’s guide, increasing DCP does not increase GPUs launched, but increases communication |
| Prefill CP | Work on a long input sequence | The vLLM v0.25.0 guide describes approaches and explicitly marks them under active development |

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-llm-inference-parallelism-layout/references/tp-tensor-parallelism.png" alt="Diagram showing a transformer block split across two visible rank lanes, each computing a partition with collective communication between stages." />
  <figcaption>Source page: <a href="https://arxiv.org/html/2509.16495v2">https://arxiv.org/html/2509.16495v2</a>. Creator(s): Mert Hidayetoglu, Aurick Qiao, Michael Wyatt, Jeff Rasley, Yuxiong He, and Samyam Rajbhandari. Attribution: Figure 3(a) from Shift Parallelism (arXiv:2509.16495v2). Modified to remove eXIf, iTXt, and iDOT chunks; compressed image data is unchanged. CC BY 4.0. License: <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">https://creativecommons.org/licenses/by/4.0/legalcode.en</a>.</figcaption>
</figure>

That last row needs a framework boundary. vLLM’s [vLLM v0.25.0 context-parallel guide](https://docs.vllm.ai/en/v0.25.0/serving/context_parallel_deployment/) separates prefill from decode. For decode, DCP shards the KV cache along the token dimension `T`. The guide says DCP size does not increase the number of GPUs to launch; it reduces cache duplication within the existing TP layout, with more communication as DCP grows. Its recommended DCP range is also tied to the model’s KV-head count, so the setting must be checked against the actual model and engine version.

For prefill, the same guide describes splitting a long request’s new tokens across `N` GPUs. It also says both approaches are under active development. That status is part of the evidence, not a footnote to omit. A feature appearing in a versioned guide does not, by itself, prove that it is stable for every deployment.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-llm-inference-parallelism-layout/references/sp-ulysses-sequence-parallelism.png" alt="Diagram showing the Ulysses sequence-parallel approach exchanging sequence shards between two visible rank lanes for attention and restoring output shards." />
  <figcaption>Source page: <a href="https://arxiv.org/html/2509.16495v2">https://arxiv.org/html/2509.16495v2</a>. Creator(s): Mert Hidayetoglu, Aurick Qiao, Michael Wyatt, Jeff Rasley, Yuxiong He, and Samyam Rajbhandari. Attribution: Figure 3(b) from Shift Parallelism (arXiv:2509.16495v2). Modified to remove eXIf, iTXt, and iDOT chunks; compressed image data is unchanged. CC BY 4.0. License: <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">https://creativecommons.org/licenses/by/4.0/legalcode.en</a>.</figcaption>
</figure>

The word “context” can also hide a training-versus-inference mismatch. [Megatron Core 0.16’s context-parallel page](https://docs.nvidia.com/megatron-core/developer-guide/0.16.0/user-guide/features/context_parallel.html) describes partitioning inputs and activations along the sequence dimension, with KV communication and gradient collectives in backward. For that stack, it gives a total-GPU formula of `TP × CP × PP × DP`. That is a valid formula for the described Megatron Core configuration. It is not a portable inference formula to paste into a vLLM serving plan, where prefill CP and decode DCP have separate meanings and constraints.

There is another useful exception to the idea that PP only helps when several requests are available. The [SGLang long-context PP documentation at commit e2728ac](https://github.com/sgl-project/sglang/blob/e2728ac504c00e37a284c7248693857b894e40e7/docs/advanced_features/pipeline_parallelism.md) says a single request’s input can be partitioned into chunks and different chunks from that same request can be processed at once by different nodes. This is a framework-specific chunked-prefill design, not a promise about generic pipeline implementations. Still, it changes the question a team should ask: “Can this engine pipeline one long prompt?” is more precise than “Does PP help inference?”

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-llm-inference-parallelism-layout/references/shift-dynamic-tp-sp.png" alt="Diagram contrasting a tensor-parallel Shift configuration at the top with a Ulysses sequence-parallel base configuration at the bottom, connected by a central Shift Parallelism label." />
  <figcaption>Source page: <a href="https://arxiv.org/html/2509.16495v2">https://arxiv.org/html/2509.16495v2</a>. Creator(s): Mert Hidayetoglu, Aurick Qiao, Michael Wyatt, Jeff Rasley, Yuxiong He, and Samyam Rajbhandari. Attribution: Figure 5 from Shift Parallelism (arXiv:2509.16495v2). Modified to remove eXIf, iTXt, and iDOT chunks; compressed image data is unchanged. CC BY 4.0. License: <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">https://creativecommons.org/licenses/by/4.0/legalcode.en</a>.</figcaption>
</figure>

The Shift Parallelism paper is useful here as a research example: its v2 describes switching between TP and Ulysses sequence parallelism as inference traffic changes. A second paper, [Semantic Parallelism](https://arxiv.org/html/2503.04398v5), approaches the EP problem from token placement: its abstract describes remote expert routing and proposes model-data co-scheduling. These are examples of research that reasons about communication and rank groups, not drop-in recommendations for every production system.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-llm-inference-parallelism-layout/references/sem-moe-token-expert-scheduling.png" alt="Diagram of Semantic Parallelism co-locating input tokens and their likely activated experts across devices to reduce remote routing." />
  <figcaption>Source page: <a href="https://arxiv.org/html/2503.04398v5">https://arxiv.org/html/2503.04398v5</a>. Creator(s): Yan Li, Zhenyu Zhang, Zhengang Wang, Pengfei Chen, and Pengfei Zheng. Attribution: Figure 3 from Semantic Parallelism (arXiv:2503.04398v5). Unmodified source PNG; no eXIf, iTXt, or iDOT chunks were present. CC BY 4.0. License: <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">https://creativecommons.org/licenses/by/4.0/legalcode.en</a>.</figcaption>
</figure>

## Decide by the bottleneck, then inspect the groups

A practical topology review starts with the thing that is actually constrained:

1. **Model weights do not fit on one device.** Check whether TP can stay inside a fast local interconnect. If the model must span nodes, compare PP with the exact engine’s TP/PP guidance and communication paths. The vLLM example is a useful starting point, not a universal config.
2. **The serving replica fits, but independent requests queue up.** Consider DP and then account for the fact that each DP engine has its own KV cache. A routing policy that ignores cache state may not use prefix locality as intended.
3. **MoE expert weights or dispatch dominate.** Read the EP group size and attention group separately. For the cited vLLM topology, EP is derived from TP and DP. Then check the actual all-to-all backend and network requirements before calling the layout feasible.
4. **Long-context decode is constrained by KV-cache duplication.** In vLLM, inspect DCP as a way to shard KV state within the existing TP GPU set. Do not budget DCP as extra GPUs, and account for its communication cost.
5. **A very long input dominates prefill latency.** Check the selected engine’s exact prefill-CP or chunked-PP implementation and version. SGLang documents one implementation that overlaps chunks from the same request; vLLM marks its described prefill approaches as under active development.

I would keep a small rank ledger beside the deployment config: engine and version, total world size, GPU IDs for each group, TP/PP/DP/EP/DCP settings, attention and KV-head layout, per-DP-engine cache state, and the interconnect used by each collective. Then write down the target SLO before comparing layouts: p95 time to first token, inter-token latency, throughput, or maximum context length. Those goals can pull in different directions, so a topology choice without a stated target is hard to evaluate.

The two research papers make a related point without settling the production decision. Shift Parallelism explores switching strategies as traffic changes; Semantic Parallelism explores aligning expert placement with token activity. The useful takeaway is not that one method always wins. It is that rank membership, token movement, and communication are part of the design, not incidental details behind a strategy label.

If your main question is how request shape changes latency and throughput, compare this topology map with the site’s earlier [LLM inference patterns note](/posts/llm-inference-patterns/). For the separate question of expert residency and host-memory serving, see the [FreeToken edge-native MoE serving audit](/posts/freetoken-edge-native-moe-serving/). Those topics meet in production, but they are not the same analysis.

## Key Takeaways

- Count the ranks a framework actually creates, not the number of parallelism labels in a config.
- In the cited vLLM v0.25.0 examples, TP=4 with PP=2 uses eight GPUs, and DP=4 with TP=2 also uses eight; MoE DP ranks coordinate while requests are in progress.
- vLLM EP is derived from TP × DP in the documented MoE topology and is experimental in v0.25.0; argument names and defaults may change. DCP does not add launched GPUs.
- Megatron Core 0.16’s CP formula belongs to its training-oriented implementation, not every inference engine.
- Verify model, engine version, rank groups, and communication costs before treating any configuration formula as portable.

## New Questions

- Does the server’s startup log show the rank groups you expected, or only the sizes you entered?
- Which bottleneck are you solving: weights, independent request capacity, MoE routing, KV-cache duplication, or long-prompt prefill?
- What does each rank exchange over NVLink or the cluster fabric, and have those bytes and latencies been measured on the target system?
- For a long-context workload, does the chosen engine actually overlap chunks from one request, and is that feature stable in the pinned version?
- Are you optimizing p95 TTFT, inter-token latency, throughput, or cache capacity? Which one is the release gate?

This source audit did not run an independent benchmark. It provides a way to make the next measurement more specific: pin the engine version, list the rank groups, and test one declared SLO rather than comparing strategy names in the abstract.

## References

- [vLLM v0.25.0: Distributed inference and parallelism scaling](https://docs.vllm.ai/en/v0.25.0/serving/parallelism_scaling/)
- [vLLM v0.25.0: Data-parallel deployment](https://docs.vllm.ai/en/v0.25.0/serving/data_parallel_deployment/)
- [vLLM v0.25.0: Expert-parallel deployment](https://docs.vllm.ai/en/v0.25.0/serving/expert_parallel_deployment/)
- [vLLM v0.25.0: Context-parallel deployment](https://docs.vllm.ai/en/v0.25.0/serving/context_parallel_deployment/)
- [Megatron Core 0.16: Context parallelism](https://docs.nvidia.com/megatron-core/developer-guide/0.16.0/user-guide/features/context_parallel.html)
- [SGLang at commit e2728ac: Pipeline parallelism for long context](https://github.com/sgl-project/sglang/blob/e2728ac504c00e37a284c7248693857b894e40e7/docs/advanced_features/pipeline_parallelism.md)
- [Shift Parallelism, arXiv:2509.16495v2](https://arxiv.org/html/2509.16495v2)
- [Semantic Parallelism, arXiv:2503.04398v5](https://arxiv.org/html/2503.04398v5)
- [Creative Commons Attribution 4.0 legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en)
