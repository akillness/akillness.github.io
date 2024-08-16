---
title: 𝗔𝗴𝗲𝗻𝘁𝗶𝗰 𝗗𝗮𝘁𝗮 𝗮𝗻𝗮𝗹𝘆𝘀𝘁, 𝗱𝗿𝗼𝗽 𝘆𝗼𝘂𝗿 𝗱𝗮𝘁𝗮 𝗳𝗶𝗹𝗲, 𝗹𝗲𝘁 𝘁𝗵𝗲 𝗟𝗟𝗠 𝗱𝗼 𝘁𝗵𝗲 𝗮𝗻𝗮𝗹𝘆𝘀𝗶𝘀 📊⚙️
description: LLM, Analyst Agents
categories: [LLM, Analyst Agents]
tags: [Cookbook, Analyst Agents]
# author: foDev_jeong
date: 2024-07-29 11:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## Data analyst agent: get your data’s insights in the blink of an eye ✨

In this notebook we will make a data analyst agent: a Code agent armed with data analysis libraries, that can load and transform dataframes to extract insights from your data, and even plots the results!

Let’s say I want to analyze the data from the Kaggle Titanic challenge in order to predict the survival of individual passengers. But before digging into this myself, I want an autonomous agent to prepare the analysis for me by extracting trends and plotting some figures to find insights.


> Try it for yourself in this Space demo 👉 <https://huggingface.co/spaces/m-ric/agent-data-analyst>
> Read the cookbook to dive deeper 👉 <https://huggingface.co/learn/cookbook/agent_data_analyst>
{: .prompt-info}


## Need to make quick exploratory data analysis? ➡️ Get help from an agent.

I was impressed by Llama-3.1's capacity to derive insights from data. Given a csv file, it makes quick work of exploratory data analysis and can derive interesting insights.

On the data from the Kaggle titanic challenge, that records which passengers survived the Titanic wreckage, it was able by itself to derive interesting trends like "passengers that paid higher fares were more likely to survive" or "survival rate was much higher for women than men".

The cookbook even lets the agent built its own submission to the challenge, and it ranks under 3,000 out of 17,000 submissions: 👏 not bad at all!
