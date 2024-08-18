---
title: Federated Learning, One way to solve for AI having difficulty making
description: LLM, Federated Learning
categories: [LLM, Federated Learning]
tags: [AI, Federated Learning]
# author: foDev_jeong
date: 2024-08-05 12:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ How to train on private data ](/assets/img/llm/train-on-private-data-federated-learning.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

One of the main factors for AI having difficulty making its way into the healthcare and banking industry is the requirement for data privacy. 

For example, if you build a healthcare startup, you are going to have a hard time convincing hospitals to lend you their data to train your models. 

There is so much regulation on those data that the benefits are not worth the risk!

## One way to solve that is Federated Learning! 

The idea is that instead of bringing the data to the model, we bring the model to the data. 

That is the way Google trains its query suggestions on Android, for example. 

It is also an important component of how self-driving cars continuously train their ML applications. It can be summarized in the following steps:

- A model is pre-trained on a centralized server and sent to user devices along with the related software applications (Gboard in the case of the query suggestion model). 
- The users independently interact with the local models that continue to be fine-tuned locally.
- The models or the aggregated gradients are sent back to the centralized platform after a certain amount of time, where they get averaged into one model. 
- The remote model is then synchronized with the local models on devices.

Depending on the application, this allows to train on data from millions of users without ever storing the data. 

With more and more data regulations, we are likely to see a growing trend in the usage of that framework. 

Google and Meta, for example, have invested quite a bit in developing that technology. 

> - Here is the dedicated page just for federated learning from Google: 👉 <https://federated.withgoogle.com/>
> - TensorFlow was one of the first to provide a high-level framework for federated learning: 👉 <https://www.tensorflow.org/federated/federated_learning?hl=ko>. 
> - OpenFL is also another open-source project: 👉 <https://github.com/securefederatedai/openfl>
{: .prompt-info}
