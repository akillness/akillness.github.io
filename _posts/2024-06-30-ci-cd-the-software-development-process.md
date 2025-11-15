---
title: CI/CD, which stands for continuous integration and continuous delivery/deployment
description: Software,CI/CD
categories: [Setting, CI/CD]
tags: [CI, CD]
# author: foDev_jeong
date: 2024-06-30 19:10:00 +0800
# pin: true
# math: true
mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## CI/CD: Automating the Software Development Process

*Curiosity:* How can we automate software development to improve quality and speed? What practices enable continuous integration and deployment?

**CI/CD** (Continuous Integration and Continuous Delivery/Deployment) is a set of practices that automates the software development process. Code changes can be integrated, tested, and deployed more frequently, improving quality and time to market.

### CI/CD Overview

*Retrieve:* Understanding CI/CD fundamentals.

```mermaid
graph LR
    A[Development] --> B[Pull Request]
    B --> C[Peer Review]
    C --> D[Merge]
    D --> E[CI Pipeline]
    E --> F[Build]
    F --> G[Test]
    G --> H[Pre-Prod Deploy]
    H --> I[Production Deploy]
    
    style A fill:#e1f5ff
    style E fill:#fff3cd
    style I fill:#d4edda
```

### How CI/CD Works

*Innovate:* Step-by-step CI/CD workflow.

| Stage | Description | Purpose |
|:------|:------------|:--------|
| **1. Development** | Developers work in local branches | ⬆️ Isolated work |
| **2. Pull Request** | Submit code for review | ⬆️ Code quality |
| **3. Peer Review** | Review and ensure quality standards | ⬆️ Collaboration |
| **4. Merge** | Approved code merged to main | ⬆️ Integration |
| **5. CI Pipeline** | Automated build, test, deploy | ⬆️ Automation |
| **6. Build** | Compile into executable | ⬆️ Artifact creation |
| **7. Testing** | Unit, integration, E2E tests | ⬆️ Quality assurance |
| **8. Pre-Prod Deploy** | Deploy to staging environment | ⬆️ Validation |
| **9. Production Deploy** | Deploy to live environment | ⬆️ Release |

### Testing Types

*Retrieve:* Comprehensive testing in CI/CD.

**Test Types**:
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

**Purpose**: Ensure application works as expected before deployment.

### Benefits of CI/CD

*Retrieve:* Key advantages of CI/CD adoption.

| Benefit | Description | Impact |
|:--------|:------------|:-------|
| **Improved Quality** | Identify and fix bugs early | ⬆️ Better software |
| **Faster Time to Market** | Rapid deployment cycles | ⬆️ Competitive advantage |
| **Reduced Risk** | Less broken code in production | ⬇️ Deployment failures |
| **Increased Productivity** | Focus on code, not manual tasks | ⬆️ Developer efficiency |

### CI/CD Tools

*Innovate:* Popular tools for CI/CD automation.

**Popular Tools**:
- **Jenkins**: Open-source automation server
- **GitLab CI/CD**: Integrated with GitLab
- **CircleCI**: Cloud-based CI/CD
- **GitHub Actions**: Native GitHub integration
- **Azure DevOps**: Microsoft's solution

**Purpose**: Automate the CI/CD pipeline for consistent, reliable deployments.

### Key Takeaways

*Retrieve:* CI/CD automates software development through continuous integration, testing, and deployment, improving quality, speed, and reducing risk.

*Innovate:* By implementing CI/CD with tools like Jenkins, GitLab, or CircleCI, you can automate building, testing, and deployment, enabling faster delivery of high-quality software with reduced risk.

*Curiosity → Retrieve → Innovation:* Start with curiosity about software automation, retrieve insights from CI/CD practices, and innovate by implementing automated pipelines that improve your development workflow.

**Next Steps**:
- Choose a CI/CD tool
- Set up your pipeline
- Automate testing
- Deploy automatically

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