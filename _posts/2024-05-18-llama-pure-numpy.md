---
title: Llama 3 implemented in pure NumPy
description: Llama, Numpy
categories: [LLM, LLama]
tags: [Llama, Numpy]
# author: foDev_jeong
date: 2024-05-18 15:20:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## 🦙 Llama 3 implemented in pure NumPy 👩‍🔬

🚀 Exciting discovery! Came across a fascinating article on Llama 3 model implemented in NumPy, inspired by @Andrej Karpathy. The Llama 3 model at AI at Meta is making waves with its impressive scale and performance. 🌟

🧑‍💻 Code : <https://github.com/likejazz/llama3.np>

🔍 With 24K GPUs, 15T training data, 10M instruction data, and 1.3M GPU hours, the numbers are truly overwhelming. Despite the transition to using GQA, the model structure remains unchanged from Llama 2, making it a familiar yet powerful framework.

🧠 To enhance understanding, Author are focusing on an accurate implementation using NumPy. Leveraging the stories15M model trained by Andrej Karpathy, we're converting it to a NumPy compressed format for a more intuitive model structure. Stay tuned as we transform the Karpathy-trained Llama 2 model into executable code, maintaining clarity and precision in our approach.

📊 While incorporating GQA into our code, Author won't apply it to model behavior, ensuring a seamless implementation of NumPy for enhanced interpretability. Stay tuned for more insights into this innovative approach! 


<object data="/assets/img/llm/Llama3_implemeted_in_pure_Numpy.pdf" width="100%" height="450" type='application/pdf'></object>


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

🦙 순수 NumPy👩 🔬로 구현된 라마 3

🚀 흥미 진진한 발견! @Andrej Karpathy에서 영감을 받아 NumPy에서 구현 된 Llama 3 모델에 대한 흥미로운 기사를 발견했습니다. AI at Meta 의 라마 3 모델은 인상적인 규모와 성능으로 파장을 일으키고 있습니다. 🌟

🧑 코드 : <https://github.com/likejazz/llama3.np>

🔍 24K GPU, 15T 훈련 데이터, 10M 명령 데이터 및 1.3M GPU 시간을 사용하면 그 수치는 정말 압도적입니다. GQA를 사용하기로 전환했음에도 불구하고 모델 구조는 Llama 2에서 변경되지 않아 친숙하면서도 강력한 프레임워크가 되었습니다.

🧠 이해를 돕기 위해 저자는 NumPy를 사용하여 정확하게 구현하는 데 중점을 두고 있습니다. Andrej Karpathy가 훈련한 stories15M 모델을 활용하여 보다 직관적인 모델 구조를 위해 NumPy 압축 형식으로 변환하고 있습니다. Karpathy가 훈련한 Llama 2 모델을 실행 가능한 코드로 변환하여 접근 방식의 명확성과 정밀도를 유지하는 동안 계속 지켜봐 주십시오.

📊 GQA를 코드에 통합하는 동안 작성자는 GQA를 모델 동작에 적용하지 않으므로 해석 가능성을 높이기 위해 NumPy를 원활하게 구현할 수 있습니다. 이 혁신적인 접근 방식에 대한 더 많은 통찰력을 계속 지켜봐 주십시오! 

</details>

