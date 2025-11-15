---
title: Flutter 를 공부하며 개발하기 -초급편-
description: Kakao, Utility
categories: [Blogging, Flutter]
tags: [Flutter, Tutorial]
# author: foDev_jeong
date: 2024-03-30 21:00:00 +0800
render_with_liquid: true
# pin: true
# math: true
mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

> Task Planning 을 통해, Flutter의 사용방법 및 앱 개발을 위한 전반적인 사전 지식을 습득하고 앱 개발에 대한 감각을 익히는 것이 중점입니다. 해당 Task는 자발적인 학습을 통해 Flutter 의 개발과 관련된 본인의 지식을 공유하고 함께 코드를 자유롭게 수정,개발,배포할 수 있는 적정 수준까지 끌어올리는 것을 목표로 합니다.
{: .prompt-info}

* * *
### Flutter를 이용한 앱 개발을 위한 Task Planning:

| 카테고리&nbsp; | 일정&nbsp; |항목&nbsp; | 비고&nbsp; | 
| :---:| :--- |:--- | :-- |
| 개념 |  | Flutter의 개념 및 핵심 구성요소 확인 | 기본: Dart 프로그래밍 |
| 동기 |  | Flutter를 이용해 개발하는 이유 |사례: 네이버지식iN |
| 개발 |  | 개발환경설정 | - |
| 개발 |  | Flutter 를 이용한 app 기획 - 1 시계 만들기| 간단한 앱 개발 |
| 개발 |  | app 세부구성(1) | - |
| 개발 |  | app 기능구현(1) | - |
| 개발 |  | Flutter 를 이용한 app 기획 - 2 블로그 만들기 | 간단한 웹 개발 |
| 개발 |  | app 세부구성(2) | - |
| 개발 |  | app 기능구현(2) | - |
| 개발 |  | DB 만들기 | - |
| 개발 |  | 마켓플레이스에 올려보기 | - |



* * *
>⚠ 아래의 상세 내용은 아직 작성중에 있습니다.


* * *
## Flutter의 개념 및 핵심 구성요소 확인

<details markdown="1">
<summary> Flutter 개념과 구성에 대해 자세히 알아보기 </summary>

### Flutter 개념
[Flutter](https://flutter-ko.dev/)는 모바일 앱과 웹 앱, 데스크톱 앱을 단일 코드 베이스로 개발할 수 있도록 Google이 개발한 프레임워크입니다. 2017년 5월에 최초로 릴리스되었지만 Flutter 1.0.0 버전은 2018년 12월에 릴리스되었습니다. Flutter에 대한 관심도가 높지만 국내에는 실서비스 적용에 관한 정보가 여전히 많이 부족합니다.

또한, Flutter를 사용하면 모바일 앱, 웹 앱, 데스크톱 앱을 위한 고품질의 사용자 인터페이스를 빠르고 효율적으로 개발할 수 있습니다.
Flutter는 단일 코드베이스로 Android와 iOS 모두를 대상으로 하는 크로스 플랫폼 개발을 지원합니다. 또한 Flutter는 네이티브 수준의 성능을 제공하기 위해 하드웨어 가속을 사용하며, UI를 빌드하기 위해 재사용 가능한 위젯을 제공합니다. 이러한 위젯은 캔버스에 직접 렌더링되므로 높은 성능과 부드러운 애니메이션을 제공합니다.

Flutter는 Dart라는 현대적인 프로그래밍 언어로 앱을 작성하며, 다양한 UI 구성 요소와 기능을 제공하는 다양한 라이브러리와 도구를 포함하고 있습니다. 또한 Flutter 개발자는 Hot Reload 기능을 사용하여 코드 변경을 실시간으로 적용하고 앱의 개발과 테스트를 빠르게 반복할 수 있습니다.
 
앱 개발자에게는 Flutter가 앱 개발 생산성을 높이고 코드를 공유하고 유지 관리할 수 있는 강력한 도구이며, 사용자에게는 아름답고 풍부한 경험을 제공하는 앱을 구축하는 데 유용한 선택이 될 수 있습니다.

### Flutter 핵심 구성

*Curiosity:* Flutter는 **단일 스레드(single-trheaded)** 언어인 다트(Dart)를 사용하여 작성합니다. 단일 스레드는 한 번에 한 가지의 작업만 수행할 수 있는데, 이는 플러터 앱이 한 번에 한 가지 작업만 수행 할 수 있음을 의미합니다.



>그렇다고 Flutter 엡이 동시에 여러가지 작업을 못하는 것은 아닙니다.

+ 다트(Dart) 의 처리 상식
  + 처리가 오래걸리는 이벤트는 일단 시작됩니다.
  + HTTP 요청, 파일 읽기 등과 같이 무엇인가를 기다리는 순간 다른 이벤트를 처리하러 갑니다.
  + 일종의 리스너(listener)가 형성됩니다. 이 리스너는 기다리고 있는 활동을 모니터링하고 기다리는 것이 끝나면 알려줍니다.
  + 이 리스너를 참조하고 있던 객체가 메인 스레드(main thread)로 반환되는데, 이 객체가 우리가 배울 Future입니다.
  + 그 대기 중인 활동이 끝났을 때, 이벤트 루프가 이를 보고 메인 스레드에서 그 활동과 관련된 메서드(method)를 실행하여 그 느린 이벤트를 마무리하는 것을 처리합니다.

긴 호흡인 것 같지만 우리가 할 일은 Future라는 코드를 쓰는 것 밖에 없습니다.


``` dart
//  ReadaFile()은 처리하는데 시간이 오래걸리는 Method입니다.
Future myFuture = ReadaFile();
// 일단 이 파일을 읽는 메서드를 호출하여 파일 읽기를 시작한 후에 파일로부터 데이터를 받는 동안 
// Dart는 다른 이벤트를 처리하러 갑니다.
```

Future는 지금은 없지만 미래 어느 시점에 요청한 데이터 혹은 에러가 담길 박스라고 생각하시면됩니다. 즉, 요청한 작업의 결과를 기다리지 않고 바로 다음 작업으로 넘어가고 그 후 작업이 완료되면 결과를 받는 방식이라고 보시면 됩니다.


Flutter는 **이벤트 루프(event-loop)** 를 사용합니다.
엡이 시작되고 엡이 멈추는 사이에 사용자들이 계속 탭을 누르는 등 수 많은 이벤트가 발생할 겁니다.

앱은 사용자들이 언제 탭을 눌러 어떤 순서로 이벤트들을 발생시킬지 예측할 수 없고 단일 스레드로 이러한 모든 이벤트들을 처리해야 합니다. 그래서 앱은 이벤트 루프를 실행합니다. 이벤트 큐에서 가장 오래된 이벤트를 가져와서 처리하고 이 과정을 이벤트큐가 비워질 때까지 반복합니다.

앱이 실행되는 동안(사용자가 폰 화면을 터치하거나, 뭔가를 다운로드하는 등) 이벤트 루프는 이러한 이벤트들을 한 번에 하나씩 처리하면서 돌아가고 있습니다.


</details>

* * *

## Flutter를 이용해 개발하는 이유
<details markdown="1">
<summary>네이버지식iN 개발 사례를 통해, 엡 개발에 Flutter를 사용한 이유의 필요성을 파악해봅시다.</summary>


<!-- summary 아래 한칸 공백 두고 내용 삽입 -->
#### **모바일 앱 개발 문제점**
+ 동일안 UI 구현의 한계
  +  모바일 앱의 플랫폼이 iOS와 Android로 나뉘어 있어, 기획 단계에서는 스펙 논의가 같이 진행되어도 디자인 단계 이후로 부터는 별도의 개발 과정을 거치게 됩니다. 
![Mobile Process](/assets/img/flutter/mobile_dev_process.png)
+ 서비스상 개발자 불균형 문제
  +  각각 별도의 플랫폼을 개발하기 때문에 개발, 테스트, 배포를 플랫폼 별로 진행하기 때문에 한 플랫폼의 개발자가 부족하면 스펙 구현이 불가능해지거나 배포 일정을 맞출 수 없게 됩니다. 
+ 개발 효율성 문제 
  + 기술공유
    + 각각의 플랫폼 커뮤니티만 활성화
  + 네이밍 컨벤션 통일
    + 플랫폼 별 선호하는 컨벤션 차이 및 개발 일정에 따라 매번 컨벤션을 맞추기 어려운 한계
  + 라이브러리 개발
    + 별도의 라이브러리 개발 인원 필요
    + 꾸준한 관리가 어려움
    + 서비스별로 다른 스펙을 라이브러리로 구현하기 어려움

![Mobile Problems](/assets/img/flutter/mobile_dev_problem.png)

그렇다면, 크로스플랫폼의 필요성은 어떨까요?

#### **크로스 플랫폼 개발에 대한 인식**

![Cross platform thinking](/assets/img/flutter/cross_platform_survey.png)


+ 의미있는 기타 의견
  + 개발 인원 충원과 결원에 대한 어려움이 있다
  + 신규 프로젝트가 아닌 기존 레거시 프로젝트를 크로스 플랫폼으로 전환하는 것은 비용이 더 높을 것이다
  + 반대로 사용자가 많아져서 크로스 플랫폼에서 다시 네이티브로 전환할 때도 비용이 높을 것이다

>기존의 모바일 엡 개발의 단점을 크로스 플랫폼의 사용을 통해, 상당 부분을 개선할 수 있음에도 개발에 적용하기 어려워하는 부분이 있음을 알 수 있습니다.

네이버 지식iN 개발 팀원 대부분은 앞의 설문 조사 결과와 마찬가지로 크로스 플랫폼에 대해 회의적인 시각을 가지고 있었다. 아무래도 네이티브 방식으로 개발한 앱보다 실행 성능이 낮을 것이라 예상하고 검토를 시작했다. 하지만 검토를 진행하면서 이 부분이 편견이었음을 알았고, 지금(2021년 10월 기준)까지 지식iN은 Flutter로 개발하고 있다.


#### **크로스 플랫폼 개발 도전**

2019년 1월 7일부터 1월 14일까지 1주일 동안 [React Native](https://reactnative.dev/)와 [Xamarin](https://learn.microsoft.com/ko-kr/xamarin/), Flutter, [SCADE](https://learn.microsoft.com/ko-kr/xamarin/)의 4개 크로스 플랫폼에 대해 6명의 개발자가 성능과 생산성을 기준으로 검토를 진행했습니다. 검토를 위해 부스트 캠프 3기에서 iOS 사전 과제로 진행한 프로젝트를 참고해 박스 오피스 앱을 구현하는 것을 1차 과제로 삼았다. 박스 오피스 앱 구현을 통해 기본 UI와 네트워크 작업 등을 테스트했다.

| 구분 &nbsp; | 내용 &nbsp;|
| :---| :--- |
| 학습 비용(learnability) | 초심자가 쉽게 학습할 수 있는가?|
| 가독성(readability) | 	개발 언어나 프레임워크의 가독성이 좋은가?|
| 서드파티(third-party)| 서드파티 라이브러리를 가져다 쓰기 쉬운가?|
| 커뮤니티 활성도(community size) | 이슈가 발생했을 때 Stack Overflow와 같은 커뮤니티에서 답을 찾기 쉬운가?|
| 개발도구 사용성(IDE support) | 	IDE 사용성이 좋은가? |
| 디버거 | 	디버거가 잘 작동하는가? 디버깅이 쉬운가? |
| 컴파일 속도 | 컴파일 속도가 기존 iOS용 개발 도구와 Android용 개발 도구보다 많이 느린가?|
| 런타임 속도 | UI 실행 속도와 애니메이션 실행 속도가 느린가?|
| 안정성(stability) | 크래시가 발생하는가? |
| 호환성(compatibility) | 네이티브 코드(Kotlin, Swift)와 같이 쓸 수 있는가? <br> 프레임워크 버전마다 API의 차이가 많은가? |
| 로컬라이징(localization) | 로컬라이징이 어려운가? |
| 테스트 용이성(testability) | UI 테스트와 유닛 테스트를 하기 쉬운가? |


평가 기준을 바탕으로 각 플랫폼을 비교한 결과 Flutter가 가장 좋은 평가를 받았다. 

특히, Flutter의 성능은 팀에서 기대한 것보다 훨씬 좋았다. 화면 동작에서는 네이티브 방식과 구분하기 어려울 정도의 성능이 나왔다. React Native와 Flutter, [Webview](https://developer.android.com/develop/ui/views/layout/webapps/webview?hl=ko)를 비교한 글([What’s Revolutionary about Flutter](https://hackernoon.com/whats-revolutionary-about-flutter-946915b09514))의 설명처럼 Flutter는 Bridge를 거치지 않고 바로 Canvans에 UI를 렌더링하기 때문에 기대 이상의 성능을 보여 준다.

 화면 렌더링 시 60fps의 성능이 나올 수 있다면 앱의 동작이 충분히 부드러워 사용성이 좋아지는데, 네이티브 방식과 Flutter, React Native 모두 60fps에 근접한 성능을 보여 준다([Flutter vs React Native vs Native: Deep Performance Comparison 참고](https://medium.com/swlh/flutter-vs-react-native-vs-native-deep-performance-comparison-990b90c11433)).

![Reactive and Flutter Performance](/assets/img/flutter/reactive_versus_flutter.png)


#### **1차 테스트 결과 성능순위**
{: .box-note}
1. **Flutter**
2. React Native
3. Xamarin
4. SCADE



2차 테스트에서는 Flutter로 어떤 단계까지 구현이 가능한지 확인하기 위해 조금 더 난이도가 있는 앱을 과제로 삼았다. 2개월 정도 진행된 프로토타입 서비스를 Flutter로 구현하기로 하고 iOS 개발자 4명과 Android 개발자 3명이 2019년 1월 16일부터 1월 30일까지 약 2주 정도 테스트를 진행했다. 더 많은 기능을 테스트하기 위해 라이브러리, Google 지도, WebView, 커스텀 UI 등의 구현을 확인했다. 그 결과 iOS 개발자 6명과 Android 개발자 6명이 2개월 동안 개발한 서비스를 2주 만에 유사하게 구현했다.

||기존 방법으로 개발 | **Flutter로 개발** |
|:---| :---:|:---:|
|개발 인원| iOS 개발자: 6명 <br> Android 개발자: 6명 | iOS 개발자: 3명 <br> Android 개발자: 4명 |
|개발 기간| 2개월| **2주** |


기존 프로토타입 서비스 개발에는 디자인과 기획의 변경 사항 대응과 서버 개발 등의 시간이 포함되어 있기 때문에 2달과 2주라는 시간 차이가 정확한 것은 아니다. 하지만 팀원 전체가 각각 네이티브 방식으로 개발할 때보다 훨씬 수월했다는 점에 동의했다. 사용성 확인을 위해 UI에 굉장히 집중한 프로토타입 서비스에서는 Flutter가 네이티브 방식보다 훨씬 빠르고 편하게 UI 구현할 수 있기 때문이다. 특히 Android 개발자의 만족도가 높았다.


Flutter로 개발할 때 개발 기간이 짧아진 이유는 Flutter에서 사용하는 [Dart](https://dart.dev/language) 언어의 어렵지 않은 문법과 Flutter의 선언형(declarative) [UI](https://flutter-ko.dev/get-started/flutter-for/declarative) 방식때문이다(선언형 UI 소개 참고). 선언형 UI 방식이 이해하기에 더 직관적이기 때문에 복잡한 UI를 작성할 때에는 선언형 UI 방식이 더 편하다고 생각한다. 프레임워크 입장에서도 위젯 트리를 구현하기가 훨씬 수월해지기 때문에 복잡한 UI를 구현하기 좋은 방식이다. [SwiftUI](https://developer.apple.com/kr/xcode/swiftui/)와 [Jetpack Compose](https://developer.android.com/jetpack/compose?hl=ko)도 선언형 UI 방식을 사용하는데, 앱의 디자인이 복잡해짐에 따라 선형형 UI 방식을 사용하는 방향으로 프레임워크가 수정되는 게 필연적이라고 생각한다.


다음은 2차 과제 마무리 후에 팀원들이 작성한 Flutter에 대한 피드백을 요약한 내용이다. 2019년 1월에 작성한 피드백이므로 그 이후 Flutter의 상황과는 다른 부분이 있다. 당시에 Flutter에 대해서 어떤 느낌을 받았는지 참고하는 정도로 보면 좋겠다.

|구분&nbsp; |내용&nbsp;|
| :--- |:---|
|학습비용| Dart 언어 자체는 사용하는 언어와 큰 차이가 없어서 학습 비용이 낮다. <br> 좀 더 효율적인 코드 스타일을 위해서는 컨벤션 등에서 시행 착오가 필요할 것 같다.<br> Java와 Kotlin을 주 언어로 사용한 개발자 입장에서 Dart 언어 자체는 기존에 사용하는 언어와 큰 차이가 없어 학습 비용이 낮은 편에 속하는 것 같다. <br> 위젯의 조합으로 UI를 구현한다는 개념이 iOS 개발자에게는 조금 생소할 수 있으나 금방 적응된다.|
|가속성|뷰(view)를 그리는 코드를 작성할 때 '( )'와 '{ }'를 중첩해서 사용하기 때문에 보기가 불편하다. Android Studio의 닫는 괄호 표시 기능으로 보완이 되지만 깊이가 깊어질수록 보기 불편한 것은 여전하다.<br> private을 설정할 때 밑줄(_)을 접두어로 붙이는 것이 불편하다.<br> Android에서 XML로 뷰를 그리는 방법과 코드를 짜서 뷰를 그리는 방법 중 코드를 짜서 뷰를 그리는 느낌과 비슷하다. XML에서 뷰의 시작과 끝을 알 수 있듯이 Flutter를 사용할 때에도 Android Studio에서 위젯의 시작과 끝을 자동으로 알려주는 부분이 있어 가독성이 좋았다. 어느 뷰던 깊이가 깊어지면 복잡해지는데 그걸 위젯별로 나눠서 가독성을 높여 주는 방법이 있다. <br> IDE에서 가독성을 높여 주는 여러 리팩터링 기능을 제공한다.|
|서드파티|Flutter에서 제공하는 라이브러리 자체는 사용하기 수월했다.<br> 사내 라이브러리를 아직 사용할 수 없다는 점이 아쉬웠다.|
|커뮤니티 활성도|공식 문서가 굉장히 깔끔하게 정리되어 있어서 기본 사용법를 익히기에 무리가 없다.<br> [Medium](https://medium.com/) 등에 내부 구조나 특징 등을 설명한 글이 많이 있다.<br> 커스텀 뷰를 제작하다가 막히는 부분에 대해 Stack Overflow에도 글이 제법 있다. 하지만 그 양이 많다고는 할 수 없다.|
|개발도구 사용성|기존 Android 개발자라면 Android Studio를 사용할 수 있기 때문에 좋다.<br> iOS 개발자라면 Xcode와 다른 점이 있어서 좀 불편했다.<br> Android 개발자로서 늘 쓰던 Android Studio를 사용할 수 있기 때문에 큰 어려움이 없었다.<br> Visual Studio Code를 사용했다.<br> 디버깅, 리팩터링, 가독성 향상 등의 유용한 기능이 기본으로 탑재되어 있어서 편리하게 작업할 수 있었다.|
|디버거|레이아웃에서 오류가 발생할 경우 Simulator가 크래시 대신 해당 오류를 보여주기 때문에 오류를 파악하기가 쉬웠다.<br> Android Studio에서 제공하는 중단점(breakpoint)을 사용해도 된다. 데이터의 경우에는 print 구문을 활용해서 많이 확인했다.<br> React Native도 개발했던 경험이 있던 개발자로선 React Native 디버거와 비교했을 때 정말 사용하기 편하다고 볼 수 있다. 기존 Android 개발 환경과 디버거는 동일하다.|
|컴파일 속도| Swift 파일이 많은 Xcode보다 빌드가 빠르다고 느꼈다. 특히, UI 작업을 할 때 재빌드 없이 코드가 바로 반영되는 hot-reload 기능은 정말 편했다.|
|런타임 속도|직접 뷰를 그리기 때문에 속도는 문제가 없었다. iOS, Android 양쪽 다 부드럽게 실행되었다.|
|안정성|크래시가 발생할 때 앱이 종료되지 않고 크래시가 발생하는 화면에만 빨간색 오류 화면이 나타나도록 되어 있다. 이에 따라 어느 화면에서 오류가 발생했는지 알 수 있지만 정확히 어떠한 부분으로 인해 오류가 발생했는지는 빠르게 파악할 수 없다(개인적인 문제이다).<br> Flutter 프레임워크 자체는 안정적이나, Flutter가 제공하는 라이브러리(카메라, 지도, 동영상 등)의 안정성이 아직 많이 떨어진다.|
|호환성|아직 평가 불가|
|로컬라이징|자체적으로 클래스를 개발해서 사용했다.|
|테스트 용이성|유닛 테스트, 위젯 테스트, 융합 테스트(intergation test) 3단계로 나눠서 테스트할 수 있게 되어 있어서 괜찮았다.|


</details>


* * *
## 개발환경설정

### Flutter SDK 설치 및 설정

Flutter 홈페이지 다운로드 : [https://docs.flutter.dev/get-started/install](https://docs.flutter.dev/get-started/install)

+ 각 운영체제에 맞춰, 설명대로 설치하시면 됩니다

### VSCode 설치

Visual Studio Code 홈페이지 다운로드 : [https://code.visualstudio.com/](https://code.visualstudio.com/)


+ VS Code 실행 후 왼쪽에 있는 블록 모양의 'Extension' 버튼을 클릭한다
+ Flutter 입력 후 체크 표시가 있는 Flutter를 클릭해 설치한다.
  + 'Flutter' 확장을 설치하는 동안 오류가 발생했습니다. 자세한 내용은 로그를 확인하세요
    + **해결 : Visual Studio Code 종료 후 재 실행 하면 해결**
+ Flutter 설치가 완료되면 '사용 안함' 으로 바뀐다
+ Ctrl + Shift + P 키를 동시에 눌러 커맨드 창을 켜고 'Flutter'를 입력한다
+ Flutter를 입력하고 'Flutter: Run Flutter Doctor'를 클릭해, 프로젝트 실행 전에 Check 한다
+ VS Code 아래에 출력창이 열리면서 Flutter의 설치 상태를 알려주는 doctor tool이 실행 된다
+ 체크표시는 정상 설치가 된 부분이고 느낌표(!)는 추가적인 조치가 필요한 항목이다
  + To resolve this, 부분에 'flutter doctor --android-licenses'를 실행 하라고 나와있다
  + Android toolchain, 터미널에서 'flutter doctor --android-licenses' 입력 후 실행
  + 'flutter doctor --android-licenses' 입력 후 엔터치면 동의 문구가 나오는데 y를 모두 입력한다
  + 위의 과정을 거치면 느낌표 였었던 부분이 체크표시로 바뀐 것을 확인 할 수 있다 

~~~ sh
>flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel master, 3.1.0-0.0.pre.1430, on macOS 14.2.1 23C71 darwin-x64, locale ko-KR)
[✓] Android toolchain - develop for Android devices (Android SDK version 33.0.0)
[✗] Xcode - develop for iOS and macOS
    ✗ Xcode installation is incomplete; a full installation is necessary for iOS development.
      Download at: https://developer.apple.com/xcode/download/
      Or install Xcode via the App Store.
      Once installed, run:
        sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
        sudo xcodebuild -runFirstLaunch
    ✗ CocoaPods not installed.
        CocoaPods is used to retrieve the iOS and macOS platform side's plugin code that responds to your plugin usage on the Dart side.
        Without CocoaPods, plugins will not work on iOS or macOS.
        For more info, see https://flutter.dev/platform-plugins
      To install see https://guides.cocoapods.org/using/getting-started.html#installation for instructions.
[✓] Chrome - develop for the web
[!] Android Studio (not installed)
[✓] VS Code (version 1.87.2)
~~~

*MacOS 상에서 🔼 위의 경우, 아래와 같이 <span style="color:green"> **해결** </span>
- " 응용프로그램 > 안드로이드 스튜디오 > 콘텐츠 " 폴더에 들어가셔서 jre 폴더를 새로 만듭니다.
- jbr 폴더 안에 있는 'Contents' 폴더를 --->> 새로만든 jre 폴더에 복사합니다.

~~~ sh
>flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel master, 3.1.0-0.0.pre.1430, on macOS 14.2.1 23C71 darwin-x64,
    locale ko-KR)
[✓] Android toolchain - develop for Android devices (Android SDK version 34.0.0)
[✓] Xcode - develop for iOS and macOS (Xcode 15.3)
[✓] Chrome - develop for the web
[✓] Android Studio (version 2023.2)
[✓] VS Code (version 1.87.2)
[✓] Connected device (2 available)
[✓] HTTP Host Availability
~~~


### VSCode Flutter 프로젝트 생성하기

+ Ctrl + Shift + P 키를 눌러 커맨드차아에 Flutter를 입력 후, New Project  부분을 클릭한다.
+ Flutter 개발을 위한 'Application' 을 클릭한다.
+ Flutter 프로젝트를 저장할 폴더를 생성한다.
+ 저장할 폴더 위치를 지정하면 Project Name 타입, 프로젝트 이름을 설정할 수 있다.
+ 프로젝트명 입력을 하면, 기본코드와 함께 Flutter 프로젝트가 생성된다.



### VSCode Flutter 프로젝트 실행하기
+ 샘플 코드에서 'F5' 단축키를 누르거나 왼쪽 ▶버튼을 클릭해 프로젝트를 실행한다.
+ 왼쪽에 ▶버튼을 클릭 후 '실행 및 디버그' 버튼을 누르면 프로젝트가 실행된다.
+ Flutter 샘플 코드가 '크롬'으로 실행된다.


### VSCode Flutter 애뮬레이터로 실행하기

+ VSCode에서 Ctrl + Shift + P 단축키를 누른 후 'Emulator'를 입력 후 클릭한다.
  + **실제로는 '안드로이드 스튜디오(Android Studio) 애뮬레이터 가상 디바이스 설치' 가 필요하고, 안드로이드 스튜디오에 있는 애뮬레이터로 디버깅 하는 형태이다.** ( <span style="color:red" >***안드로이드 스튜디오가 필요** </span>)
    
+ 안드로이드 스튜디오에서 설치한 AVD가 연동이 되어 실행할 애뮬레이터를 선택할 수 있다.  
  + 안드로이드 스튜디오 Virtual Device 화면 확인+
+ AVD를 선택하면 VSCode 에서 애뮬레이터로 실행할 수 있게 된다.
+ **F5 단축키를 눌러 프로젝트를 실행시킨다.**

추가)참고 : [https://hileejaeho.cafe24.com/docs/flutter/vscode%EC%97%90%EC%84%9C-emulator%EB%A1%9C-%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0/](https://hileejaeho.cafe24.com/docs/flutter/vscode%EC%97%90%EC%84%9C-emulator%EB%A1%9C-%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0/)

* * *
## Flutter를 이용한 app 기획 1

* * *
## app 세부구성(1)

* * *
## app 기능구현(1)

* * *
## Flutter를 이용한 app 기획 2

* * *
## app 세부구성(2)


* * *
## app 기능구현(2)

[Flutter HTML 편집기](https://flutter.ducafecat.com/ko/pubs/html_editor-package-info)는 Summernote JavaScript 래퍼를 기반으로 안드로이드와 iOS용 텍스트 편집기로 WYSIWYG HTML 코드 작성을 지원합니다.

* * *
## DB 만들기

* * *
## 마켓플레이스에 올려보기



* * *
### Reference 
- [https://brunch.co.kr/@tilltue/56](https://brunch.co.kr/@tilltue/56)
  - *Retrieve:* Exploring this resource for insights
- [https://d2.naver.com/helloworld/3384599](https://d2.naver.com/helloworld/3384599)
  - *Retrieve:* Exploring this resource for insights
- [플러터 설계 컨셉](https://velog.io/@stone1098/%ED%94%8C%EB%9F%AC%ED%84%B0%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90)
  - *Retrieve:* Exploring this resource for insights
- [MacOS Flutter 설치하기](https://msyu1207.tistory.com/entry/Mac%EC%97%90%EC%84%9C-Flutter-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0feat-android-studio-xcode)
- [MD 이모티콘](https://kr.piliapp.com/twitter-symbols/)
