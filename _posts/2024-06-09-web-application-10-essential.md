---
title: 10 Essential Components of a Production Web Application.
description: Web, Application
categories: [Blogging, WebApp]
tags: [MeWebta, Application]
# author: foDev_jeong
date: 2024-06-09 11:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## 10 Essential Components of a Production Web Application

#### 1 - It all starts with CI/CD pipelines that deploy code to the server instances. Tools like Jenkins and GitHub help over here.
#### 2 - The user requests originate from the web browser. After DNS resolution, the requests reach the app servers.
#### 3 - Load balancers and reverse proxies (such as Nginx & HAProxy) distribute user requests evenly across the web application servers.
#### 4 - The requests can also be served by a Content Delivery Network (CDN).
#### 5 - The web app communicates with backend services via APIs.
#### 6 - The backend services interact with database servers or distributed caches to provide the data.
#### 7 - Resource-intensive and long-running tasks are sent to job workers using a job queue.
#### 8 - The full-text search service supports the search functionality. Tools like Elasticsearch and Apache Solr can help here.
#### 9 - Monitoring tools (such as Sentry, Grafana, and Prometheus) store logs and help analyze data to ensure everything works fine. 
#### 10 - In case of issues, alerting services notify developers through platforms like Slack for quick resolution. 

Over to you: What other components would you add to the architecture of a production web app?


![ Architecture of a web application ](/assets/img/blog/Architecture_of_a_web_application.gif){: .light .shadow .rounded-10 w='1212' h='668' }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## 프로덕션 웹 응용 프로그램의 10가지 필수 구성 요소

#### 1 - 모든 것은 서버 인스턴스에 코드를 배포하는 CI/CD 파이프라인으로 시작됩니다. Jenkins 및 GitHub와 같은 도구가 여기에 도움이 됩니다.
#### 2 - 사용자 요청이 웹 브라우저에서 시작됩니다. DNS 확인 후 요청은 앱 서버에 도달합니다.
#### 3 - 부하 분산 장치 및 역방향 프록시(예: Nginx 및 HAProxy)는 웹 애플리케이션 서버 간에 사용자 요청을 균등하게 분산합니다.
#### 4 - CDN(Content Delivery Network)에서도 요청을 처리할 수 있습니다.
#### 5 - 웹앱은 API를 통해 백 엔드 서비스와 통신합니다.
#### 6 - 백엔드 서비스는 데이터베이스 서버 또는 분산 캐시와 상호 작용하여 데이터를 제공합니다.
#### 7 - 리소스를 많이 사용하는 장기 실행 태스크는 작업 대기열을 사용하여 작업자에게 전송됩니다.
#### 8 - 전체 텍스트 검색 서비스가 검색 기능을 지원합니다. Elasticsearch 및 Apache Solr와 같은 도구가 도움이 될 수 있습니다.
#### 9 - 모니터링 도구(예: Sentry, Grafana 및 Prometheus)는 로그를 저장하고 데이터를 분석하여 모든 것이 제대로 작동하는지 확인합니다. 
#### 10 - 문제가 발생할 경우 알림 서비스는 빠른 해결을 위해 Slack과 같은 플랫폼을 통해 개발자에게 알립니다. 

여러분에게: 프로덕션 웹앱의 아키텍처에 추가할 다른 구성 요소는 무엇인가요?

</details>