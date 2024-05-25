---
title: VectorEmbeddings are the backbone of AI/ML applications
description: LLM, VectorEmbedding
categories: [LLM, VectorEmbedding]
tags: [LLM, VectorEmbedding]
# author: foDev_jeong
date: 2024-05-18 16:15:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## VectorEmbeddings are the backbone of AI/ML applications. 

Machines don't understand human language & that is where we need embeddings. 

LLMs store the meaning and context of the data fed in a specialized format known as embeddings. Imagine capturing the essence of a word, image or video in a single mathematical equation. That’s the power of vector embeddings — one of the most fascinating and influential concepts in machine learning today.

For example, the images of animals like cat and dog are unstructured data and cannot be directly stored in a database. Hence, they will be converted into machine readable format, that's what we call embeddings and then stored in a vector database. 

By translating unstructured and high-dimensional data into a lower-dimensional space, embeddings make it possible to perform complex computations more efficiently.

### Types of Embedding:

While most of us have commonly used text embedding, Embeddings can also be utilised for various types of data, such as images, graphs, and more.

- ⮕ Word Embeddings: Embedding of Individual words. Models: Word2Vec, GloVe, and FastText.

- ⮕ Sentence Embeddings Embedding of entire sentences as vectors that capture the overall meaning and context of the sentences. Models: Universal Sentence Encoder (USE) and SkipThought.

- ⮕ Document Embeddings Embedding of entire sentences capturing the semantic information and context of the entire document. Models: Doc2Vec and Paragraph Vectors.

- ⮕ Image Embeddings — captures different visual features. Models: CNNs, ResNet and VGG.

- ⮕ User/Product Embeddings represent users/products in a system as vectors. Capture user/products preferences, behaviors, attributes and characteristics. These are primarily used in recommendation systems.

### Below are some common embedding models we can use.
- ⮕ Cohere’s Embedding: Powerful for processing short texts with under 512 tokens.

- ⮕ Mistral Embedding: Strong embedding for AI/ML modeling like text classification, sentiment analysis etc.

- ⮕ Open AI Embeddings: Open AI is currently one of the market leaders for Embedding Algorithms. Of the all, OpenAI second-gen text-embedding model, ada-002, has proven to give top-notch results across various use cases. 

### Know more about vector embeddings in these below articles.
- ⦿ Embedding: Types, Use cases and Evaluation: <https://durgiachandan.medium.com/embedding-types-use-cases-and-evaluation-part-3-of-rag-series-1fd9f64454a9>

- ⦿ Vector Embeddings Explained for Developers: <https://levelup.gitconnected.com/vector-embeddings-explained-for-developers-6bd9800d3635>

- ⦿ A Complete Guide to Creating and Storing Vector Embeddings: <https://levelup.gitconnected.com/a-complete-guide-to-creating-and-storing-vector-embeddings-aaede9822bcd>


![ VectorEmbeddings](/assets/img/blog/Vectorembedding_backbone.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## VectorEmbeddings AI/ML 애플리케이션의 중추입니다. 

기계는 인간의 언어를 이해하지 못하기 때문에 임베딩이 필요합니다. 

LLM은 임베딩(embedding)이라는 특수한 형식으로 공급되는 데이터의 의미와 컨텍스트를 저장합니다. 단어, 이미지 또는 비디오의 본질을 하나의 수학 방정식으로 캡처한다고 상상해 보십시오. 이것이 바로 벡터 임베딩의 힘이며, 오늘날 기계 학습에서 가장 매력적이고 영향력 있는 개념 중 하나입니다.

예를 들어, 고양이나 개와 같은 동물의 이미지는 구조화되지 않은 데이터이며 데이터베이스에 직접 저장할 수 없습니다. 따라서 기계가 읽을 수 있는 형식으로 변환되어 임베딩이라고 하는 다음 벡터 데이터베이스에 저장됩니다. 

임베딩은 구조화되지 않은 고차원 데이터를 저차원 공간으로 변환함으로써 복잡한 계산을 보다 효율적으로 수행할 수 있도록 합니다.

### 임베딩 유형:

우리 대부분은 일반적으로 텍스트 임베딩을 사용하지만 임베딩은 이미지, 그래프 등과 같은 다양한 유형의 데이터에도 활용할 수 있습니다.

- ⮕ 단어 임베딩: 개별 단어의 임베딩. 모델: Word2Vec, Glove 및 FastText.

- ⮕ 문장 임베딩: 문장의 전체적인 의미와 맥락을 포착하는 벡터로 전체 문장을 임베딩합니다. 모델: USE(Universal Sentence Encoder) 및 SkipThought.

- ⮕ 문서 임베딩: 전체 문서의 의미 정보와 컨텍스트를 캡처하는 전체 문장의 임베딩. 모델: Doc2Vec 및 단락 벡터.

- ⮕ 이미지 임베딩 — 다양한 시각적 기능을 캡처합니다. 모델: CNN, ResNet 및 VGG.

- ⮕ 사용자/제품 임베딩은 시스템의 사용자/제품을 벡터로 나타냅니다. 사용자/제품 선호도, 행동, 속성 및 특성을 캡처합니다. 이들은 주로 추천 시스템에서 사용됩니다.

### 다음은 우리가 사용할 수 있는 몇 가지 일반적인 임베딩 모델입니다.
- ⮕ Cohere의 임베딩: 512개 미만의 토큰이 있는 짧은 텍스트를 처리하는 데 강력합니다.

- ⮕ Mistral Embedding: 텍스트 분류, 감정 분석 등과 같은 AI/ML 모델링을 위한 강력한 임베딩

- ⮕ 개방형 AI 임베딩: 개방형 AI는 현재 임베딩 알고리즘 시장의 선두 주자 중 하나입니다. 그 중에서도 OpenAI 2세대 텍스트 임베딩 모델인 ada-002는 다양한 사용 사례에서 최고의 결과를 제공하는 것으로 입증되었습니다. 

### 아래 기사에서 벡터 임베딩에 대해 자세히 알아보십시오.
- ⦿ 임베딩: 유형, 사용 사례 및 평가: <https://durgiachandan.medium.com/embedding-types-use-cases-and-evaluation-part-3-of-rag-series-1fd9f64454a9>

- ⦿ 개발자를 위한 벡터 임베딩 설명: <https://levelup.gitconnected.com/vector-embeddings-explained-for-developers-6bd9800d3635>

- ⦿ 벡터 임베딩 생성 및 저장에 대한 완벽한 가이드: <https://levelup.gitconnected.com/a-complete-guide-to-creating-and-storing-vector-embeddings-aaede9822bcd>

</details>