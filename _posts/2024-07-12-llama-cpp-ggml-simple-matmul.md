---
title: llama.cpp의 내부 구현을 분석하다가 ggml을 이용한 간단한 matmul 샘플을 구현 사례 고찰
description: Llama, CPP
categories: [LLM, Llama]
tags: [Llama,CPP]
# author: foDev_jeong
date: 2024-07-12 11:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

> 👉 Github : <https://github.com/likejazz/ggml-simple>
{: .prompt-info}

## Open Source RouteLLM Shows the Real Battle is in Query Routing. 

llama.cpp도 Georgi Gerganov가 주말에 llama 모델을 ggml로 구현하는 hackday를 진행하면서 시작 됐죠. 그리고 잘 알다시피 지금은 LLM계의 리눅스라 불러도 손색이 없을 만큼 엄청난 프로젝트로 성장했고요.

llama.cpp(정확히는 ggml)는 tensorflow와 유사하게 계산 그래프를 먼저 만들고 실행하는 방식입니다. 첨부 이미지처럼 그래프를 `ggml_graph_compute()` 함수로 호출하면 계산이 실행되죠. 

![ LLAMA cpp ](/assets/img/llm/LLAMA-CPP.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

참고로 첨부 이미지는 예전 버전 기준으로 작성된 것이고 지금은 CUDA로 실행할 때는 `ggml_backend_graph_compute()`로 실행해야 합니다. 

이처럼 그래프를 별도로 계산하는 과정이 반드시 필요한데 모델링을 할 때는 이 방식이 무척 번거롭습니다. 

그래서 tensorflow도 pytorch에게 자리를 내주고 말았죠. 하지만 애초에 llama.cpp는 inference 전용이기 때문에 이 방식이 별 문제가 되진 않습니다. 
오히려 최적화하기 쉽고, 다양한 백엔드를 지원할 수 있어 llama.cpp는 CPU 외에도 CUDA 지원, 맥에서는 METAL 지원, AMD의 ROCm도 지원합니다. 또한 코어는 간결하게 C로 구현되어 있고, 그래서 제가 만든 샘플도 C++ 코드지만 C 문법만 사용했습니다. 
애초에 tensor 변수도 ggml_tensor라는 struct로 구현되어 있죠.

반면 pytorch는 같은 역할을 하는 torch::Tensor부터가 벌써부터 namespace입니다. 모든 문법은 C++ 전용으로 되어 있고요. llama.cpp는 CPU에서 GPU로 메모리를 복사하는 과정을 직접 코딩해야 하는데, torch는 그런 과정도 모두 생략되어 있어 C++에서도 마치 파이썬처럼 별 어려움 없이 사용 가능합니다. 

여기서 두 프레임워크의 철학이 엿보인다고 할 수 있습니다. 쉽게 사용가능하면서 딥러닝의 모든 것을 지원하는 종합 선물 세트 pytorch와 의존성 없이 이식성이 좋으면서 가볍고 간결하고 모든 부분을 컨트롤 할 수 있는 llama.cpp.

앞으로 LLM이 on-device에 구동될 일이 많아질 것이고 그렇다면 llama.cpp 같은 가볍고 간결한 프레임워크의 수요도 점점 늘어날 거라 생각됩니다. ggml로 직접 모델을 inference하고 최적화하는 일도 앞으로는 많이 생길 거 같고요. 물론 오픈소스 진영에서 대신 구현해 줄 거기 때문에 대부분은 그저 가져다 쓰기만 하겠지만요.


