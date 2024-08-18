---
title: Deploy an ML model 🧠
description: LLM, Application
categories: [LLM, Application]
tags: [Application, Deploy]
# author: foDev_jeong
date: 2024-08-05 17:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ Ways to deploy an ML Model ](/assets/img/llm/ways-to-deploy-an-ml-model.gif){: .light .shadow .rounded-10 w='1212' h='668' }

## Batch Deployment:

**Process**: User requests prediction → Backend service pulls predictions from the database → Daily batch inference by ML service.

**Usage**: Suitable for scenarios where predictions don't need to be immediate, like daily reports.

## Real-time Deployment:

**Process**: User requests prediction → Backend service requests prediction computation from ML service → Features pulled from the database for real-time inference.

**Usage**: Ideal for applications requiring instant responses, like chatbots.

## Streaming Deployment:

**Process**: User requests prediction → Backend service checks if prediction is available → If not, an event triggers prediction request → Asynchronous computation by model stream processor → Prediction results stored in queue.

**Usage**: Best for continuous data streams, such as real-time monitoring.

## Edge Deployment:

**Process**: User requests prediction on a local device → Local ML model processes data → Backend service serves additional data if needed → Data pulled from database.

**Usage**: Perfect for applications with latency constraints or offline capabilities, like mobile apps.

These deployment methods cater to different needs based on the application's requirements for response time, data processing, and computational resources.
