---
title: Reinforcing Reinforcement Learning Terms, Policies, Models and Top 40 Libraries 📚
description: ReinforecementLearning, Library
categories: [Study, ReinforcementLearning]
tags: [Course, ReinforementLearning]
# author: foDev_jeong
date: 2024-07-05 20:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

RL is a type of machine learning that lets an agent interact with an environment, receive feedback, and make better decisions over time.

—————————

## 📝 Terms Used in RL:

- ⌘ Environment: the system or situation that the agent interacts with. 

- ⌘ Agent: refers to an autonomous entity that interacts with an environment.

- ⌘ Feedback: refers to the information provided by the environment to the agent after the agent has taken an action (rewards or penalties).

- ⌘ State (S): Current situation returned by the environment.

- ⌘ Policy(π): The strategy that the agent employs to determine next action.

- ⌘ Value (V): The expected long-term return 

- ⌘ Q-Value (Q): the long-term return of given current action 

- ⌘ Model: stands for the simulation of environment. 

—————————

## 📖 Model/Policy of RL:

Model-Free vs Model-Based:

- ๏ Model-based works with state space and action space grows
- ๏ Model-free algorithms rely on trial-and-error to update its knowledge.

On-Policy vs Off-Policy:

- ๏ On-policy agent learns based on its current action a derived from the current policy, 
- ๏ Off-policy counter part learns it based on another policy.

—————————

## 🤖 Well-known RL Models:

- ➊ Q-Learning:

Model-free algorithm that uses a Q-table to store best action for a state.

- ➋ State-Action-Reward-State-Action (SARSA):

Model-based algorithm that updates state-action value based on reward and next state-action.

- ➌ Deep Q Network (DQN):

Model-free algorithm that uses deep neural networks to approximate the Q-function.

- ➍ Deep Deterministic Policy Gradient (DDPG):

By using deep neural networks, DDPG handles more complex environments and large state spaces than traditional RL algorithms. 

—————————

## 🛠️ Here are some applications of reinforcement learning (RL):

- » Robotics
- » Autonomous Vehicles
- » Healthcare
- » Finance
- » Gaming
- » Energy Management
- » Marketing and Advertising
- » Natural Language Processing
- » Manufacturing
- » Smart Grids
- » Supply Chain Optimization
- » Recommendation Systems
- » Personalization Systems
- » Traffic Signal Control
- » Education and Training
- » Agriculture
- » Industrial Automation
- » Space Exploration
- » Cybersecurity
- » Virtual Assistants

—————————

These are 40 Python Libraries I found for Reinforcement Learning:

- 📚 Gym
- 📚 Baselines
- 📚 Dopamine
- 📚 TensorLayer
- 📚 FinRL
- 📚 Stable-Baselines
- 📚 ReAgent
- 📚 Acme
- 📚 PARL
- 📚 TF-Agents
- 📚 TensorFlow
- 📚 PyTorchRL
- 📚 Keras-RL
- 📚 Garage
- 📚 TensorForce
- 📚 RLax
- 📚 Coach
- 📚 RFRL
- 📚 Rliable
- 📚 ViZDoom
- 📚 Ray RLlib
- 📚 Dopamine
- 📚 Acme
- 📚 Tensorforce
- 📚 ReAgent (Horizon)
- 📚 ChainerRL
- 📚 MushroomRL
- 📚 TRFL
- 📚 CleanRL
- 📚 Tianshou
- 📚 MAgent
- 📚 rl-baselines3-zoo
- 📚 PettingZoo
- 📚 RLlib
- 📚 RoboRL
- 📚 H-baselines
- 📚 DI-engine

Source in the comments ↓

———————————————

⭆ 𝐑𝐞𝐠𝐢𝐬𝐭𝐞𝐫 𝐟𝐨𝐫 𝐅𝐫𝐞𝐞 𝐎𝐧𝐥𝐢𝐧𝐞 𝐇𝐚𝐧𝐝𝐬-𝐨𝐧 𝐃𝐚𝐭𝐚 𝐒𝐜𝐢𝐞𝐧𝐜𝐞 𝐓𝐮𝐭𝐨𝐫𝐢𝐚𝐥 (𝐄𝐧𝐝 𝐭𝐨 𝐄𝐧𝐝 𝐏𝐫𝐨𝐣𝐞𝐜𝐭): <https://www.maryammiradi.com/sonar>

![ Reinforcement Learning Python Libraries ](/assets/img/blog/ReinforcementLearning_Library.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

RL은 에이전트가 환경과 상호 작용하고, 피드백을 받고, 시간이 지남에 따라 더 나은 결정을 내릴 수 있도록 하는 기계 학습의 한 유형입니다.

—————————

## 📝 RL에서 사용되는 용어:

- ⌘ 환경: 에이전트가 상호 작용하는 시스템 또는 상황입니다. 

- ⌘ 에이전트(Agent): 환경과 상호 작용하는 자율적인 개체를 의미합니다.

- ⌘ 피드백: 에이전트가 조치(보상 또는 페널티)를 취한 후 환경에서 에이전트에게 제공하는 정보를 나타냅니다.

- ⌘ 상태(S): 환경에서 반환되는 현재 상황입니다.

- ⌘ 정책(π): 에이전트가 다음 행동을 결정하기 위해 사용하는 전략입니다.

- ⌘ 가치 (V) : 예상되는 장기 수익 

- ⌘ Q-Value (Q): 주어진 현재 행동의 장기 수익 

- ⌘ 모델: 환경 시뮬레이션을 의미합니다. 

—————————

## 📖 RL의 모델/정책:

모델 프리(Model-Free) vs 모델 기반(Model-Based):

- ๏ 상태 공간과 액션 공간이 커지는 모델 기반 작품
- ๏ Model-free 알고리즘은 지식을 업데이트하기 위해 시행착오에 의존합니다.

온-폴리시(On-Policy) vs 오프-폴리시(Off-Policy):

- ๏ On-policy 에이전트는 현재 정책에서 파생된 현재 작업을 기반으로 학습합니다. 
- ๏ Off-policy 카운터 파트는 다른 정책을 기반으로 학습합니다.

—————————

## 🤖 잘 알려진 RL 모델:

- ➊ Q-러닝:

Q-테이블을 사용하여 상태에 대한 최상의 작업을 저장하는 모델 없는 알고리즘입니다.

- ➋ 국가-행동-보상-국가-행동(SARSA):

보상 및 다음 상태-행동을 기반으로 상태-행동 값을 업데이트하는 모델 기반 알고리즘입니다.

- ➌ 딥 Q 네트워크(DQN):

심층 신경망을 사용하여 Q-function을 근사화하는 모델 없는 알고리즘입니다.

- ➍ 심층 결정론적 정책 그래디언트(DDPG):

DDPG는 심층 신경망을 사용하여 기존 RL 알고리즘보다 더 복잡한 환경과 대규모 상태 공간을 처리합니다. 

—————————

## 🛠️ 다음은 강화 학습(RL)의 몇 가지 응용 분야입니다.

- » 로보틱스
- » 자율 주행 차량
- » 헬스케어
- » 금융
- » 노름
- » 에너지 관리
- » 마케팅 및 광고
- » 자연어 처리
- » 제조업
- » 스마트 그리드
- » 공급망 최적화
- » 추천 시스템
- » 개인화 시스템
- » 교통 신호 제어
- » 교육 및 훈련
- » 농업
- » 산업 자동화
- » 우주 탐사
- » 사이버 보안
- » 가상 비서

</details>