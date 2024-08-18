---
title: Even 𝗡𝗩𝗜𝗗𝗜𝗔 𝗡𝗜𝗠 𝗶𝘀 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 𝗼𝗻 𝗞𝘂𝗯𝗲𝗿𝗻𝗲𝘁𝗲𝘀, what is 𝗞𝘂𝗯𝗲𝗿𝗻𝗲𝘁𝗲𝘀?
description: LLMOps, Kubernetes
categories: [LLMOps, Kubernetes]
tags: [LLMOps, Kubernetes]
# author: foDev_jeong
date: 2024-08-04 15:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ Kubernetes for Machine Learning ](/assets/img/blog/kubernetes-for-machine-learning.gif){: .light .shadow .rounded-10 w='1212' h='668' }

### Even 𝗡𝗩𝗜𝗗𝗜𝗔 𝗡𝗜𝗠 𝗶𝘀 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 𝗼𝗻 𝗞𝘂𝗯𝗲𝗿𝗻𝗲𝘁𝗲𝘀, what is 𝗞𝘂𝗯𝗲𝗿𝗻𝗲𝘁𝗲𝘀 and why is it worth learning 𝗮𝘀 𝗠𝗟𝗢𝗽𝘀/𝗠𝗟/𝗗𝗮𝘁𝗮 𝗘𝗻𝗴𝗶𝗻𝗲𝗲𝗿?

👉 Today we look into the Kubernetes system from a bird's eye view.


# 𝗦𝗼, 𝘄𝗵𝗮𝘁 𝗶𝘀 𝗞𝘂𝗯𝗲𝗿𝗻𝗲𝘁𝗲𝘀 (𝗞𝟴𝘀)?

1. It is a container orchestrator that performs the scheduling, running and recovery of your containerised applications in a horizontally scalable and self-healing way.

## Kubernetes architecture consists of two main logical groups:

2. Control plane - this is where K8s system processes that are responsible for scheduling workloads defined by you and keeping the system healthy live.
3. Worker nodes - this is where containers are scheduled and run.

## 𝗛𝗼𝘄 𝗱𝗼𝗲𝘀 𝗞𝘂𝗯𝗲𝗿𝗻𝗲𝘁𝗲𝘀 𝗵𝗲𝗹𝗽 𝘆𝗼𝘂?

4. You can have thousands of Nodes (usually you only need tens of them) in your K8s cluster, each of them can host multiple containers. Nodes can be added or removed from the cluster as needed. This enables unrivaled horizontal scalability.
5. Kubernetes provides an easy to use and understand declarative interface to deploy applications. Your application deployment definition can be described in yaml, submitted to the cluster and the system will take care that the desired state of the application is always up to date.
6. Users are empowered to create and own their application architecture in boundaries pre-defined by Cluster Administrators.

- ✅ In most cases you can deploy multiple types of ML Applications into a single cluster, you don’t need to care about which server to deploy to - K8s will take care of it.
- ✅ You can request different amounts of dedicated machine resources per application.
- ✅ If your application goes down - K8s will make sure that a desired number of replicas is always alive.
- ✅ You can roll out new versions of the running application using multiple strategies - K8s will safely do it for you.
- ✅ You can expose your ML Services for other Product Apps to use with few intuitive resource definitions.
- ✅ …

❗️Having said this, while it is a bliss to use, usually the operation of Kubernetes clusters is what is feared. It is a complex system.

❗️Master Plane is an overhead, you need it even if you want to deploy a single small application.


* * *


![ When to use kubernetes for Machine Learning ](/assets/img/blog/use-kubernetes-for-machine-learning.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

# Should you use Kubernetes to deploy your Machine Learning models? 

Most likely not! When a technology is hot, there is a tendency to disregard why the tool is useful in the first place, and we see massive adoption for no good reason.

If you need to deploy machine learning models, there are typically 2 axes to look at: how many users and how many ML teams you have. The number of users will give you a sense of how much workload you are likely to have for your ML applications, and the number of ML teams is a good proxy for the complexity of the applications.

If you have low user traffic, you are better off deploying to a barebones EC2 instance. You could Dockerize your application, but it might not even provide a huge advantage. If fault tolerance is required, you can get 2 servers and a load balancer for redundancy. 

A typical server can handle ~1000 requests per second, so if you receive less than 100 requests per second, in the worst case, you have low user traffic. If traffic increases beyond that point, elastic load balancing is better to adapt to the workload.

If the number of people working on the ML code base is low, it might be better to avoid Kubernetes. The complexity of a code base is proportional to the number of people working on it. For example, if you have teams for ML engineering, MLOps, and data engineering, they each develop separate applications that need to be orchestrated together. 

Containerizing becomes critical because each team has its own software practice, and applications communicate through APIs in a microservice infrastructure. ML applications become complex pipelines where data engineers might be in charge of data processing applications, ML engineers in charge of ML model inference applications, and MLOps engineers in charge of model monitoring applications, all of which have to work together seemingly. 

Teams are likely to work independently of each other and need to focus on optimizing their own piece without constantly checking on others. Kubernetes can be a good solution when that level of complexity occurs. 

It abstracts the different applications into computational blocks, and they are orchestrated by the Kube cluster itself, which allows for a high level of automation. It provides a scaling mechanism similar to load balancing to adapt to high workloads. 

Very few companies can pretend to have that level of complexity, and even if people belong to different teams, if the number of people involved in deploying models is less than a dozen, it is unlikely that complexity calls for Kubernetes. 

Even if the code seems complex, it might be simpler for those people to work on the same code base in a monolithic application.


* * *


![ Kubernetes Scaling Strategies ](/assets/img/blog/kubernetes-scaling-strategies.gif){: .light .shadow .rounded-10 w='1212' h='668' }

# Kubernetes Scaling Strategies:

### Horizontal Pod Autoscaling (HPA):
- Function: Adjusts the number of pod replicas based on CPU/memory usage or other select metrics.
- Workflow: The Metrics Server collects data → API Server communicates with the HPA controller → The HPA controller scales the number of pods up or down based on the metrics.

### Vertical Pod Autoscaling (VPA):
- Function: Adjusts the resource limits and requests (CPU/memory) for containers within pods.
- Workflow: The Metrics Server collects data → API Server communicates with the VPA controller → The VPA controller scales the resource requests and limits for pods.

### Cluster Autoscaling:
- Function: Adjusts the number of nodes in the cluster to ensure pods can be scheduled.
- Workflow: Scheduler identifies pending pods → Cluster Autoscaler determines the need for more nodes → New nodes are added to the cluster to accommodate the pending pods.

### Manual Scaling:
- Function: Manually adjusts the number of pod replicas.
- Workflow: A user uses the kubectl command to scale pods → API Server processes the command → The number of pods in the backend Kubernetes system is adjusted accordingly.

### Predictive Scaling:
- Function: Uses machine learning models to predict future workloads and scales resources proactively.
- Workflow: ML Forecast generates predictions → KEDA (Kubernetes-based Event Driven Autoscaling) acts on these predictions → Cluster Controller ensures resource balance by scaling resources.

### Custom Metrics Based Scaling:
- Function: Scales pods based on custom application-specific metrics.
- Workflow: Custom Metrics Server collects and provides metrics → HPA controller retrieves these metrics → The HPA controller scales the deployment based on custom metrics.

These strategies ensure that Kubernetes environments can efficiently manage varying loads, maintain performance, and optimize resource usage. Each method offers different benefits depending on the specific needs of the application and infrastructure.