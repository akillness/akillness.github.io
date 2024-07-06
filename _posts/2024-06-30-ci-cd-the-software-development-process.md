---
title: CI/CD, which stands for continuous integration and continuous delivery/deployment
description: Software,CI/CD
categories: [Setting, CI/CD]
tags: [CI, CD]
# author: foDev_jeong
date: 2024-06-30 19:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

CI/CD, which stands for continuous integration and continuous delivery/deployment, is a set of practices that automates the software development process. 

This means that code changes can be integrated, tested, and deployed more frequently, which can help to improve the quality of your software and get it to market faster.

## 𝗛𝗲𝗿𝗲'𝘀 𝗮 𝗯𝗿𝗲𝗮𝗸𝗱𝗼𝘄𝗻 𝗼𝗳 𝗵𝗼𝘄 𝗖𝗜/𝗖𝗗 𝘄𝗼𝗿𝗸𝘀 𝗼𝗻 𝗮 𝗵𝗶𝗴𝗵 𝗹𝗲𝘃𝗲𝗹:

- • 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗺𝗲𝗻𝘁: Developers work on their code in a local branch.
 
- • 𝗣𝘂𝗹𝗹 𝗥𝗲𝗾𝘂𝗲𝘀𝘁: When a developer is happy with their changes, they create a pull request. This submits their code for review by other developers.
 
- • 𝗣𝗲𝗲𝗿 𝗥𝗲𝘃𝗶𝗲𝘄: Other developers review the code and make sure it meets quality standards.
 
- • 𝗠𝗲𝗿𝗴𝗲: If the code is approved, it is merged into the main branch.
 
- • 𝗖𝗼𝗻𝘁𝗶𝗻𝘂𝗼𝘂𝘀 𝗜𝗻𝘁𝗲𝗴𝗿𝗮𝘁𝗶𝗼𝗻: When code is merged into the main branch, a CI pipeline is triggered. This pipeline automates the process of building, testing, and deploying the code.
 
- • 𝗕𝘂𝗶𝗹𝗱: The code is compiled into an executable application.
 
- • 𝗧𝗲𝘀𝘁𝗶𝗻𝗴: The application is then tested to ensure that it works as expected. This may include unit tests, integration tests, and end-to-end tests.
 
- • 𝗣𝗿𝗲-𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻 𝗗𝗲𝗽𝗹𝗼𝘆𝗺𝗲𝗻𝘁: If the tests pass, the application is deployed to a pre-production environment. This environment is a replica of the production environment, but it is not accessible to end users.
 
- • 𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻 𝗗𝗲𝗽𝗹𝗼𝘆𝗺𝗲𝗻𝘁: If the application works well in pre-production, it can be deployed to the production environment. This is the environment that end users will use.

## 𝗕𝗲𝗻𝗲𝗳𝗶𝘁𝘀 𝗼𝗳 𝗖𝗜/𝗖𝗗

There are many benefits to using CI/CD, including:

- • Improved software quality: CI/CD helps to identify and fix bugs early in the development process.
 
- • Faster time to market: CI/CD can help you to get your software to market faster.
 
- • Reduced risk: CI/CD can help to reduce the risk of deploying broken code to production.
 
- • Increased developer productivity: CI/CD can help developers to focus on writing code instead of manual tasks.

## 𝗚𝗲𝘁𝘁𝗶𝗻𝗴 𝗦𝘁𝗮𝗿𝘁𝗲𝗱 𝘄𝗶𝘁𝗵 𝗖𝗜/𝗖𝗗

There are a number of CI/CD tools available, such as Jenkins, GitLab, and CircleCI. 

These tools can help you to automate the CI/CD pipeline.

If you're looking to improve your software development process, CI/CD is a great place to start. 

By automating the process of building, testing, and deploying your code, you can deliver high-quality software faster and with less risk.

![ How CI/CD Works ](/assets/img/blog/CI_CD_Works.gif){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

CI/CD는 Continuous Integration 및 Continuous Delivery/Deployment의 약자로 소프트웨어 개발 프로세스를 자동화하는 일련의 관행입니다. 

즉, 코드 변경 사항을 더 자주 통합, 테스트 및 배포할 수 있으므로 소프트웨어 품질을 개선하고 시장에 더 빨리 출시할 수 있습니다.

## 다음은 CI/CD가 높은 수준에서 작동하는 방식에 대한 분석입니다.

- • 개발: 개발자는 로컬 브랜치에서 코드 작업을 합니다.
 
- • 풀 리퀘스트(Pull Request): 개발자가 변경 사항이 만족스러우면 풀 리퀘스트를 생성합니다. 이렇게 하면 다른 개발자가 검토할 수 있도록 코드가 제출됩니다.
 
- • 동료 평가: 다른 개발자가 코드를 검토하고 품질 표준을 충족하는지 확인합니다.
 
- • 병합: 코드가 승인되면 기본 분기에 병합됩니다.
 
- • 지속적 통합: 코드가 기본 분기에 병합되면 CI 파이프라인이 트리거됩니다. 이 파이프라인은 코드를 빌드, 테스트 및 배포하는 프로세스를 자동화합니다.
 
- • 빌드: 코드가 실행 가능한 애플리케이션으로 컴파일됩니다.
 
- • 테스트: 그런 다음 응용 프로그램을 테스트하여 예상대로 작동하는지 확인합니다. 여기에는 단위 테스트, 통합 테스트 및 종단 간 테스트가 포함될 수 있습니다.
 
- • 사전 프로덕션 배포: 테스트를 통과하면 응용 프로그램이 사전 프로덕션 환경에 배포됩니다. 이 환경은 프로덕션 환경의 복제본이지만 최종 사용자가 액세스할 수 없습니다.
 
- • 프로덕션 배포: 응용 프로그램이 사전 프로덕션에서 잘 작동하는 경우 프로덕션 환경에 배포할 수 있습니다. 이 환경은 최종 사용자가 사용할 환경입니다.

## CI/CD의 이점

CI/CD를 사용하면 다음과 같은 많은 이점이 있습니다.

- • 소프트웨어 품질 향상: CI/CD는 개발 프로세스 초기에 버그를 식별하고 수정하는 데 도움이 됩니다.
 
- • 시장 출시 시간 단축: CI/CD를 통해 소프트웨어를 더 빨리 출시할 수 있습니다.
 
- • 위험 감소: CI/CD는 손상된 코드를 프로덕션에 배포하는 위험을 줄이는 데 도움이 될 수 있습니다.
 
- • 개발자 생산성 향상: CI/CD는 개발자가 수동 작업 대신 코드 작성에 집중할 수 있도록 지원합니다.

## CI/CD 시작하기

Jenkins, GitLab 및 CircleCI와 같은 다양한 CI/CD 도구를 사용할 수 있습니다. 

이러한 도구는 CI/CD 파이프라인을 자동화하는 데 도움이 될 수 있습니다.

소프트웨어 개발 프로세스를 개선하려는 경우 CI/CD를 시작하는 것이 좋습니다. 

코드 빌드, 테스트 및 배포 프로세스를 자동화하면 위험을 줄이면서 고품질 소프트웨어를 더 빠르게 제공할 수 있습니다.

</details>