---
title: Power of Graph Analytics
description: Graph, Analytics
categories: [Blogging, Graph]
tags: [Graph, Analytics]
# author: foDev_jeong
date: 2024-05-19 22:10:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## Power of Graph Analytics: Algorithms, Types, Techniques and 25 Top Python Libraries 📚

Graph Analytics extracts valuable insights from complex, interconnected data with ability to represent relationships between entities.

————————————

#### Graph Composition:

- Nodes: represent entities
- Edges: link between entities

————————————

#### Goals of Graph Analytics:

* Identify key entities and their relationships
* Discover patterns and anomalies in large-scale datasets
* Generate recommendations and predictions based on past behavior
* Uncover community structures within networks
* Predict missing links and uncover hidden connections

————————————

#### Type of Graph Analytics :

1. Graph Neural Networks ( GNN ):

A class of deep learning models that operate directly on graph structures.

Examples of GNNs include:
- Ⓞ Graph Convolutional Networks (GCN)
- Ⓞ Graph Attention Networks (GAT)
- Ⓞ GraphSAGE

—-
2. Feature Extraction with Centrality Measures:

Centrality measures aim to identify the most important nodes in a graph. 

Some examples include:
- Ⓞ Degree
- Ⓞ Betweenness
- Ⓞ Eigenvector
- Ⓞ PageRank
- Ⓞ Katz

——
3. Clustering:

Aim to group nodes into clusters based on their structural similarity. 

Some examples include:
- Ⓞ Girvan-Newman 
- Ⓞ Markov Cluster (MCL)
- Ⓞ Hierarchical agglomerative clustering (HAC)

——
4. Link Prediction:

Aim to predict missing links in a graph. 

Some examples include:
- Ⓞ Louvain
- Ⓞ Infomap
- Ⓞ Walktrap

——
5. Community Detection: 

Aim to identify groups of nodes that are densely connected within themselves but sparsely connected with the rest of the network. 

Some examples include:
- Ⓞ Girvan-Newman
- Ⓞ Clauset-Newman-Moore
- Ⓞ Label Propagation
- Ⓞ Walktrap
- Ⓞ Fastgreedy

————————————

#### Graph Analytics Techniques:

- ➊ Graph Traversal: Visit every node in a graph, typically in a systematic order.

- ➋ Shortest Path: Aim to find the shortest path between two nodes in a graph.

- ➌ Connected Components: Identify groups of nodes that are all connected to each other.

- ➍ Minimum Spanning Tree: Find the minimum set of edges needed to connect all nodes in a graph.

- ➎ Maximum Flow: Find the maximum amount of flow that can pass through a graph, given constraints on the edges.

————————————

#### I found the foll 25 Python Libraries:

- 📚 NetworkX
- 📚 igraph
- 📚 karateclub
- 📚 graph-tool
- 📚 SNAP.py
- 📚 Deep Graph Library (DGL)
- 📚 PyTorch Geometric
- 📚 Spektral
- 📚 stellargraph
- 📚 scikit-network
- 📚 CDlib
- 📚 leidenalg
- 📚 markov-clustering
- 📚 pyclustering
- 📚 Graphein
- 📚 nxviz
- 📚 Grakn
- 📚 Tulip
- 📚 PowerGraph
- 📚 Gephi
- 📚 PyG
- 📚 Python-I graph
- 📚 NetworKit
- 📚 Grakel 
- 📚 PyGraphistry 


![ Graph Analytics ](/assets/img/blog/Graph_Analytics.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

* * *


## 그래프 분석의 힘: 알고리즘, 유형, 기법 및 25개의 상위 Python 라이브러리 📚

Graph Analytics는 엔터티 간의 관계를 나타내는 기능을 통해 복잡하고 상호 연결된 데이터에서 귀중한 인사이트를 추출합니다.

————————————

#### 그래프 구성:

- 노드: 엔터티를 나타냅니다.
- Edge: 개체 간 링크

————————————

#### 그래프 분석의 목표:

* 주요 엔터티 및 해당 관계 식별
* 대규모 데이터 세트에서 패턴과 변칙 발견
* 과거 행동을 기반으로 권장 사항 및 예측 생성
* 네트워크 내 커뮤니티 구조 파악
* 누락 된 링크를 예측하고 숨겨진 연결을 발견하십시오.

————————————

#### 그래프 분석 유형 :

1. 그래프 신경망 (GNN) :

그래프 구조에서 직접 작동하는 딥러닝 모델의 한 클래스입니다.

GNN의 예는 다음과 같습니다.
- (O) 그래프 합성곱 네트워크(GCN)
- (O) 그래프 어텐션 네트워크(GAT)
- (O) 그래프세이지

—-

2. 중심성 측정을 통한 특징 추출:

중심성 측정은 그래프에서 가장 중요한 노드를 식별하는 것을 목표로 합니다. 

몇 가지 예는 다음과 같습니다.
- (O) 정도
- (O) 중간성
- (O) 고유벡터
- (O) 페이지랭크
- (O) 카츠

——
3. 클러스터링:

노드를 구조적 유사성에 따라 클러스터로 그룹화하는 것을 목표로 합니다. 

몇 가지 예는 다음과 같습니다.
- (O) 거번-뉴먼 
- (O) 마르코프 성단(MCL)
- (O) 계층적 응집 클러스터링(HAC)

——
4. 링크 예측:

그래프에서 누락된 링크를 예측하는 것을 목표로 합니다. 

몇 가지 예는 다음과 같습니다.
- (O) 루뱅
- (O) 인포맵
- (O) 보행용

——
5. 커뮤니티 감지: 

자체 내부에는 조밀하게 연결되어 있지만 네트워크의 나머지 부분과는 드물게 연결된 노드 그룹을 식별하는 것을 목표로 합니다. 

몇 가지 예는 다음과 같습니다.
- (O) 거번-뉴먼
- (O) 클라우제트-뉴먼-무어
- (O) 라벨 전파
- (O) 보행용
- (O) 빠른 욕심

————————————

#### 그래프 분석 기법:

- ➊ 그래프 순회: 일반적으로 체계적인 순서로 그래프의 모든 노드를 방문합니다.

- ➋ 최단 경로: 그래프에서 두 노드 사이의 최단 경로를 찾는 것을 목표로 합니다.

- ➌ 연결된 구성 요소: 모두 서로 연결된 노드 그룹을 식별합니다.

- ➍ 최소 스패닝 트리: 그래프의 모든 노드를 연결하는 데 필요한 최소 에지 세트를 찾습니다.

- ➎ 최대 흐름: 가장자리에 대한 제약 조건이 주어지면 그래프를 통과할 수 있는 최대 흐름량을 찾습니다.

————————————

#### 나는 foll 25 파이썬 라이브러리를 발견했다 :

- 📚 네트워크X
- 📚 아이그래프
- 📚 가라테 클럽
- 📚 그래프 도구
- 📚 SNAP.py
- 📚 딥 그래프 라이브러리(DGL)
- 📚 PyTorch 기하학
- 📚 스펙트랄
- 📚 스텔라그래프
- 📚 scikit-네트워크
- 📚 CDlib (영문)
- 📚 라이데날그(Leidenalg)
- 📚 markov 클러스터링
- 📚 파이클러스터링
- 📚 그래핀
- 📚 NXVIZ (영문)
- 📚 그라크
- 📚 튤립
- 📚 파워그래프(PowerGraph)
- 📚 게피
- 📚 파이지
- 📚 Python-I 그래프
- 📚 넷웍킷
- 📚 그라켈 
- 📚 PyGraphistry(파이그래피스트리) 