---
title: "Deep Dive into Self-Attention by Hand"
description: "Self-Attention is a method where each word in the input sequence evaluates its relationships with all other words to assign weights."
categories: [Review/Trends]
tags: [Trend, Review, Case]
date: 2024-05-14 13:14:00 +0800
---
### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-self-attention-by-hand-%EF%B8%8E-f02876e49857>

* * *

### **ChatGPT4o**

#### Self-Attention Mechanism Summary
Self-Attention is a method where each word in the input sequence evaluates its relationships with all other words to assign weights. This enables better understanding of context and captures long-range dependencies.

#### Key Steps
Query (Q), Key (K), Value (V) Generation: The input matrix is linearly transformed to create Q, K, and V matrices.

- Attention Score Calculation: The similarity of each word is computed through matrix multiplication of Q and K, then normalized with the softmax function.
- Attention Output Calculation: The normalized scores are multiplied by V to obtain the final output values.

#### Advantages
- Enables parallel processing
- Effective for learning long-range dependencies


* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/660003>
> Below Summary Note

Deep Dive into Self-Attention by Hand✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science

#### 1. A Deep Exploration of the Attention Mechanism that Powers Transformers
   - A detailed look at the attention mechanism that drives transformers.
   - Introduction: Let's explore the complexity of the 'attention' concept.
   - It's not something like 'Robitmus Prime' — the power of transformers that make up neural networks comes from the concept of '**attention**'.
   - So, what exactly does attention mean in the context of transformers? We seek to find some answers here.

#### 2. Transformers and Detailed Mechanism Inference
   - **Transformers** are neural networks that learn context from data, similar to how we seek the meaning of 'attention and context'.
   - **How do transformers learn context from data?**: By using the *attention mechanism*.
   - The **attention mechanism** helps the model examine all parts of the sequence at each step and determine which elements to focus on.
   - **Self-attention** contributed to improving RNN performance, and the transformer architecture introduced in 2017 eliminated the need for RNNs and CNNs.
   - The transformer architecture includes a **scaled dot-product** mechanism, and self-attention can be seen as a combination of an outer shell and an inner shell.

#### 3. Understanding the Self-Attention Mechanism and Attention Weighting
   - The attention weight matrix **A** is obtained by feeding input features into the Query-Key (QK) module.
   - Self-attention is performed *when creating the attention weight matrix A using the QK module*.
   - By examining various components such as Query (Q), Key (K), and Value (V), we understand the principles of Self-Attention **using illustrative examples**.
   - Understand the actual computations of **matrix multiplication** and **scaling**, as well as *cosine similarity* between vectors and the *relationship with dimensions*.

#### 4. The **Attention Weight Matrix** Obtained After Passing Through the QK Module in the Transformer Section.
   - Explaining the 'scaling' part of 'scaled' dot-product attention.
   - Three parts of the softmax step: 1. Raise e to the power of each cell's number, 2. Sum these new values along each column, 3. For each column, divide by that sum.
   - Each column is normalized so that the numbers sum to 1. As a result, each column becomes a **probability distribution of attention**, yielding the **attention weight matrix (A)**.
   - The **attention weight matrix** is obtained from Step 2 in the transformer section (after passing through the QK module).
   - The softmax step assigns probabilities to the scores obtained from the previous step, helping the model determine how important each word is for the current query.

#### 5. Importance of the Softmax Step and Determining Each Word's Significance
   - The softmax step is crucial in assigning probabilities to scores from the previous step, determining how much *importance* the model should give to each word for the current query.
   - Higher attention weights indicate greater *relevance*, helping the model capture dependencies more accurately.
   - Scaling from the previous step becomes important here, as without scaling, values in the resulting matrix can be pushed into regions where the softmax function does not process them well, leading to vanishing gradients.
   - Finally, through **matrix multiplication**, the value vectors (**V**s) are multiplied with the *attention weight matrix (**A**)*. These value vectors are important because they contain information associated with each word.

#### 6. The Final Solution of the Self-Attention Mechanism: Attention-Weighted Features Zs
   - The final multiplication result of this step is the **attention-weighted features Z**, which is the ultimate solution of the self-attention mechanism.
   - These attention-weighted features essentially contain **weighted representations of features**, assigning higher weights to features of greater importance based on the surrounding context.

#### 7. Feed-Forward Layers in the Transformer Architecture and the Conclusion of Self-Attention
   - Based on this information, we move to the next stage of the *`transformer architecture`*, where the *`feed-forward layers`* further process this information.
   - This concludes the remarkable technique of *`self-attention`*!
