---
title: Struggling to Optimize Your RAG Setup? 😮
description: LLM, RAG
categories:
  - RAG/Search
tags:
  - RAG
  - Embedding
  - Search
date: 2024-08-03 12:00:00 +0800
mermaid: true
---
![ RAGBuilder ](/assets/img/llm/ragbuilder-optimizing-rag.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

Not sure if you chunked your data right to enable optimal context retrieval?

Not sure which embedding model will work best for your data?

Don’t worry, you’re not alone..
 
## A RAG has several moving parts: data ingestion, retrieval, re-ranking, generation etc.. Each part comes with numerous options. 

*Curiosity:* If we consider a toy example, where you could choose from: 


- 5 different chunking methods,
- 5 different chunk sizes,
- 5 different embedding models,
- 5 different retrievers,
- 5 different re-rankers/ compressors
- 5 different prompts
- 5 different LLMs

👉 That’s 78,125 distinct RAG configurations! 

If you could try evaluating each one in just 5 mins, that’d still take 271 days of non-stop trial-and-error effort! In short, it’s kinda impossible to find your optimal RAG setup manually.

## So, how do you determine the most optimal RAG configuration for your data and use-case?

*Curiosity:* What insights can we retrieve from this? How does this connect to innovation in the field?

Use hyperparameter tuning - an ML technique for identifying the optimal values for your parameters when there’s a large set of possible values.

But, how do you do it without writing a bunch of code to do hyperparameter tuning?

I stumbled upon this tool ‘RAGBuilder’ that takes your data as an input, and runs hyperparameter tuning on the various RAG parameters (like chunk size, embedding etc.) evaluating multiple configs, and shows you a dashboard where you can see the top performing RAG setup, and in 1-click generate the code for that RAG setup. 

So you can go from your RAG use-case to production-grade RAG setup in just minutes.

Best part, it’s open source with active contributors.

> Check out the RAGBuilder Github repo 👉 <https://github.com/KruxAI/ragbuilder>
{: .prompt-info}
