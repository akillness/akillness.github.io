---
title: "LLM2Vec, Two Years On: The Thesis Won, the Recipe Did Not"
description: "The paper claimed unsupervised MTEB SOTA as of May 2024 and put itself 6th overall. This page dropped every qualifier. What the download numbers say now."
categories: [Review/Trends]
tags: [Trend, Review, Case]
date: 2024-07-29 13:00:00 +0800
image:
  path: /assets/img/posts/2024-07-29-llm2vec-embedding-models/llm2vec-claim-decay.svg
  width: 1200
  height: 630
  alt: "Diagram showing the three qualifiers the LLM2Vec paper attached to its MTEB claim - unsupervised only, public-data-only models, as of 24 May 2024 - each crossed out above the unqualified claim this page published"
---

## 🤔 Curiosity: what happens to a benchmark claim with an expiry date on it?

LLM2Vec's authors did something unusual. They wrote their headline result with a date stamp inside the sentence: state of the art on MTEB among models trained only on publicly available data, **"as of May 24, 2024"**.

That is an honest way to make a leaderboard claim, because it tells you the claim is perishable. This page then republished it without the date, without the scope, and without the word "unsupervised".

So this is two audits in one: what the paper actually claimed, and what two years did to it.

> **Correction (2026-09-02).** An earlier version of this page stated "New SOTA on MTEB benchmark" as a flat fact. The paper never claimed that. It claimed unsupervised state of the art, and separately state of the art among public-data-only models as of a stated date, while reporting itself as **6th overall** on the leaderboard. The qualifiers are restored below.
{: .prompt-warning }

*Originally published 2024-07-29. Re-audited and rewritten on 2026-09-02 against arXiv:2404.05961v2.*

## 📚 Retrieve: what the pinned sources say

**LLM2Vec: Large Language Models Are Secretly Powerful Text Encoders** is by Parishad BehnamGhader, Vaibhav Adlakha, Marius Mosbach, Dzmitry Bahdanau, Nicolas Chapados and Siva Reddy (McGill University and Mila, with ServiceNow Research), published at **COLM 2024**. Two arXiv versions exist: v1 on 2024-04-09 and v2 on 2024-08-21.

### Finding 1 — The claim was triple-qualified, and the paper ranked itself 6th

The abstract reads: "reach a new **unsupervised** state-of-the-art performance on the Massive Text Embeddings Benchmark (MTEB)", and then "when combining LLM2Vec with supervised contrastive learning, we achieve state-of-the-art performance on MTEB **among models that train only on publicly available data (as of May 24, 2024)**."

The results section is blunter than any summary of it: **"Our models achieve the 6th score in the MTEB leaderboard and the 1st among the models trained with only public data."**

Sixth. The authors printed the rank. An unqualified "new SOTA on MTEB" was never true, and it was never claimed.

### Finding 2 — The method, stated plainly

Three steps, in the abstract's own words: "1) enabling bidirectional attention, 2) masked next token prediction, and 3) unsupervised contrastive learning." The paper abbreviates them **Bi**, **MNTP** and **SimCSE**.

| Step | What changes | Training signal |
|---|---|---|
| Bi | Removes the causal mask so tokens see both directions | none, an architectural switch |
| MNTP | Adapts the model to the new attention pattern | Wikitext-103 |
| SimCSE | Pulls two dropout views of a sentence together | a Wikipedia sentence subset |

It was applied to four base models from 1.3B to 8B: Sheared-LLaMA-1.3B, LLaMA-2-7B, Mistral-7B and Meta-Llama-3-8B.

### Finding 3 — Between the two finished encoders, adoption is 637 to 1

This is the part no summary from 2024 could have known. Monthly downloads on the official checkpoints, read on 2026-09-02:

| Checkpoint | Downloads / 30 days |
|---|---:|
| `LLM2Vec-Meta-Llama-3-8B-Instruct-mntp` | **223,178** |
| `LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised` | 96,837 |
| `LLM2Vec-Mistral-7B-Instruct-v2-mntp` | 3,733 |
| `LLM2Vec-Mistral-7B-Instruct-v2-mntp-supervised` | 502 |
| `LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-unsup-simcse` | **152** |

The obvious comparison is the wrong one. All three are LoRA adapters over `meta-llama/Meta-Llama-3-8B-Instruct`, and the two finished encoders are PEFT adapters applied **on top of the MNTP checkpoint**: their repositories carry no model weights beyond `adapter_config.json` and `adapter_model.safetensors`, and the official usage loads MNTP as the model with the encoder layered over it. The MNTP number therefore includes every supervised and unsupervised use, so it is not a clean peer comparison. It does still carry real independent demand: 126,189 of its downloads, about 56%, are not explained by either encoder, which is people using it as a fine-tuning starting point.

The valid comparison is between the two peers. The supervised encoder pulls **96,837** downloads a month; the unsupervised SimCSE encoder, the one carrying the famous claim, pulls **152**. That is roughly **637 to 1**.

So the headline result and the actual usage point in different directions. Practitioners took the supervised path and left the unsupervised model, the one this page advertised as SOTA, almost untouched. Download counts are a crude signal and they drift, but a gap of that size between two peer checkpoints of one paper is hard to explain away.

### Finding 4 — The code still works, on 2024's dependency stack

The repository is MIT-licensed with about 1,700 stars, and it is neither archived nor marked deprecated. But the last release is **0.2.3 on 2025-01-24**, the last substantive code change was **2024-10-08**, and the only 2026 commit updates the README. There are 39 open issues and 5 open pull requests.

The practical blocker is one line in `setup.py`: it pins `transformers>=4.43.1,<=4.44.2`. That is an **upper bound on the August 2024 transformers line**. Installing the released package into a current environment means either pinning your whole stack to 2024 or forking. Budget for that before you plan around it.

### Finding 5 — The thesis was vindicated, by other models

LLM2Vec's argument was that decoder-only LLMs make excellent text encoders. Two years later, decoder-derived embedders are a mainstream way to build a strong retriever, though not the only one. By download volume, encoder-lineage models still dominate:

| Model | Downloads / 30 days | Decoder-LLM derived |
|---|---:|---|
| `sentence-transformers/all-MiniLM-L6-v2` | 255.1M | No, encoder lineage |
| `BAAI/bge-m3` | 37.5M | No, encoder lineage |
| `sentence-transformers/all-mpnet-base-v2` | 24.6M | No, encoder lineage |
| `Qwen/Qwen3-Embedding-0.6B` | 6.8M | **Yes** |
| `jinaai/jina-embeddings-v3` | 2.5M | No |
| `google/embeddinggemma-300m` | 2.4M | **Yes**, Gemma-derived |
| `Qwen/Qwen3-Embedding-8B` | 2.4M | **Yes** |
| `Alibaba-NLP/gte-Qwen2-7B-instruct` | 117k | **Yes** |
| `nvidia/NV-Embed-v2` | 19k | **Yes**, Mistral-based |

Qwen3-Embedding's model card says it is "Building upon the dense foundational models of the Qwen3 series." That is LLM2Vec's thesis, shipped at scale. What changed is that decoder-derived families now sit alongside the encoder veterans near the top of the usage table instead of being a research curiosity.

The distinction that matters: these families **train embeddings directly** on decoder backbones rather than converting a finished chat model with the full Bi-plus-MNTP-plus-SimCSE pipeline. Individual ingredients did travel. NV-Embed states that it removes "the causal attention mask of LLMs during contrastive training", which is LLM2Vec's first step. The idea travelled; the packaged recipe did not.

### Finding 6 — The authors moved on too

In March 2026 the same group published **LLM2Vec-Gen: Generative Embeddings from Large Language Models** (arXiv 2603.10913, 2026-03-11), since accepted at COLM 2026, whose stated idea is to encode "the potential answer of an LLM to a query rather than the query itself." The repository is MIT and recent. At 24 downloads a month it has no adoption signal yet, so treat it as a research direction, not a recommendation.

### What the paper itself warned about

Appendix A lists three limitations, and the first one aged into the main practical objection: a 7B model emits **4096-dimensional** vectors against BERT's 768, which the authors note makes them "more memory and compute intensive for creating vector indexes for large document collections." They also flag possible pre-training contamination they could not rule out, and that everything was evaluated **in English only**.

## 💡 Innovation: what I take from this

**Treat a dated claim as perishable food.** The authors wrote "as of May 24, 2024" because they knew. Any summary that removes that date is manufacturing a stronger claim than the source. When re-publishing a benchmark result, carry the qualifiers or do not carry the result.

**Check the rank the paper reports about itself.** This one said sixth, in its own results section. That number never appears in the coverage, including mine until today.

**Use download splits as a usage signal, but compare peers.** A 637-to-1 gap between two peer checkpoints of the same paper says more about what practitioners adopted than any leaderboard position does. Comparing an encoder against the checkpoint it is layered on would have produced 1,468 to 1 and meant nothing, because that checkpoint loads either way.

**For production retrieval in 2026, start from a maintained family.** Qwen3-Embedding, EmbeddingGemma, bge-m3 and multilingual-e5 all have active cards and millions of monthly downloads. Reach for LLM2Vec when you specifically want to convert a particular backbone you already run, and accept the dependency pin. If you are fine-tuning your own retriever, my notes on [fine-tuning an embedding model for RAG](/posts/finetune-embedding-model-rag/) cover that path, and the [Text Embeddings Inference deep dive](/posts/huggingface-text-embeddings-inference-deep-dive/) covers serving it.

**Price the index, not the model.** 4096-dimensional vectors cost more than five times what 768-dimensional ones cost to store and search. The authors said so in 2024 and it is still the first thing that breaks a large deployment.

## 🎯 Key Takeaways

- The paper claimed **unsupervised** MTEB state of the art, and public-data-only state of the art **"as of May 24, 2024"**, while reporting itself **6th overall**. This page's old "New SOTA on MTEB" was never accurate.
- Between the two peer encoders, the supervised variant pulls **96,837** downloads a month against **152** for the unsupervised one, roughly 637 to 1. The MNTP checkpoint is not a valid comparison point, since both encoders are adapters layered on it.
- The repository is alive but frozen at **transformers <= 4.44.2**, so installation is the real barrier in 2026.
- **The thesis was vindicated as a viable path**, not as a takeover: Qwen3-Embedding, EmbeddingGemma, gte-Qwen2 and NV-Embed are decoder-derived and heavily used, while encoder-lineage models such as all-MiniLM-L6-v2 still lead on raw download volume.
- The authors' own first limitation, 4096-dimensional vectors, remains the practical cost ceiling.

## 🤔 New Questions

- Would Bi plus MNTP plus SimCSE still add anything on top of a model like Qwen3-Embedding, or does direct embedding training absorb all of it?
- Of the 126,189 MNTP downloads not explained by either encoder, how many are research reproduction versus shipped fine-tunes?
- Does the answer-side framing in LLM2Vec-Gen survive contact with a real retrieval corpus, where the answer distribution is not known in advance?

## References

**Paper and code**
- LLM2Vec paper: <https://arxiv.org/abs/2404.05961> (v2, August 2024)
- COLM entry: <https://openreview.net/forum?id=IW1PR7vEBf>
- NV-Embed, cited for the bidirectional-attention overlap: <https://arxiv.org/abs/2405.17428>
- Project page: <https://mcgill-nlp.github.io/llm2vec/>
- Repository: <https://github.com/McGill-NLP/llm2vec>
- Successor, LLM2Vec-Gen: <https://arxiv.org/abs/2603.10913>

**Benchmark**
- MTEB leaderboard: <https://huggingface.co/spaces/mteb/leaderboard>
- MTEB results corpus: <https://github.com/embeddings-benchmark/results>

**Models referenced**
- <https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp>
- <https://huggingface.co/Qwen/Qwen3-Embedding-0.6B>
- <https://huggingface.co/google/embeddinggemma-300m>
- <https://huggingface.co/BAAI/bge-m3>

> **Editorial method:** this audit was researched and drafted with AI assistance under an evidence-gated editorial process, then revised across independent review passes. Paper quotations come from arXiv:2404.05961v2; download counts, repository state and licence facts were read from the Hugging Face and GitHub APIs on 2026-09-02 and will drift.
{: .prompt-info }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > 한국어 요약 </summary>

LLM2Vec(COLM 2024)은 디코더 전용 LLM을 텍스트 인코더로 바꾸는 3단계 기법이다. **양방향 어텐션 → MNTP → SimCSE**.

이 페이지가 오래 걸어둔 "New SOTA on MTEB"는 **논문이 한 적 없는 주장**이다. 논문은 ① **비지도** 부문 SOTA, ② **공개 데이터만 쓴 모델 중** SOTA, ③ **2024년 5월 24일 기준**이라는 세 겹의 한정을 달았고, 결과 절에서 **자기 순위를 전체 6위**라고 직접 적었다.

2년이 지난 지금 갈린 것은 **논지와 레시피**다. 논지(디코더 LLM이 좋은 인코더가 된다)는 **유효한 경로로 입증됐지만 시장을 잡은 것은 아니다** — Qwen3-Embedding, EmbeddingGemma, gte-Qwen2, NV-Embed가 디코더 계열로 널리 쓰이는 한편, 다운로드 수량은 여전히 all-MiniLM-L6-v2 같은 인코더 계열이 압도한다. 또 이들은 변환이 아니라 **처음부터 임베딩으로 학습**한다.

사용 패턴도 분명하다. 단, 비교 대상을 잘못 잡으면 안 된다 — 완성형 인코더 둘은 **PEFT 어댑터**라 MNTP 체크포인트를 반드시 함께 불러온다. 그래서 MNTP의 월 223,178회를 단독 비교 대상으로 쓰면 안 되고, 동급끼리 봐야 한다 — **지도학습판 월 96,837회 대 비지도 SimCSE판 월 152회**, 약 **637대 1**이다. 정작 유명한 주장을 담은 모델을 사람들이 안 쓴다는 뜻이다. 실무 장벽은 성능이 아니라 설치다 — 배포 패키지가 `transformers<=4.44.2`로 상한이 박혀 있다.

</details>
