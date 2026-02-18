---
title: "Deep Dive into LlaMA 3 by Hand"
description: "Deep Dive into LlaMA 3 by Hand ✍️ | by Srijanie Dey, PhD | May, 2024 | Towards Data Science."
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-05-14 13:13:00 +0800
---
### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-llama-3-by-hand-%EF%B8%8F-6c6b23dc92b2>

* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/659993>
> Below Summary Note

Deep Dive into LlaMA 3 by Hand ✍️ | by Srijanie Dey, PhD | May, 2024 | Towards Data Science

#### 1. Deep Dive into LlaMA 3, May 2024
   - An article by Srijanie Dey, PhD, covering both the surface and internal architecture of LlaMA 3, May 2024.
   - Links provided on the Towards Data Science website for [Open in App], [Sign Up], and [Sign In].
   - [Medium] also provides links for sign-up, login, and posting, with a [Top highlight] image attached at the top of the article.

#### 2. Exploring the Transformer Architecture of LlaMA 3
   - Exploring the detailed components of the transformer architecture behind LlaMA 3 and the outlook for the GenAI ecosystem
   - A story of three beautiful beings — Rio, Rocky, and Sierra — living in the rugged mountains of the Andes
   - They seek a wise elder, absorb knowledge like sponges, work together, and grow by learning that teamwork is the key to success
   - Rio embraces and guides travelers' perspectives, Rocky provides swift solutions, and Sierra lends strength — the LlaMA 3 super llama trio inspiring others to succeed together
   - A story that conveys the power of knowledge, wisdom, and collaboration, proving LlaMA 3's narrative is real

#### 3. Meta's LlaMA 3 Release and Features
   - On April 18, 2024, Meta released LlaMa 3 in 8B and 70B parameter sizes.
   - This model represents a major leap beyond LlaMA 2, aiming to be the best LLM model.
   - Key areas of focus in developing LlaMA 3 were model architecture, pre-training data, pre-training scaling, and instruction fine-tuning.
   - To aid this exploration, they collaborated with Edurado Ordax, Generative AI Lead at AWS, and Tom Yeh, CS Professor at University of Colorado Boulder, to find ways to maximize the model's potential at both enterprise and beginner levels.

#### 4. Tips for Leveraging the Power of LlaMA 3
   - According to recent practices, there are two main ways to use and work with LLMs: APIs and fine-tuning.
   - The 6 main steps for users to interact with LlaMA 3 include: using the model as-is for broad use cases, using the model for custom applications, or using prompt engineering to train the model to generate desired outputs.
   - The recommended approach for maximum benefit from this model is to advance to Step 5, which provides users with the most flexibility.
   - To fully leverage this model, it is important to customize it for domain requirements, as achieving optimal performance is difficult without system involvement.
   - By providing a high-level picture of the system for users, enterprise-level deployment can be achieved to realize the actual benefits of the model.

#### 5. The Secret to LlaMa 3's Success: Combining Transformer Architecture and Self-Attention
   - The secret behind LlaMa 3's fame lies in its *transformer architecture*, which is *highly optimized* to achieve excellent performance on industry benchmarks.
   - Additionally, since LlaMa 3 is open-sourced at Meta's discretion, one can access the Model Card to learn in detail how its powerful architecture is structured.
   - Discusses the most important questions about how transformer architecture and self-attention play their roles in LlaMa 3.
   - For more details on transformer architecture, see [here](https://medium.com/towards-data-science/deep-dive-into-transformers-by-hand-%EF%B8%8E-68b8be4bd813); for self-attention, see [here](https://medium.com/towards-data-science/deep-dive-into-self-attention-by-hand-︎-f02876e49857).

#### 6. Basic Configuration of the LlaMA 3 Model
   - The key **parameters** of the LlaMa 3 model's **8B variant** are as follows.
   - Key parameters include 'Layers', 'Attention heads', 'Vocabulary words', 'Feature dimensions', 'Hidden dimensions', and 'Context-window size'.
   - Let's examine the actual numbers to see how these values function in the model and understand the importance of each.
   - Context window, vocabulary size, attention layers, feature dimensions, hidden dimensions, and transformer internals form the core parts of the model.

#### 7. Attention Layers and the Number of Attention Layers
   - The Transformer class defines the **vocabulary size** and number of layers.
   - Here, **vocabulary size** refers to the set of *words (and tokens)* the model can recognize and process.
   - **Attention layers** refer to the transformer blocks (a combination of attention and feed-forward layers) used in the model.
   - LlaMA 3 has a very large vocabulary size of 128K, and the model contains 32 copies of the transformer block.

#### 8. Feature Dimensions and Attention Heads
   - Feature dimensions and attention heads feed into the *self-attention module*.
   - *Feature dimensions* refer to the token vector size in the embedding space, and **attention heads** consist of QK modules that control the transformer's self-attention mechanism.

#### 9. Hidden Dimensions and the Feed-Forward Class
   - Hidden dimensions belong to the **feed-forward class** and specify the number of hidden layers in the model.
   - In LlaMa 3, the hidden layers are 1.3 times the size of the feature dimensions.
   - A large number of hidden layers enables the network to internally generate and handle richer representations.

#### 10. Transformer Generation Process and Parameter Integration
   - The first matrix passes through the **attention layer** to produce attention-weighted features.
   - In the actual Llama 3 model, the matrix size grows from 5x3 to 8K x 4096, which is enormously large.
   - Next, the hidden layer expands to 5325 through the feed-forward network, and the final layer reduces it back to 4096.

#### 11. Multi-Layer Structure of Transformer Blocks
   - LlaMA 3 combines 32 transformer blocks, where each block's output is passed to the next block, proceeding until the final block is reached.
   - Each transformer block consists of multiple layers, with outputs passed sequentially to the next block.

#### 12. The Remarkable LlaMA 3 Model and Its Impact
   - The input matrix of 8K x 128K is embedded and then reduced to 4096 dimensions or fewer.
   - Features are processed across 32 layers in the transformer blocks, with the final matrix size equal to the feature dimensions.
   - LlaMA 3 was released in 8B and 70B models, suitable for various applications.
   - LlaMA 3 shows dominant performance on existing benchmarks, and Meta plans to announce even more powerful models.
   - The LlaMA model is inspired by the power and wisdom of Andean mountain legends.
