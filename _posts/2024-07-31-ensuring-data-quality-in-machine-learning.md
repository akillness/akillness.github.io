---
title: Ensuring 𝗗𝗮𝘁𝗮 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 𝗶𝗻 𝗠𝗮𝗰𝗵𝗶𝗻𝗲 𝗟𝗲𝗮𝗿𝗻𝗶𝗻𝗴 𝗦𝘆𝘀𝘁𝗲𝗺𝘀 is now as important as ever, how do we do it?
description: Study, Datascience
categories: [Study, Datascience]
tags: [Study, Datascience]
# author: foDev_jeong
date: 2024-07-31 12:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ Data Quality in Machine Learning ](/assets/img/blog/data-quality-in-machine-learning-systems.gif){: .light .shadow .rounded-10 w='1212' h='668' }

## It is extremely important to ensure Data Quality upstream of ML Training and Inference Pipelines, trying to do that in the pipelines will cause unavoidable failure when working at scale. 

Data Contracts can be leveraged for this goal.
 
Data Contract is an agreement between Data Producers and Data Consumers about the qualities to be met by Data being produced.

### Data Contract should hold the following non-exhaustive list of metadata:
 
- 👉 Schema Definition.
- 👉 Schema Version.
- 👉 SLA metadata.
- 👉 Semantics.
- 👉 Lineage.
- 👉 …

### Example Architecture Enforcing Data Contracts:
 
1. Schema changes are implemented in version control, once approved - they are pushed to the Applications generating the Data, Databases holding the Data and a central Data Contract Registry.

> **𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁** : Ideally you should be enforcing a Data contract at this stage, when producing Data. Data Validation steps down the stream are Detection and Prevention mechanisms that don’t allow low quality data to reach downstream systems. There might be a significant delay before you can do those checks, causing irreversible corruption or loss of data.
{: .prompt-info}

### Applications push generated Data to Kafka Topics:
 
2. Events emitted directly by the Application Services.
   👉 This also includes IoT Fleets and Website Activity Tracking.
   -  Raw Data Topics for CDC streams.
3. A Flink Application(s) consumes Data from Raw Data streams and validates it against schemas in the Contract Registry.
4. Data that does not meet the contract is pushed to Dead Letter Topic.
5. Data that meets the contract is pushed to Validated Data Topic.
6. Data from the Validated Data Topic is pushed to object storage for additional Validation.
7. On a schedule Data in the Object Storage is validated against additional SLAs in Data Contracts and is pushed to the Data Warehouse to be Transformed and Modeled for Analytical purposes.
8. Modeled and Curated data is pushed to the Feature Store System for further Feature Engineering.
   - Real Time Features are ingested into the Feature Store directly from Validated Data Topic (5).
  👉 Ensuring Data Quality here is complicated since checks against SLAs is hard to perform.
9.  High Quality Data is used in Machine Learning Training Pipelines.
10. The same Data is used for Feature Serving in Inference.


