---
title: Choice of Vector Database significantly impacts the LLM application's performance. 
description: LLM,Vector Database
categories: [LLM, VectorDatabase]
tags: [LLM,VectorDatabase]
# author: foDev_jeong
date: 2024-07-11 22:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## Vector Database significantly impacts the LLM applicaition's performance

![ Vector Database ](/assets/img/llm/Vector-Database.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

Image credit : <https://neptune.ai/blog/building-llm-applications-with-vector-databases>

Vector databases store and index high-dimensional vectors, which represent embeddings of text, images or other data in numerical format that captures their semantic meaning. 

> **The choice of DB impacts** ( [Reference article](https://arxiv.org/html/2402.01763v1) ):
> 1. Search speed 
> 2. Accuracy of similarity matching 
> 3. Scalability 
> 4. Memory usage
{: .prompt-info}

![ Vector Database Use Case ](/assets/img/llm/Use-case-Vector-Database-in-RAG-framework.png){: .light .shadow .rounded-10 w='1212' h='668' }

![ Overview that utilize Vector Database ](/assets/img/llm/Overview-that-Utilizes-Vector-Database.png){: .light .shadow .rounded-10 w='1212' h='668' }

For ex.

### (1) Real-Time Product Recommendations

Scenario: An online retailer needs to recommend products to users in real-time based on their browsing history.

DB Choice: PINECONE, due to its high-speed query performance and scalability, allows the system to quickly retrieve and recommend products, enhancing user experience.

### (2) Semantic Text Search

Scenario: A research organization needs to search through a large corpus of scientific papers to find relevant documents based on semantic similarity.

DB Choice: MILVUS, with its robust indexing and scalability, enables efficient and accurate semantic searches across billions of document embeddings.

### (3) Voice Assistant

Scenario: A voice assistant needs to process and respond to user queries instantly.

DB Choice: FAISS, optimized for low latency and fast retrieval, ensures the assistant can quickly understand and respond to queries, providing a smooth user experience.

-------------------------------------

If you are building a Vector DB, optimize the chunk size and consider how you turn chunks into embeddings.

AND, there is NO BEST CHUNK SIZE. 
To find the appropriate chunk size for your system, embed your documents using different chunk sizes and evaluate which chunk size yields the best retrieval results. 

Also, You are not forced to stick to the (chunk embedding, chunk) pairs. You can modify the embeddings you use as the index for retrieval.

You can summarize your chunks using an LLM before running it through the embedding model. 
These summaries will be much shorter and contain less meaningless filler text, which might “confuse” or “distract” your embedding model.

----------------------------------------

Choosing, optimizing, or building an efficient Vector DB is a multi-step process. 

You can significantly enhance the speed, accuracy, and scalability of your LLM-based system, leading to better overall performance and user experience following the right approach. 


## 😎 Text-to-SQL is one of the most prevalent enterprise applications of LLMs. If you're in this space, this super comprehensive survey report is a must-read!

> Next-Generation Database Interface 😎 
> - Paper : <https://arxiv.org/pdf/2406.08426>
{: .prompt-danger}

⛳ Here's everything the paper contains:

### 👉 Datasets and Benchmarks
 Provides an overview of commonly used datasets and benchmarks for evaluating LLM-based Text-to-SQL systems. 
 
 It discusses the characteristics, complexity, and challenges these datasets pose for system development and evaluation.
### 👉 Evaluation Metrics
 Presents the evaluation metrics used to assess the performance of LLM-based Text-to-SQL systems, including accuracy, exactness, and execution correctness. 
 
 The paper also discusses the advantages and limitations of each metric and their relevance to real-world applications.
### 👉 Methods and Models
 Explores the different methods and models employed for LLM-based text-to-SQL, including in-context learning and fine-tuning-based paradigms. 
 
 It discusses their implementation details, strengths, and adaptations specific to the text-to-SQL task.
### 👉 Expectations and Future Directions
 Discusses the current challenges and limitations of LLM-based Text-to-SQL, such as real-world robustness, computational efficiency, data privacy, and extensions. 
 
 It also outlines potential future research directions and opportunities for improvement.

 ![ Next Generation Database Interface ](/assets/img/llm/Next-Generation-Database-Interface.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Explain How to use Vector Embeeding </summary>


### Let's create VectorEmbeddings for free. [Hands-On Tutorial]

{% include embed/youtube.html id='UFW9wUotP1I' %}

Vector embeddings carry the contextual meaning of the objects that machines can easily understand. 

Using Cohere & Hugging Face, you can create vector embeddings for free.

Here is my complete tutorial on creating vector embeddings using different platforms


</details>