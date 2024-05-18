---
title: Top Papers in Computer Vision, NLP, Speech, Multimodal AI, Core ML, RecSys, and Graph ML 
description: Vision Models, ELO, Compare
categories: [Script, Papers]
tags: [Papers]
# author: foDev_jeong
date: 2024-05-18 18:20:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## 📝 Top Papers in Computer Vision, NLP, Speech, Multimodal AI, Core ML, RecSys, and Graph ML • 

> Distilled AI : <http://papers.aman.ai>
> aman AI : <https://aman.ai/>

👉🏼 I’ve put together a summary of key papers in 해시태그#AI and segregated them into (i) need-to-know and (ii) good-to-know.

🔹 Vision
- Image Classification (CNN architectures such as AlexNet, VGGNet, InceptionNet, ResNet to Transformer architectures such as ViT, DeiT, BEiT, MAE)
- Object Detection (YOLO v1-v8, Fast/er R-CNN, Mask R-CNN, CenterNet, Pix2Seq, DETR, Detic, Focal Loss)
- Semantic/Instance Segmentation (U-Net, Mask R-CNN, Segment Anything)
- NeRF (InstantNeRF, BlockNeRF)
- SSL Contrastive Learning (SimCLR, MoCo, DINO v1 & v2)

🔹 NLP
- Transformers (original paper)
- Semantic Representation Encoders (BERT and its variants: RoBERTa, DistillBERT, ELECTRA, XLNet, MPNet, ALBERT)
- Autoregressive Decoders (GPT-n, Llama 1/2/3, Alpaca, Vicuna)
- Augmented LMs (RAG, Toolformer, HuggingGPT, Gorilla)
- Supervised Fine-tuning (Instruction tuning/FLAN, LIMA, LESS)
- LLM Alignment (RLHF/InstructGPT, PPO, DPO, KTO, GPO, IPO)
- Encoder + Decoder Architectures (T0, T5, BART)
- Machine Translation (M2M-100, NLLB-200)
- Contrastive Learning (SNCSE, InfoNCE, Sentence-BERT)
- Prompting (CoT, Auto-CoT, Self-Consistency, ToT, GoT, ReAct, APE, ART)
- PEFT (Prefix-tuning, Adapters, LoRA, LLaMA-Adapter v1 and v2, QLoRA, QA-LoRA, DoRA, NOLA)

🔹 Speech
- SSL Pre-Training (WavLM, AudioMAE, HuBERT)
- Automatic Speech Recognition/Keyword Spotting (GMM-HMM, DNN-HMM, all-neural architectures such as LAS/Whisper, streaming architectures such as RNN-T/Transformer-T)
- Speaker Identification (i/d/x-vectors, GE2E loss, AAM loss)
- Text-to-Speech (HiFi-GAN, Tacotron v1 and v2, Voicebox)
- Text-to-Audio/Music (MusicGen, AudioGen)

🔹 Multimodal
- SSL Pre-Training (ViLT, MLIM, UNiTER, LXMERT, VisualBERT, Data2Vec v1 and v2, I-Code, VL-BEIT, ImageBind)
- V+L Prompting (Flamingo, Frozen, InstructBLIP)
- Text-to-Image (DALL-E 1/2/3, Imagen, Latent Diffusion, Make-A-Scene, Make-a-Video)
- Translation (SeamlessM4T)
- Contrastive Learning (InfoNCE, CLIP, CLAP, AudioCLIP)

🔹 Core ML
- Training Regularizer (Dropout)
- Training/Inference Efficiency (ZeRO, ZeRO-Infinity, FlashAttention, FlashAttention-2)
- Training Stability (Batch/Layer/Group/Instance Norm, Residual/Skip Connections)
- Explainable AI (Guided Backprop, Grad-CAM, CAV, Influence functions, Representer points, TracIn)

🔹 RecSys
- ML-based Collaborative Filtering (Factorization Machines)
- DL-based Algorithms (Collaborative Deep Learning, Wide & Deep, DNNs for YouTube Recommendations, Product-based DNNs, NCF, Deep & Cross v1 and v2, DeepFM, Deep Interest Network, Behavior Sequence Transformer)

🔹 Graph ML
- Factorization-based Algorithms LLE (LLE, LAP, HOPE)
- Random Walk-based Algorithms (Node2vec)
- Deep Learning-based Algorithms (SDNE, GraphSAGE, EGNN, GCN, GAT)


![ Top Papers ](/assets/img/news/AI_Papers_link.gif){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

* * *

## 📝 컴퓨터 비전, NLP, 음성, 멀티모달 AI, Core ML, RecSys 및 Graph ML 분야의 주요 논문 • 

> Distilled AI : <http://papers.aman.ai>
> aman AI : <https://aman.ai/>
> 
👉🏼 해시태그#AI 의 주요 논문을 요약하여 (i) 알아야 할 사항과 (ii) 알아두면 좋은 내용으로 구분했습니다.

🔹 시력
- 이미지 분류(AlexNet, VGGNet, InceptionNet, ResNet과 같은 CNN 아키텍처에서 ViT, DeiT, BEiT, MAE와 같은 Transformer 아키텍처까지)
- 물체 감지(YOLO v1-v8, Fast/er R-CNN, Mask R-CNN, CenterNet, Pix2Seq, DETR, Detic, Focal Loss)
- 의미론적/인스턴스 분할(U-Net, Mask R-CNN, Segment Anything)
- NeRF (InstantNeRF, BlockNeRF)
- SSL 대조 학습(SimCLR, MoCo, DINO v1 및 v2)

🔹 NLP (영어)
- 변압기 (원본 용지)
- 의미론적 표현 인코더(BERT 및 그 변형: RoBERTa, DistillBERT, ELECTRA, XLNet, MPNet, ALBERT)
- 자동 회귀 디코더(GPT-n, Llama 1/2/3, Alpaca, Vicuna)
- 증강 LM(RAG, Toolformer, HuggingGPT, Gorilla)
- 감독 미세 조정(명령 튜닝/FLAN, LIMA, LESS)
- LLM 얼라인먼트 (RLHF/InstructGPT, PPO, DPO, KTO, GPO, IPO)
- 인코더 + 디코더 아키텍처(T0, T5, BART)
- 기계 번역 (M2M-100, NLLB-200)
- 대조 학습(SNCSE, InfoNCE, Sentence-BERT)
- 프롬프트(CoT, Auto-CoT, Self-Consistency, ToT, GoT, ReAct, APE, ART)
- PEFT(접두사 튜닝, 어댑터, LoRA, LLaMA-어댑터 v1 및 v2, QLoRA, QA-LoRA, DoRA, NOLA)

🔹 연설
- SSL 사전 교육(WavLM, AudioMAE, HuBERT)
- 자동 음성 인식/키워드 스포팅(GMM-HMM, DNN-HMM, LAS/Whisper와 같은 전체 신경 아키텍처, RNN-T/Transformer-T와 같은 스트리밍 아키텍처)
- 화자 식별(i/d/x-벡터, GE2E 손실, AAM 손실)
- 텍스트 음성 변환(HiFi-GAN, Tacotron v1 및 v2, Voicebox)
- 텍스트-오디오/음악(MusicGen, AudioGen)

🔹 복합
- SSL 사전 학습(ViLT, MLIM, UNiTER, LXMERT, VisualBERT, Data2Vec v1 및 v2, I-Code, VL-BEIT, ImageBind)
- V+L 프롬프트 (Flamingo, Frozen, InstructBLIP)
- 텍스트-이미지(DALL-E 1/2/3, 영상, 잠재 확산, Make-A-Scene, Make-A-Video)
- 번역(SeamlessM4T)
- 대조 학습(InfoNCE, CLIP, CLAP, AudioCLIP)

🔹 코어 ML
- 교육 정규화기(드롭아웃)
- 훈련/추론 효율성(ZeRO, ZeRO-Infinity, FlashAttention, FlashAttention-2)
- 학습 안정성(배치/레이어/그룹/인스턴스 표준, 잔차/스킵 연결)
- 설명 가능한 AI(유도 백프롭, Grad-CAM, CAV, 영향력 기능, 발표자 포인트, TracIn)

🔹 레크시스
- ML 기반 협업 필터링(Factorization Machine)
- DL 기반 알고리즘 (Collaborative Deep Learning, Wide & Deep, YouTube Recommendations용 DNN, 제품 기반 DNN, NCF, Deep & Cross v1 및 v2, DeepFM, Deep Interest Network, Behavior Sequence Transformer)

🔹 그래프 ML
- 인수분해 기반 알고리즘 LLE(LLE, LAP, HOPE)
- 랜덤 워크 기반 알고리즘(Node2vec)
- 딥러닝 기반 알고리즘 (SDNE, GraphSAGE, EGNN, GCN, GAT)