---
title: 3 common methods for improving the performance of LLM👏
description: Performance, Improving
categories:
- LLM & Language Models
tags:
- llm
- improving
- language-model
date: 2024-07-16 12:30:00 +0800
pin: true
---
### 3 comon methods

1. Prompt Engineering
2. Retrieval Augmented Generation (RAG)
3. Parameter Efficient Fine-Tuning (PEFT)

There are many more methods but these are the easiest and can result in major improvements without much work.

These 3 methods start from the least complex method, the so-called low-hanging fruits, to one of the more complex methods for improving your LLM.

To get the most out of LLMs, you can even combine all three methods!

1. Prompt Engineering:
Prompt Engineering is the practice of designing and refining inputs (prompts) to effectively interact with language models, especially large pre-trained ones like GPT-3 or GPT-4. The goal is to elicit the most accurate, relevant, or creative responses from the model. 

This involves crafting prompts that are clear, contextually rich, and aligned with the model's training to guide it towards desired outputs. 

This tailoring of your prompt is called prompt engineering.
Prompt engineering is such an amazing way to “tune” your model. It requires no updating of the model and you can quickly iterate over it.

2. Retrieval-Augmented Generation (RAG):
Retrieval-Augmented Generation (RAG) is a technique in natural language processing that combines the power of pre-trained language models with a retrieval mechanism to enhance the generation of text. 

Essentially, it involves two components: a retriever that fetches relevant documents or data snippets from a large corpus, and a generator that incorporates this retrieved information to produce more informed, accurate, and contextually relevant text outputs. 

In RAG, a knowledge base, like Wikipedia, is converted to numerical representations to capture its meaning, called embeddings. These embeddings are stored in a vector database so that the information can easily be retrieved.

3. Parameter Efficient Fine-Tuning (PEFT):
Parameter Efficient Fine-Tuning (PEFT) is a method used in machine learning, particularly in the context of fine-tuning large pre-trained models like language or image models. 

The primary goal of PEFT is to adapt a model to a new task or dataset with minimal updates to its parameters. This is crucial for large models where full fine-tuning can be computationally expensive and time-consuming. 

Techniques under PEFT, such as adapters, prompt tuning, or low-rank updates, typically involve adding small, task-specific parameter modules or making slight modifications to the model's existing parameters. 

These techniques allow the model to retain its general knowledge learned during pre-training while efficiently adapting to new tasks, leading to faster training times, reduced computational costs, and often better task-specific performance.


![ Method for Improving LLMs ](/assets/img/llm/Method-for-Improving-LLM.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }
