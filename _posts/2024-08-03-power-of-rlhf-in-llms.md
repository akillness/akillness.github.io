---
title: 🔍 Unlocking the Power of RLHF in Large Language Models 🌟
description: LLM, RLHF
categories: [LLM, RLHF]
tags: [RLHF, LLM]
# author: foDev_jeong
date: 2024-08-03 12:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

# 🌟 Reinforcement Learning with Human Feedback (RLHF)

> Link 👉 <https://www.linkedin.com/pulse/reinforcement-learning-human-feedback-rlhf-shubham-prajapati-xsjsc/?trackingId=eAJHZpWFS8S0xZa%2B4Yz9%2Bg%3D%3D>
{: .prompt-info}

All large language models (LLMs) go through a final stage called Alignment. This is where they learn to understand human preferences and generate texts that people tend to like or prefer. The popular method used to achieve this is RLHF (Reinforcement Learning from Human Feedback).

## 🤔 How Does It Work?

### 🏆 So it works with Reward Model
A reward model mimics human scoring. 
Trained on questions, answers, and human scores, it acts like a human stand-in, scoring the model's responses to help it improve.
RLHF ensures that the original LLM balances its learnings, maintaining task performance while aligning with human preferences. 
It’s about fine-tuning without forgetting!

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > 🛠️ Steps Involved in RLHF - details </summary>

1. Pre-training the Language Model 📚
Data Collection: Gather a large corpus of text data from diverse sources.
Training: Use this data to pre-train the language model using unsupervised learning techniques, typically with objectives like next-word prediction or masked language modeling.

2. Collecting Human Feedback 🧑🤝🧑
Sample Generation: Generate outputs (responses) from the pre-trained model based on a variety of prompts.
Human Evaluation: Have humans evaluate these outputs based on specific criteria, such as relevance, coherence, accuracy, or ethical considerations.
Feedback Annotation: Collect feedback in the form of ratings, rankings, or direct annotations indicating the quality of the generated responses.

3. Designing the Reward Model 🏅
Data Preparation: Use the collected human feedback to create a dataset of (prompt, response, feedback) tuples.
Reward Signal: Design a reward function that quantifies the quality of the responses based on the human feedback.
Training the Reward Model: Train a separate neural network (the reward model) to predict the human-provided feedback scores from the (prompt, response) pairs.

4. Reinforcement Learning Fine-Tuning 🎯
Policy Initialization: Use the pre-trained language model as the initial policy for the reinforcement learning process.
Policy Optimization: Employ reinforcement learning algorithms (like Proximal Policy Optimization, PPO) to fine-tune the language model: 
- Generate Responses: Produce responses using the current policy.
-  Evaluate Responses: Use the reward model to evaluate the quality of these responses and assign rewards.
-  Update Policy: Adjust the model’s parameters to maximize the expected reward, iteratively improving the model based on the feedback. 

5. Iterative Refinement 🔄
Continuous Feedback Loop: Regularly collect new human feedback on the updated model’s outputs.
Reward Model Update: Periodically retrain the reward model with the newly collected feedback.
Policy Re-training: Continue fine-tuning the language model using the updated reward model and additional feedback.

</details>

1. Pre-train the Language Model: Train on large text corpora.
2. Collect Human Feedback: Evaluate model outputs with human feedback.
3. Design the Reward Model: Create and train a model to predict feedback scores.
4. Reinforcement Learning Fine-Tuning: Optimize the language model using RL algorithms.
5. Iterative Refinement: Continuously collect feedback, update models, and fine-tune.

By following these steps, LLMs can be fine-tuned to better align with human expectations and produce more useful, accurate, and ethical outputs.

👉 Curious to learn more? Read my below article to dive deeper into RLHF and its impact on the future of AI!

📺 Prefer videos? Watch Aishwarya Naresh Reganti excellent explanation on this topic! 

{% include embed/youtube.html id='cAbuyFHNQX0' %}





