---
title: "Deep Dive into Vector Databases by Hand"
description: "Deep Dive into Vector Databases by Hand ✍︎ | by Srijanie Dey, PhD | Towards Data Science."
categories: [RAG/Search]
tags: [RAG, Embedding, Search]
date: 2024-05-14 13:10:00 +0800
---
### **Original Article** : 👉 <https://medium.com/towards-data-science/deep-dive-into-vector-databases-by-hand-e9ab71f54f80>

* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/659939>
> Below Summary Note

Deep Dive into Vector Databases by Hand ✍︎ | by Srijanie Dey, PhD | Towards Data Science

#### 1. Deep Dive into Vector Databases
   - Exploring what happens behind the scenes of vector databases
   - Article by Srijanie Dey, PhD, published in Towards Data Science
   - This 8-minute read had 597 readers as of March 20, 2024
   - If you want to read about vector databases, check the share or listen links

#### 2.️ Creating a Children's Book: A Vector Story with LLM Assistance
   - Recently, I asked my favorite *large language model (LLM)* to create a story explaining vectors to my 4-year-old.
   - The language model quickly generated a story filled with mystical creatures, magic, and vectors, producing a tale about a unicorn named 'LuminaVec'.
   - The resulting children's book sketch was impressive, featuring images of 'LuminaVec' brought to life for a 4-year-old audience.

#### 3. How Models Connect Creative Elements
   - Models do not understand words exactly, but comprehend them through **vectors**, which are *numerical representations*.
   - These vectors help find similarities between words and focus on meaningful information for each word.
   - **Embeddings** use lower-dimensional vectors to capture semantic and contextual information.
   - Care is needed when handling these vectors in *LLMs*, as they can become long and complex, spanning hundreds or more dimensions.
   - Processing speed and increasing costs need to be carefully managed.

#### 4. Vector Databases: A Powerful Solution for Scale and Speed Challenges
   - **Vector databases** are specialized databases containing vector embeddings, where similar objects are positioned close to each other in vector space, while different objects are farther apart.
   - Instead of parsing data and generating vector embeddings every time a query occurs, it is much faster to pass data through the model once, store it in a vector database, and retrieve it when needed.
   - This makes vector databases one of the most powerful solutions for the scale and speed challenges of **LLMs**.
   - Looking back at the story about rainbow unicorns, sparkling magic, and powerful vectors, if you had asked the model that question, the following process could have occurred:
   - The embedding model first converted the question into a vector embedding. That vector embedding was compared against a vector database of fun stories for 5-year-olds and about vectors. Based on this search and comparison, the most similar vectors would have been returned.
   - The results would consist of a list of vectors ranked by similarity to the query vector.

#### 5.️ How Vector Databases Work
   - There are excellent resources explaining how vectors and vector databases work, so let us walk through these steps at a micro level.
   - Starting with generating word embeddings from a 21-word text and a table of 22 vectors, the process proceeds to encoding word embeddings over time to obtain a very small number of feature vectors.
   - Then, by querying a word through embedding, encoding, and indexing, we obtain a 2D vector representation of the query, perform a dot product, and find the most similar results.
   - Then, average pooling is applied to obtain text embeddings and sentence embeddings, and finally, nearest neighbor analysis is used to find the most representative results.

#### 6. Processing 'Large-Scale' Data and the Importance of Vector Databases
   - Datasets can contain billions of sentences, with tens of thousands of tokens per sentence and word embedding dimensions reaching thousands.
   - When all this data and these steps are combined, we end up dealing with enormously large dimensions.
   - To handle this massive scale, vector databases are needed, and their ability to process at this scale enables efficient retrieval for RAG models.
   - Therefore, vector databases play a crucial role in Retrieval-Augmented Generation (RAG) models. Additionally, the scalability and speed of vector databases pave the way for efficient generative models. Taking all of this into account, we can say that vector databases are extremely powerful.
