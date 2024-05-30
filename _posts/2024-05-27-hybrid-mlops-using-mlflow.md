---
title: MLflow를 활용한 Hybrid MLOps 구축 예제
description: MLOps, Hybrid, MLFlow
categories: [Blogging, MLOps]
tags: [MLOps, MLFlow]
# author: foDev_jeong
date: 2024-05-27 00:13:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---


## Introduce

On-Prem GPU와 SageMaker를 함께 사용하시는 것을 고민하는 고객들에게 도움이 될 만한 Hybrid MLOps System 예제 코드 공유 드립니다.

이 샘플 프로젝트의 아이디어는 On-Prem GPUs 에서 학습을 진행하고, SageMaker Endpoint에서 모델 추론 서버를 운영하는 것 입니다. MLflow를 AWS에 배포해서, On-Prem의 학습 진행 상황과 학습 결과물인 model artifacts에 대한 정보를 관리합니다.
학습 결과물인 model artifacts는 S3에 저장해서, 모델 서빙이 필요할 때, SageMaker Endpoint에 바로 배포할 수 있도록 관리합니다.

SageMaker Endpoint 사용하면, model artifacts (모델 파일, 추론용 스크립트 등)만 있으면, 모델 추론 서버를 위해서 ALB, AutoScaling 정책 등을 고민할 필요 없이, 몇번의 클릭만으로 손쉽게 추론 서버를 구축할 수 있습니다. SageMaker Endpoint를 사용함으로써 ML모델 개발자가 모델 추론용 웹 서버 구축에 대해서 고민할 필요가 없고, 반대로 백엔드 개발자가 ML 모델 추론 서버 구축을 위해서 ML에 대한 전문 지식을 갖출 필요가 거의 없습니다.

MLOps 오픈 소스로 k8s 기반의 Kubeflow가 있지만, k8s가 익숙하지 않는 경우에는 운영과 Learning Curve가 큰 편입니다. 하지만, MLflow의 경우에는 웹 서버를 운영하듯이 MLflow 서버 1대만 띄우면 바로 사용할 수 있기 때문에, 특히 개발 리소스가 적은 스타트업에서 직접 구매한 GPU와 Amazon SageMaker와 같은 AWS 서비스를 함께 사용하고 싶을 때, 적합할 것 같습니다.
자세한 예제 코드는 아래 Github 코드를 확인해 보세요.

> Github : <https://github.com/aws-samples/aws-kr-startup-samples/tree/main/machine-learning/mlflow>
{: .prompt-info }

![ Hybrid MLOps using MLFlow ](/assets/img/blog/Hybrid_MLOps.jpeg){: .light  .shadow .rounded-10 w='1212' h='668' }
