---
title: 🤗 NLP Course - Summary of Concept to Transformer from NLP
description: LLM, NLP, Transformer
categories: [LLM, NLP]
tags: [LLM, NLP, Transformer]
# author: foDev_jeong
date: 2024-05-29 00:13:00 +0800
pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

| Subject | Type | Link|
| :--- | :--- | :---
| NLP Course  | Course | <https://huggingface.co/learn/nlp-course/chapter1/1> |
| The Hugging Face Course | Github | <https://github.com/huggingface/course#-jupyter-notebooks> |


![ LLM Research Trends ](/assets/img/blog/NLP_Overview.svg){: .light  .shadow .rounded-10 w='1212' h='668' }


## Introduction 

This course will teach you about natural language processing (NLP) using libraries from the Hugging Face ecosystem — 🤗 Transformers, 🤗 Datasets, 🤗 Tokenizers, and 🤗 Accelerate — as well as the Hugging Face Hub. It’s completely free and without ads.

{% include embed/youtube.html id='00GKzGyWFEs' %}

#### This course:

- Requires a good knowledge of Python
- Is better taken after an introductory deep learning course, such as fast.ai’s Practical Deep Learning for Coders or one of the programs developed by DeepLearning.AI
- Does not expect prior PyTorch or TensorFlow knowledge, though some familiarity with either of those will help

### What is NLP?

NLP is a field of linguistics and machine learning focused on understanding everything related to human language. The aim of NLP tasks is not only to understand single words individually, but to be able to understand the context of those words.

The following is a list of common NLP tasks, with some examples of each:

- Classifying whole sentences: Getting the sentiment of a review, detecting if an email is spam, determining if a sentence is grammatically correct or whether two sentences are logically related or not
- Classifying each word in a sentence: Identifying the grammatical components of a sentence (noun, verb, adjective), or the named entities (person, location, organization)
- Generating text content: Completing a prompt with auto-generated text, filling in the blanks in a text with masked words
- Extracting an answer from a text: Given a question and a context, extracting the answer to the question based on the information provided in the context
- Generating a new sentence from an input text: Translating a text into another language, summarizing a text
- NLP isn’t limited to written text though. It also tackles complex challenges in speech recognition and computer vision, such as generating a transcript of an audio sample or a description of an image.

#### Why is it challenging?

Computers don’t process information in the same way as humans. For example, when we read the sentence “I am hungry,” we can easily understand its meaning. 

Similarly, given two sentences such as “I am hungry” and “I am sad,” we’re able to easily determine how similar they are. For machine learning (ML) models, such tasks are more difficult. 

The text needs to be processed in a way that enables the model to learn from it. And because language is complex, we need to think carefully about how this processing must be done. There has been a lot of research done on how to represent text, and we will look at some methods in the next chapter.


... (to be continue)
<!-- <details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 내 가이드를 사용하여 다가오는 모든 트렌드를 따라잡으세요! 


</details> -->