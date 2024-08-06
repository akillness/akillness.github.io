---
title: 𝐀𝐠𝐞𝐧𝐭𝐢𝐜 𝐑𝐀𝐆 ✨ new cookbook
description: Agentic, RAG, Cookbook
categories: [LLM, Cookbook]
tags: [Agentic, RAG]
# author: foDev_jeong
date: 2024-07-13 14:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## I just published a new cookbook showing how to easily improve Retrieval Augmented Generation (RAG) with an agent system using Transformers Agents.

Vanilla RAG has the following limitations:
- ➤ 𝗜𝘁 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲𝘀 𝘀𝗼𝘂𝗿𝗰𝗲 𝗱𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗼𝗻𝗹𝘆 𝗼𝗻𝗰𝗲: if the retrieved docuents are not relevant enough the generation in turn will be bad.
- ➤ Semantic similarity is computed 𝙬𝙞𝙩𝙝 𝙩𝙝𝙚 𝙪𝙨𝙚𝙧 𝙦𝙪𝙚𝙧𝙮 𝙖𝙨 𝙖 𝙧𝙚𝙛𝙚𝙧𝙚𝙣𝙘𝙚, which is often suboptimal: for instance, the user query will mostly be a question and the document containing the true answer will be in affirmative voice, so its similarity score will be downgraded compared to less relevant source documents in the interrogative form, leading to a risk of not selecting the relevant document.

𝙈𝙖𝙠𝙞𝙣𝙜 𝙖 𝙍𝘼𝙂 𝙖𝙜𝙚𝙣𝙩 - 𝙫𝙚𝙧𝙮 𝙨𝙞𝙢𝙥𝙡𝙮, 𝙖𝙣 𝙖𝙜𝙚𝙣𝙩 𝙖𝙧𝙢𝙚𝙙 𝙬𝙞𝙩𝙝 𝙖 𝙧𝙚𝙩𝙧𝙞𝙚𝙫𝙚𝙧 𝙩𝙤𝙤𝙡 - 𝙖𝙡𝙡𝙚𝙫𝙞𝙖𝙩𝙚𝙨 𝙗𝙤𝙩𝙝 𝙩𝙝𝙚𝙨𝙚 𝙥𝙧𝙤𝙗𝙡𝙚𝙢𝙨!
- ✅ Formulate the query itself (query reformulation)
- ✅ Critique the content to re-retrieve if needed (self-query)

𝗛𝗼𝘄 𝗺𝘂𝗰𝗵 𝗱𝗼𝗲𝘀 𝘁𝗵𝗶𝘀 𝗮𝗴𝗲𝗻𝘁𝗶𝗰 𝘀𝗲𝘁𝘂𝗽 𝗶𝗺𝗽𝗿𝗼𝘃𝗲 𝗿𝗲𝘀𝘂𝗹𝘁𝘀? I've added to the cookbook an evaluation part with LLM-as-a-judge using Llama-3-70B. When switching from vanilla to agentic RAG, the 𝘀𝗰𝗼𝗿𝗲 𝗶𝗻𝗰𝗿𝗲𝗮𝘀𝗲𝘀 𝗯𝘆 𝟴.𝟱%! 💪
(from 70.0% to 78.5%)

One important drawback though: since the system is now doing several LLM calls instead of 1, the runtime of the RAG system also increases. You have to find the right trade-off!

𝗗𝗶𝘀𝗰𝗼𝘃𝗲𝗿 𝘁𝗵𝗲 𝗰𝗼𝗼𝗸𝗯𝗼𝗼𝗸 👇
- <https://huggingface.co/learn/cookbook/agent_rag>


## 𝗔𝗴𝗲𝗻𝘁𝗶𝗰 𝗗𝗮𝘁𝗮 𝗮𝗻𝗮𝗹𝘆𝘀𝘁: 𝗱𝗿𝗼𝗽 𝘆𝗼𝘂𝗿 𝗱𝗮𝘁𝗮 𝗳𝗶𝗹𝗲, 𝗹𝗲𝘁 𝘁𝗵𝗲 𝗟𝗟𝗠 𝗱𝗼 𝘁𝗵𝗲 𝗮𝗻𝗮𝗹𝘆𝘀𝗶𝘀 📊⚙️

Need to make quick exploratory data analysis? ➡️ Get help from an agent.

I was impressed by Llama-3.1's capacity to derive insights from data. Given a csv file, it makes quick work of exploratory data analysis and can derive interesting insights.

On the data from the Kaggle titanic challenge, that records which passengers survived the Titanic wreckage, it was able by itself to derive interesting trends like "passengers that paid higher fares were more likely to survive" or "survival rate was much higher for women than men".

The cookbook even lets the agent built its own submission to the challenge, and it ranks under 3,000 out of 17,000 submissions: 👏 not bad at all!

> - Try it for yourself in this Space demo 👉 https://lnkd.in/gzaqQ3rT
> - Read the cookbook to dive deeper 👉 https://lnkd.in/gXx3-AyH
{: .prompt-info}




<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 방금 Transformers Agents를 사용하여 에이전트 시스템으로 RAG(Retrieval Augmented Generation)를 쉽게 개선하는 방법을 보여주는 새로운 쿡북을 출판했습니다.

Vanilla RAG에는 다음과 같은 제한 사항이 있습니다.
- ➤ 소스 문서를 한 번만 검색합니다: 검색된 문서가 충분히 관련성이 없으면 생성이 나빠질 것입니다.
- ➤ 의미론적 유사성은 사용자 쿼리를 참조로 사용하여 계산되며, 이는 종종 차선책입니다: 예를 들어, 사용자 쿼리는 대부분 질문이고 실제 답변을 포함하는 문서는 긍정 음성이므로 유사성 점수는 의문 형식의 관련성이 낮은 소스 문서에 비해 다운그레이드되어 관련 문서를 선택하지 않을 위험이 있습니다.

RAG 에이전트를 만들면(아주 간단하게, 리트리버 도구로 무장한 에이전트) 이 두 가지 문제를 모두 완화할 수 있습니다!
- ✅ 쿼리 자체를 공식화합니다(쿼리 재구성).
- ✅ 필요한 경우 다시 검색할 콘텐츠 비판(자체 쿼리)Critique the content to re-retrieve if needed (self-query)

이 에이전트 설정이 결과를 얼마나 개선합니까? 요리책에 Llama-3-70B를 사용하는 LLM-as-a-judge의 평가 부분을 추가했습니다. 바닐라에서 에이전트 RAG로 전환하면 점수가 8.5% 증가합니다! 💪
(70.0%에서 78.5%로)

하지만 한 가지 중요한 단점은, 시스템이 1이 아닌 여러 LLM 호출을 하기 때문에 RAG 시스템의 런타임도 증가한다는 것입니다. 적절한 절충안을 찾아야 합니다!

</details>