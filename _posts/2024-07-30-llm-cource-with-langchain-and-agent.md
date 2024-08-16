---
title: An introduction to LangChain and Agents is provided
description: LLM, Course
categories: [LLM, Course]
tags: [LLM, Course]
# author: foDev_jeong
date: 2024-07-30 13:00:00 +0800
pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

> LLMs Course Github 👉 <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/tree/main/3-LangChain>
{: .prompt-info}


## 🔷 The RAG system from the second part is modified to use LangChain.
Article:<https://pub.towardsai.net/query-your-dataframes-with-powerful-large-language-models-using-langchain-abe25782def5>
Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/3-LangChain/3_1_RAG_langchain.ipynb>

## 🔷 A moderation system is created where two Models are linked, with the second one responsible for moderating and providing the response to the user. There are three examples, one with OpenAI Models, and two more with open-source models: Llama and GPT-J.

Article and notebook using OpenAI models: 
- <https://pub.towardsai.net/create-a-self-moderated-commentary-system-with-langchain-and-openai-406a51ce0c8d>
- <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/3-LangChain/3_2_OpenAI_Moderation_Chat.ipynb>
Article and notebook using Llama: 
- <https://levelup.gitconnected.com/create-a-self-moderated-comment-system-with-llama-2-and-langchain-656f482a48be>
- <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/3-LangChain/3_2_LLAMA2_Moderation_Chat.ipynb>

## 🔷The course continues by creating a Data Analyst using an agent from the langchain_experiments library, capable of interpreting tabular data files from a .csv file. 
Article: <https://pub.towardsai.net/create-your-own-data-analyst-assistant-with-langchain-agents-722f1cdcdd7e>
Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/3-LangChain/3_3_Data_Analyst_Agent.ipynb>

## 🔷 Finally, a chatbot is created to serve as a medical assistant using LangChain and ChromaDB with a medical data dataset. 
Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/3-LangChain/3_4_Medical_Assistant_Agent.ipynb>

As you can see, this part of the course uses a few examples to introduce you to LangChain and reinforce the knowledge you gained in the second lesson on vector database

* * *

# I just finished reviewing the Large Language Models Evaluation section of the free course available on GitHub. 

## 🔷 It starts with a brief introduction to n-grams and classic evaluation metrics like Bleu for translations and ROUGE for summaries.

▪️Evaluating translations with BLEU. 
- Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/4-Evaluating%20LLMs/4_1_bleu_evaluation.ipynb>
  
▪️Evaluating Summarisations with ROUGE.
- Article: <https://pub.towardsai.net/rouge-metrics-evaluating-summaries-in-large-language-models-d200ee7ca0e6>
- Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/4-Evaluating%20LLMs/4_1_rouge_evaluations.ipynb>

## 🔷 Once introduced to the world of metrics, the course moves on to using a tool like LangSmith, first to monitor the internal calls of an agent created with LangChain, and then to measure the quality of summaries using the distance between embeddings. 

This second example is used to introduce LangSmith's evaluators and shows how to use it to measure more than one metric at a time and detect harmful content in summaries.

▪️Evaluating the quality of summaries using Embedding distance with LangSmith.
- Article: <https://pub.towardsai.net/evaluating-llm-summaries-using-embedding-distance-with-langsmith-5fb46fdae2a5>
- Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/4-Evaluating%20LLMs/4_2_Evaluating_summaries_embeddings.ipynb>

## 🔷 Finally, a very powerful tool called Giskard is presented, which serves, among other things, to evaluate RAG solutions. Like LangSmith, Giskard uses Large Language Models to evaluate other Large Language Models. 

This is one of the evaluation trends that seems to be gaining more notoriety. 

▪️Evaluating a RAG solution with Giskard. 
- Notebook: <https://github.com/peremartra/Large-Language-Model-Notebooks-Course/blob/main/4-Evaluating%20LLMs/4_3_evaluating_rag_giskard.ipynb>

The evaluation of tools built with Language Models is one of the fastest evolving fields. The complexity of evaluating whether a result is correct or not is often leading to relying on one of the most advanced Large Language Models to evaluate the results of other specialized ones.

In these examples, you see everything from the most classic metrics to the latest tools that not only evaluate the quality of the text produced by the Large Language Model but also all the layers that are part of a RAG solution.

This is just an introduction because several books could be written about this field. But if you go through all the examples, you will have a fairly broad overview and will have learned about different tools.