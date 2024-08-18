---
title: 𝟳 𝗠𝘂𝘀𝘁-𝗸𝗻𝗼𝘄 𝗦𝘁𝗿𝗮𝘁𝗲𝗴𝗶𝗲𝘀 𝘁𝗼 𝗦𝗰𝗮𝗹𝗲 𝘆𝗼𝘂𝗿 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 by ByteByteGo
description: Study, DataBase
categories: [Study, DataBase]
tags: [Study, DataBase]
# author: foDev_jeong
date: 2024-08-12 12:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ Database Scaling Cheatsheet ](/assets/img/blog/database-scaling.gif){: .light .shadow .rounded-10 w='1212' h='668' }


### 𝟭 - 𝗜𝗻𝗱𝗲𝘅𝗶𝗻𝗴: 
Check the query patterns of your application and create the right indexes. 
 
### 𝟮 - 𝗠𝗮𝘁𝗲𝗿𝗶𝗮𝗹𝗶𝘇𝗲𝗱 𝗩𝗶𝗲𝘄𝘀: 
Pre-compute complex query results and store them for faster access. 
 
### 𝟯 - 𝗗𝗲𝗻𝗼𝗿𝗺𝗮𝗹𝗶𝘇𝗮𝘁𝗶𝗼𝗻: 
Reduce complex joins to improve query performance. 
 
### 𝟰 - 𝗩𝗲𝗿𝘁𝗶𝗰𝗮𝗹 𝗦𝗰𝗮𝗹𝗶𝗻𝗴 
Boost your database server by adding more CPU, RAM, or storage. 
 
### 𝟱 - 𝗖𝗮𝗰𝗵𝗶𝗻𝗴 
Store frequently accessed data in a faster storage layer to reduce database load. 
 
### 𝟲 - 𝗥𝗲𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻 
Create replicas of your primary database on different servers for scaling the reads. 
 
### 𝟳 - 𝗦𝗵𝗮𝗿𝗱𝗶𝗻𝗴 
Split your database tables into smaller pieces and spread them across servers. Used for scaling the writes as well as the reads. 