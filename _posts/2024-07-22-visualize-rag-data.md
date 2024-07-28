---
title:  Visualize your RAG Data — EDA for Retrieval-Augmented Generation. 
description: LLM, RAG Visualization
categories: [LLM, RAG Visualization]
tags: [RAG Visualization, Spotlight]
# author: foDev_jeong
date: 2024-07-22 14:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## The article provides a step-by-step tutorial on how to create an interactive visualization for RAG embedding data with Renumics Spotlight.

> This simplified tutorial will walk you through each phase of developing RAG applications, with a special focus on the role of visualizing the results.
> - Github : <https://github.com/Renumics/renumics-rag/blob/main/notebooks/visualize_rag_tutorial.ipynb>
{: .prompt-info}

![ UMAP dimensionality reduction of the embeddings of document snippets ](/assets/img/llm/RAG-Data-Visualization.gif){: .light .shadow .rounded-10 w='1212' h='668' }*dd*


> Author : <https://www.linkedin.com/in/markus-stoll-b39a42138/>
> - GitHub : <https://github.com/Renumics/spotlight>
> - Article : <https://itnext.io/visualize-your-rag-data-eda-for-retrieval-augmented-generation-0701ee98768f>
{: .prompt-tip}

The article provides a step-by-step tutorial on how to create an interactive visualization for RAG embedding data with Renumics Spotlight .

### 🚀 You will build a visualization for a LangChain Retrieval-Augmented Generation Application with ChromaDB based on OpenAI's text-embedding-ada-002 and GPT-4. 

The demo data (🏎️ Formula One Dataset built from Wikipedia articles) can be easily changed to your own data.

### 📖 Check out the full article on ITNEXT

The animation here shows the UMAP dimensionality reduction of the embeddings of document snippets, colored by their relevance to the question "Who built the Nürburgring?"

![ Overview of Spotlight ](/assets/img/llm/Spotlight-Overview.gif){: .light .shadow .rounded-10 w='1212' h='668' }
