---
title: "The release of NVIDIA NIM on Hugging Face Inference Endpoints"
description: "Curiosity: How can we simplify generative AI model deployment? What happens when NVIDIA's inference services meet Hugging Face's platform?"
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-06-04 02:00:00 +0800
mermaid: true
---
## NVIDIA NIM on Hugging Face Inference Endpoints: Simplified AI Deployment

*Curiosity:* How can we simplify generative AI model deployment? What happens when NVIDIA's inference services meet Hugging Face's platform?

**At COMPUTEX**, Jensen Huang announced NVIDIA NIM on Hugging Face Inference Endpoints. NVIDIA NIM are inference services designed to streamline and accelerate generative AI model deployment.

> **Learn More**: <https://developer.nvidia.com/blog/nvidia-collaborates-with-hugging-face-to-simplify-generative-ai-model-deployments>
{: .prompt-info}

### Key Features

*Retrieve:* NVIDIA NIM simplifies AI model deployment.

| Feature | Description | Benefit |
|:--------|:------------|:--------|
| **1-Click Deployment** | From Hugging Face Hub | ⬆️ Ease of use |
| **High Performance** | Up to 9000 tokens/sec | ⬆️ Speed |
| **Cloud Support** | AWS, GCP | ⬆️ Flexibility |
| **Model Variety** | Multiple models supported | ⬆️ Options |

### Available Models

*Retrieve:* Current and upcoming model support.

**Currently Available**:
- Llama 3 8B
- Llama 3 70B

**Coming Soon**:
- Mixtral 8x22B
- Phi-3
- Gemma
- More models

### Performance

*Innovate:* Impressive inference speeds.

**Llama 3 8B**:
- **Up to 9000 tokens/sec**
- High throughput
- Low latency

### Deployment Workflow

*Retrieve:* Simple deployment process.

```mermaid
graph LR
    A[Hugging Face Hub] --> B[1-Click Deploy]
    B --> C[NVIDIA NIM]
    C --> D[Inference Endpoint]
    D --> E[Production Ready]
    
    F[AWS/GCP] --> C
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style E fill:#d4edda
```

**Steps**:
1. Select model from Hugging Face Hub
2. One-click deployment
3. Automatic setup on AWS/GCP
4. Production-ready inference endpoint

### Benefits

*Innovate:* Why NVIDIA NIM matters.

**For Developers**:
- ✅ Simplified deployment
- ✅ High performance
- ✅ Cloud flexibility
- ✅ Easy scaling

**For Organizations**:
- ✅ Faster time to production
- ✅ Reduced infrastructure complexity
- ✅ Cost-effective scaling
- ✅ Enterprise-ready

### Key Takeaways

*Retrieve:* NVIDIA NIM on Hugging Face Inference Endpoints enables 1-click deployment of generative AI models with high performance (up to 9000 tokens/sec) on AWS and GCP.

*Innovate:* By combining NVIDIA's inference optimization with Hugging Face's platform, developers can deploy production-ready AI models in minutes instead of days, accelerating AI adoption.

*Curiosity → Retrieve → Innovation:* Start with curiosity about simplified AI deployment, retrieve insights from NVIDIA NIM's capabilities, and innovate by deploying your models with unprecedented ease and performance.

**Next Steps**:
- Explore Hugging Face Inference Endpoints
- Try NVIDIA NIM deployment
- Test performance
- Deploy your models


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## Yesterday at COMPUTEX, Jensen Huang announced the launch of NVIDIA NIM for Hugging Face Inference Endpoints!

🚀 NVIDIA NIM is an inference service designed to simplify and accelerate the deployment of generative AI models. 👀

- 1️⃣ 1-click deployment from Hugging Face Hub to Inference Endpoints
- 🆕 Starting with Llama 3 8B and Llama 3 70B from AWS to GCP
- 🚀 Up to 9000 tokens/second (Llama 3 8B)
- 🔜 Mixtral 8x22B, Phi-3, and Gemma and more coming soon.

Read more: <https://developer.nvidia.com/blog/nvidia-collaborates-with-hugging-face-to-simplify-generative-ai-model-deployments>

</details>
