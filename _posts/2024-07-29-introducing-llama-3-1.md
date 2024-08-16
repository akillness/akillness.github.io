---
title: Introducing Llama 3.1 - the most capable LLMs from Meta, free and arguably open-source!
description: LLM, Llama3.1
categories: [LLM, Llama3.1]
tags: [Introducing, Llama3.1]
# author: foDev_jeong
date: 2024-07-29 12:00:00 +0800
# pin: true
# math: true
# mermaid: true
image:
  path: /assets/img/llm/compare-performance-of-llms.jpeg
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: [ Compare Performance of LLMS by KMMLU ]
---

![ Llama 3.1 MMLU performance ](/assets/img/llm/llama-3-1-mmlu-performance.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

# Introducing Llama 3.1

Yesterday's Llama 3.1 release marked a big milestone for LLM researchers and practitioners. Llama 3.1 405B is the biggest and most capable LLM with openly available LLMs. And particularly exciting is that the new Llama release comes with a 93-page research paper this time. Below, I want to share a few interesting facts from the paper, and I will likely write a longer analysis this weekend.

> Meta announcement 👉 <https://ai.meta.com/blog/meta-llama-3-1/>
{: .prompt-info}

True to our commitment to open source, starting today, we’re making these models available to the community for download on [llama.meta.com](https://llama.meta.com/) and [HuggingFace](https://huggingface.co/collections/meta-llama/llama-31-669fc079a0c406a149a5738f) and available for immediate development on our broad ecosystem of partner platforms.

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Introducing Llama 3.1 - details </summary>

### Model sizes

Llama 3.1 now comes in 3 sizes: 8B, 70B, and 405B parameters. The 8B and 70B variants are sight upgrades from the previous Llama 3 models that have been released in April 2024. (See the figure below for a brief performance comparison). 

The 405B model was used to improve the 8B and 70B via synthetic data during the finetuning stages.

### Pretraining Data

The 93-page report by Meta (a link to the report is in the comments below) offers amazing detail. Particularly, the section on preparing the 15.6 trillion tokens for pretraining offers so much detail that it would make it possible to reproduce the dataset preparation. 

However, Meta doesn't share the dataset sources. All we know is that it's trained primarily on "web data." This is probably because of the usual copyright concerns and to prevent lawsuits.

Still, it's a great writeup if you plan to prepare your own pretraining datasets as it shares recipes on deduplication, formatting (removal of markdown markers), quality filters, removal of unsafe content, and more.

### Long-context Support

The models support a context size of up to 128k tokens. The researchers achieved this via a multiple-stage process. First, they pretrained it on 8k context windows (due to resource constraints), followed by continued pretraining on longer 128k token windows. 

In the continued pretraining, they increased the context length in 6 stages. Moreover, they also observed that finetuning requires 0.1% of long-context instruction samples; otherwise, the long-context capabilities will decline.

### Alignment

In contrast to earlier rumors, Llama 3 was not finetuned using both RLHF with proximal policy optimization (PPO) and direct preference optimization (DPO). Following a supervised instruction finetuning stage (SFT), the models were only trained with DPO, not PPO. 
(Unlike in the Llama 2 paper, unfortunately, the researchers didn't include a chart analyzing the improvements made via this process.).

 Although they didn't use PPO, they used a reward model for rejection sampling during the instruction finetuning stage.

### Inference

The 405B model required 16k H100 GPUs for training. 

During inference, the bfloat16-bit version of the model still requires 16 H100 GPUs. However, Meta also has an FP8 version that runs on a single server node (that is, 8xH100s).

### Performance

You are probably curious about how it compares to other models. 

The short answer is "very favorable", on par with GPT4. Unfortunately, I exceeded the character limit for this LinkedIn post, so I will let the figure below speak for itself.

</details>

## Summarization

It took months to train on 16,000 Nvidia H100 GPUs, resulting in a 405B parameter model with a 128K token context length, which, according to the benchmarks, is mostly superior to OpenAI's GPT-4.

Benchmarks can be biased; more parameters do not guarantee better performance. I guess the only way to figure out how amazing it is has to be real feedback from users over time.

The most exciting thing about LLaMA is that it is almost open-source, although there are some restrictions. 

➡️Let's see what's open-source and what's not:

- Commercial use is allowed, unless your app has over 700 million active users, in which case you'll need to obtain a license from Meta.

- While the training data for LLaMA 3.1 is not open, the training code is publicly available. This consists of approximately 300 lines of Python and PyTorch, along with the FairScale library for distributed GPU training.

- Another cool part is that the model weights are open. This can help developers build AI-powered apps. Instead of paying to use the GPT-4 API, you can now self-host your own model and pay a cloud provider a bunch of money to rent some GPUs.


* * *

![ Llama 3.1 Ultra-Efficiently ](/assets/img/llm/llama-3-1-ultra-efficiently.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

# 🦥 Fine-tune Llama 3.1 Ultra-Efficiently with Unsloth AI

New comprehensive guide about supervised fine-tuning on Hugging Face. 

Over the last year, I've done a lot of fine-tuning and blogging. This guide brings it all together. Here are the main takeaways:

- How to efficiently fine-tune a Llama 3.1 model in Google Colab
- When you should use fine-tuning and how it works
- How to tune the hyperparameters, process datasets, etc.

> - 📝 Article: <https://huggingface.co/blog/mlabonne/sft-llama3>
> - 💻 Colab: <https://colab.research.google.com/drive/164cg_O7SV7G8kZr_JXqLd6VC7pd86-1Z>
{: .prompt-info}

* * * 

![ Llama 3.1 Technical Report ](/assets/img/llm/llama-3-1-technical-report.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

# 𝗟𝗹𝗮𝗺𝗮 𝟯.𝟭 𝘁𝗲𝗰𝗵𝗻𝗶𝗰𝗮𝗹 𝗿𝗲𝗽𝗼𝗿𝘁 - 𝗮 𝘁𝗿𝗲𝗮𝘀𝘂𝗿𝗲 𝘁𝗿𝗼𝘃𝗲 𝗼𝗻 𝗟𝗟𝗠 𝗯𝘂𝗶𝗹𝗱𝗶𝗻𝗴 🎁

I really advise you to remember the Llama 3.1 technical report published last week by Meta, for future reference whenever you need to build a SOTA LLM from scratch. It's rare to see so much information in a technical report these days!
Here are some of my takeaways.

### 𝗦𝗰𝗮𝗹𝗶𝗻𝗴 𝗹𝗮𝘄𝘀

🧐 A question I had for a long time: are scaling laws reliable? I.e. can you really predict how model performance will grow as you increase compute spent?

➡️ The researchers have confirmed that you can derive scaling laws from smaller models: more precisely, the loss function of your best model will decrease linearly with the log of the compute that you spend to train it. For a clearer view, look at the figure below. This result has already been shown before (cf. Chinchilla paper) so no groundbreaking news here.

But computing these scaling laws is costly, so generally the experiments don't go very far up in compute, only up to 10^22 FLOPs (floating point operations). The question thus persists: "are these scaling laws reliable for higher compute spent?"

💡 What the report shows here is that the scaling laws computed up to 10^22 FLOPs actually do hold for much higher compute ✅ you can keep drawing a straight line on the graph up to over 10^25 FLOPs, four orders of magnitude higher, and you accurately predict the loss for the huge Llama-3.1-405B! 🤯

This suggests one could keep drawing the line even further and get an idea of the performance of multi-trillion parameter models!

### 𝗧𝗼𝗼𝗹 𝘂𝘀𝗲 (𝗮𝗴𝗲𝗻𝘁𝗶𝗰) 𝘁𝗿𝗮𝗶𝗻𝗶𝗻𝗴

Tool use training is still very new. Existing fine-tuning procedures are often limited to one tool call (so no multi-step calls), are limited to a specific syntax... Here, the team has gone further:
- ➤ Used synthetically generated tool calling datasets with all 3 of these: Single tool call, nested calls (one tool call requiring the output of another) and parallel tool calls.
- ➤ Create both a single-call and a multi-step tool call dataset. Both exist in a preference version where the annotator picked the best answer, in order to perform DPO.

🛠️ Specifically train their models for 3 tools: python code interpreter, Brave browser and Wolfram API: this is meaningful IMO since these tools are a strong basis for many agents problems.

###  𝗢𝘁𝗵𝗲𝗿 𝗶𝗻𝘀𝗶𝗴𝗵𝘁𝘀
- 💥 They used 16,000 H100 🥲
- 🛠️ Parallelize the training in 4D: Tensor, pipeline, context parallelism, and FSDP.
- ⚙️ For the post training, do not use any complciated RLHF pipeline like GPT-4, but simply several rounds of Supervised Fine-tuning (SFT) + DPO