---
title: Choice of Vector Database significantly impacts the LLM application's performance.
description: LLM,Vector Database
categories:
- LLM & Language Models
tags:
- llm
- vectordatabase
- language-model
date: 2024-07-11 22:00:00 +0800
mermaid: true
---
## Choosing the Right Vector Database for LLM Applications

*Curiosity:* How does vector database choice impact LLM application performance? What factors should we consider when selecting a vector database?

**Vector databases** store and index high-dimensional vectors representing embeddings of text, images, or other data in numerical format that captures semantic meaning. The choice of database significantly impacts LLM application performance.

![ Vector Database ](/assets/img/llm/Vector-Database.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

> **Image Credit**: <https://neptune.ai/blog/building-llm-applications-with-vector-databases>
{: .prompt-info}

### Impact of Vector Database Choice

*Retrieve:* Key factors affected by database selection.

> **Reference**: <https://arxiv.org/html/2402.01763v1>
{: .prompt-info}

| Factor | Impact | Importance |
|:-------|:-------|:-----------|
| **Search Speed** | Query latency | ⬆️ User experience |
| **Similarity Accuracy** | Retrieval quality | ⬆️ Answer quality |
| **Scalability** | Handle growth | ⬆️ Production readiness |
| **Memory Usage** | Resource efficiency | ⬇️ Costs |

### Vector Database Architecture

*Innovate:* How vector databases work in LLM applications.

```mermaid
graph TB
    A[Documents] --> B[Embedding Model]
    B --> C[Vector Embeddings]
    C --> D[Vector Database]
    D --> E[Indexing]
    
    F[User Query] --> G[Query Embedding]
    G --> H[Similarity Search]
    H --> D
    D --> I[Top-K Results]
    I --> J[LLM Context]
    J --> K[Answer Generation]
    
    style A fill:#e1f5ff
    style D fill:#fff3cd
    style K fill:#d4edda
```

![ Vector Database Use Case ](/assets/img/llm/Use-case-Vector-Database-in-RAG-framework.png){: .light .shadow .rounded-10 w='1212' h='668' }

![ Overview that utilize Vector Database ](/assets/img/llm/Overview-that-Utilizes-Vector-Database.png){: .light .shadow .rounded-10 w='1212' h='668' }

### Use Case Examples

*Retrieve:* Real-world vector database selection scenarios.

#### 1. Real-Time Product Recommendations

*Scenario*: Online retailer needs real-time product recommendations based on browsing history.

**DB Choice**: **PINECONE**

| Requirement | Why Pinecone | Benefit |
|:------------|:-------------|:--------|
| **High Speed** | Optimized query performance | ⬆️ Real-time responses |
| **Scalability** | Handles large catalogs | ⬆️ Growth support |
| **User Experience** | Fast retrieval | ⬆️ Engagement |

#### 2. Semantic Text Search

*Scenario*: Research organization needs to search through large corpus of scientific papers.

**DB Choice**: **MILVUS**

| Requirement | Why Milvus | Benefit |
|:------------|:-----------|:--------|
| **Robust Indexing** | Advanced indexing algorithms | ⬆️ Search accuracy |
| **Scalability** | Billions of embeddings | ⬆️ Large datasets |
| **Efficiency** | Optimized for research | ⬆️ Performance |

#### 3. Voice Assistant

*Scenario*: Voice assistant needs instant query processing and responses.

**DB Choice**: **FAISS**

| Requirement | Why FAISS | Benefit |
|:------------|:----------|:--------|
| **Low Latency** | Optimized for speed | ⬆️ Instant responses |
| **Fast Retrieval** | Efficient similarity search | ⬆️ User experience |
| **Performance** | Facebook's optimization | ⬆️ Reliability |

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


## Text-to-SQL: Next-Generation Database Interface

*Retrieve:* Comprehensive survey on LLM-based Text-to-SQL systems.

**Text-to-SQL** is one of the most prevalent enterprise applications of LLMs. This comprehensive survey report is essential reading for anyone in this space.

> **Paper**: <https://arxiv.org/pdf/2406.08426>
{: .prompt-danger}

### Survey Contents

*Retrieve:* What the paper covers.

| Section | Content | Value |
|:--------|:--------|:------|
| **Datasets & Benchmarks** | Common datasets, characteristics, challenges | ⬆️ Evaluation framework |
| **Evaluation Metrics** | Accuracy, exactness, execution correctness | ⬆️ Performance assessment |
| **Methods & Models** | In-context learning, fine-tuning paradigms | ⬆️ Implementation guidance |
| **Future Directions** | Challenges, limitations, opportunities | ⬆️ Research roadmap |

**Key Topics**:
- Dataset characteristics and complexity
- Evaluation metric advantages/limitations
- Implementation details and adaptations
- Real-world robustness and efficiency
- Data privacy and extensions

 ![ Next Generation Database Interface ](/assets/img/llm/Next-Generation-Database-Interface.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Explain How to use Vector Embeeding </summary>


### Let's create VectorEmbeddings for free. [Hands-On Tutorial]

{% include embed/youtube.html id='UFW9wUotP1I' %}

Vector embeddings carry the contextual meaning of the objects that machines can easily understand. 

Using Cohere & Hugging Face, you can create vector embeddings for free.

Here is my complete tutorial on creating vector embeddings using different platforms


</details>