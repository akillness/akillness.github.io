---
title: "Deep Dive into Transformers by Hand"
description: "A summary of the explanation of the Transformer model is as follows:."
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-05-14 13:15:00 +0800
---
### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-transformers-by-hand-%EF%B8%8E-68b8be4bd813>

### **ChatGPT4o**

A summary of the explanation of the Transformer model is as follows:

Key Concepts of Transformers
The Transformer model consists of two key concepts: Attention Weighting and Feed-Forward Networks (FFN).

#### 1. Attention Weighting

The attention weight matrix (A) uses input features to find the most relevant parts. To do this, input features are fed into the Query-Key (QK) module. 

In this process, each feature of the input matrix (e.g., a 3×5 matrix) is multiplied with the weight matrix to generate new features (Z) that reflect the attention weights.

For example, through matrix operations, the following new features can be obtained:

- Z1 = X1 + X2
- Z2 = X2 + X3
- Z3 = X3 + X4
- Z4 = X4 + X5
- Z5 = X5 + X1


#### 2. Feed-Forward Network (FFN)

The attention-weighted features (Z) are fed into the feed-forward neural network. Here, values are combined along each feature's dimension to generate a new matrix. This process transforms data from existing dimensions to new dimensions, primarily converting negative values to 0 through the nonlinear activation function (ReLU).

How Transformers Work
- Attention Step: Combines input features along positions (horizontally) to generate new features.
- FFN Step: Combines values along dimensions (vertically) to create a new matrix.
The combination of these two steps allows the Transformer model to analyze data from various directions, which is the secret to the model's powerful performance.

Impact of Transformers
- Since their introduction in 2017, Transformers have caused significant changes in the AI field. They have demonstrated performance surpassing existing CNN and RNN models, and new models and benchmarks have continued to emerge since then. The ideas behind this model play an important role in AI advancement.


* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/660043>
> Below Summary Note

Deep Dive into Transformers by Hand ✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science

#### 1. Exploring the Details of Transformers
   - As a Tesla Cybertruck — reminiscent of Robo-Trucks and Transformers movies — appears in the neighborhood, it invites an exploration of artificial neural network transformers.
   - With the full-circle feeling of my son's preferred name 'Robo-Truck', one can imagine that Transformers — robots that turn into cars — could power these robo-trucks.
   - The author introduces 'Robtimus Prime', illustrated by the author, aiming to build a shared understanding of these new technologies and inspirations.
   - Artificial neural network technologies like transformers are thought to be capable of driving the future automotive industry.
   - We invite you on an exciting journey toward a deeper understanding of this topic.

#### 2. Features and Special Mechanisms of Transformers
   - Transformers are essentially neural networks.
   - They are neural networks specialized in learning context from data.
   - What makes them special is that they have mechanisms that do not require **labeled datasets** or **convolutions or recurrence**.
   - What are these special mechanisms?

#### 3. The Driving Force of Transformers: Attention and Feed-Forward Networks
   - The driving force of transformers lies in two mechanisms: *attention* and *feed-forward networks*.
   - Attention is a technique where the model learns which parts of the incoming sequence to focus on.
   - Think of it like the 'Eye of Sauron', always scanning everything and shining light on the relevant parts.
   - Fun fact: Researchers almost named the Transformer model 'Attention-Net', because attention is such a critical component of this model.

#### 4. What is FFN in Machine Learning?
   - In transformers, FFN is essentially a standard multi-layer perceptron that processes batches of independent data vectors.
   - Combined with attention, it generates the correct 'position-dimension' combination.

#### 5. Core Technologies of Transformers: Attention and FFN
   - Introducing how Attention weights and FFN create the power of transformers.
   - Explains the acquisition of Attention weights and Feed-Forward Networks (FFN), covering sequential computation and new feature combinations.
   - The Attention step combines existing features by position, while the FFN step combines dimensions by feature. Negative values are removed through ReLU, and the final output is passed to the next block.
   - Two key points that make transformers powerful: 1. Attention combines by position, 2. FFN combines by dimension, enabling data analysis from multiple directions.

