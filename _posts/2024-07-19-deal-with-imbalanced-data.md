---
title: How do you deal with imbalanced data?
description: Imbalanced Data, Datascience
categories: [Study, Datascience]
tags: [mbalanced Data, Datascience]
# author: foDev_jeong
date: 2024-07-19 13:30:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ 4 Strategies Multi-GPU  ](/assets/img/blog/optimally-sample-imbalanced-data.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

> Paper 👉 <https://arxiv.org/pdf/2110.13048>
{: .prompt-info}

If you don't have too much data and the imbalance is not too extreme, the typical way to deal with it is to simply reweigh the samples such that the loss function considers the positive and negative samples equally. 

When you have an overwhelming amount of negative samples, you may want to downsample them to minimize training latency.

But not all samples are equal! At TikTok, for example, for their recommendation engine, they use a ​​non-uniform negative sampling scheme they developed with the University of Connecticut.

They proved that optimal sampling of the negative class is done when giving more weight to samples with a higher probability of being positive (Theorem 3). This means that it is better to keep samples that are confusing for a model. 
 
This way, the model focuses on learning how to separate true positive samples from negative samples that look like positive ones.

Interestingly enough, this theorem also means sampling bias is a good thing! In ML applications, a model shows users some samples they are likely to engage with. When they don't engage with those, they become negative samples for the next training batch. 

That is sampling bias because only the samples with a high probability of engagement ever get shown to users, and they never get the opportunity to interact with the "lesser" samples, so we never get signals for those. 
 
By sampling the data, we bias the probability estimates coming out of the model, and they become meaningless. The model is not calibrated anymore. To fix that, they came up with a correction of the likelihood function to generate unbiased estimates of the model parameters and, therefore, the probabilities (see eq 5).

### Practically, you follow this process to sample down negative samples:

1. Uniformly sample the negative class so that the data becomes balanced.
2. train a model with balanced data. They call it a "pilot" model.
3. predict the full data with that pilot model. You get an estimate of how much the model believes the sample is a positive one.
4. normalize that probability p by the average probability w and multiply by the sampling rate r: r * p / w
5. for each negative sample, pick a uniform random number u. If u < r * p / w, keep the sample; remove it otherwise. The greater p is, the more likely we will keep it
6. r * p / w is the sampling probability. When training the model or predicting, correct the log odds using that probability. 

Pretty simple process to follow! This is a simplified version of the more optimal approach, but they consider this approach satisfactory.

