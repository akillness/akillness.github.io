---
title: 5 techniques to fine-tune LLMs, explained visually!
description: LLM, PEFT, Visualization
categories: [LLM, PEFT]
tags: [LLM, PEFT]
# author: foDev_jeong
date: 2024-06-10 10:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

> Check more PEFT (Parameters Efficient Fine-Tuning) methods : <https://huggingface.co/docs/peft/index>
{: .prompt-info }

## Fine-tuning large language models traditionally involved adjusting billions of parameters, demanding significant computational power and resources. 

However, the development of some innovative methods have transformed this process. 

Here’s a snapshot of five cutting-edge techniques for finetuning LLMs, each explained visually for easy understanding.

#### LoRA:

- Introduce two low-rank matrices, A and B, to work alongside the weight matrix W.
- Adjust these matrices instead of the behemoth W, making updates manageable.

#### LoRA-FA (Frozen-A):

- Takes LoRA a step further by freezing matrix A.
- Only matrix B is tweaked, reducing the activation memory needed.

#### VeRA:

- All about efficiency: matrices A and B are fixed and shared across all layers.
- Focuses on tiny, trainable scaling vectors in each layer, making it super memory-friendly.

#### Delta-LoRA:

- A twist on LoRA: adds the difference (delta) between products of matrices A and B across training steps to the main weight matrix W.
- Offers a dynamic yet controlled approach to parameter updates.

#### LoRA+:

- An optimized variant of LoRA where matrix B gets a higher learning rate.
This tweak leads to faster and more effective learning.

Credits to Avi Chawla for great visualisation! 👏

![ Visualization 5 fine-tune LLMs  ](/assets/img/llm/LLM_Finetune_visualization.gif){: .light .shadow .rounded-10 w='1212' h='668' }

#### ❓ Why can't we use regular LoRA for pre-training LLMs ❓

- 📌 LoRA (Low-Rank Adaptation), targets a subset of a neural network's parameters, specifically focusing on the weight matrices of transformer models. 

It represents these large matrices as the product of smaller, low-rank matrices. This approach significantly reduces the number of parameters that need to be updated during fine-tuning.

- 📌 This constraint (focusing on a small, low-rank subspace of the model's parameters) is beneficial for fine-tuning because it allows for efficient adaptation of a pre-trained model to a specific task with minimal changes to the original parameter space. 

It effectively balances the need for model adaptation while retaining much of the pre-trained knowledge.

- 📌 During pre-training, however, the goal is to explore and learn a broad representation of the data domain without any specific task constraints. 
  
Restricting the model to a low-rank subspace, as LoRA does, would constrain the model's capacity to learn diverse and general features from the data. 

Pre-training benefits from having as few restrictions as possible on the model's capacity to learn and represent information, which is why the full parameter space is typically utilized.

![ Visualization 5 fine-tune LLMs  ](/assets/img/llm/What-is-LoRA.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Fine-Tuning Embedding Models for Semantic Search </summary>

Marqo published a short course (free, no login) on finetuning embedding models for Semantic Search, covering the foundations of embeddings, vector databases all the way to finetuning embedding models with Sentence Transformers, Vision Transformers, and CLIP/Multimodal models.

> Check it out here: <https://marqo.ai/courses/fine-tuning-embedding-models>
{: .prompt-info}

It is a very complete overview, and I'd recommend reading it & running the corresponding code to learn how to do all of this yourself. 

Here are the current chapters:
1. Introduction to Vector Embeddings
2. Foundations of Embedding Models
3. Introduction to Vector Databases
4. Build Your First Vector Search Application
5. Introduction to Sentence Transformers
6. Training and Fine-Tuning Sentence Transformers
7. Introduction to Vision Transformers
8. Training and Fine-Tuning Vision Transformers
9. Introduction to CLIP and Multimodal Models
10. Fine-Tuning CLIP Models

Great work on this by Ellie Sleightholm. Semantic Search/Retrieval models are oh so important, and finetuning them remains one of the best ways to get the most out of the existing models.


</details>