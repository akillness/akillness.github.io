---
title: Kakao API 관련해서 찾아본 내용
description: Kakao, Utility
categories: [Blogging, API, Kakao]
tags: [Utility, Kakao API]
# author: foDev_jeong
date: 2024-03-31 18:30:00 +0800
render_with_liquid: true
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

카카오API를 이용해서 챗봇만들기 한번 해볼까? 해서 찾아봤는데, 간단한 챗봇기능은 OpenChat에서 방장에게 기본 제공되는 기능이 있다. (인사, 스케쥴러) 이런 기능 말고 대화 봇이나 Chat GPT 같이 메신저 등 요구하는 봇을 만들려면 카카오 개발자 사이트를 통해서 개발이 가능하다. 하지만 여기까지만 알아볼 예정 ^^

## **별거? 아닌 이야기**

> **Note:** 항시 마인드 셋을 갖고, 새롭게 도전전하는 일에 대해 "왜?" 해야하는지 스스로의 동기가 필요합니다 :D
{: .prompt-info }

Kakao API 를 이용해 오픈챗 같은? 기능을 만들어 볼 수 있을까 하여, 몇가지 찾아본 내용을 정리해본다.

1. "오픈 챗봇"(방장봇) : Kakao API 를 이용하지 않아도, 오픈 톡방에 방장 권한만 있다면 아주 간단한 기능 (방문시 인사, 정해진 시간에 코맨트, 명령어에 따른 코맨트)은 모바일로도 충분히 가능
2. "앱연동 API" 기능 : 계속 업데이트 되어서 최근 정보를 잘 찾아봐야하지만 [카카오개발자](https://developers.kakao.com/) 사이트에 아이디를 등록하고 샘플 프로젝트를 찾아서 개발할 수 있음

위의 정보는 찾아보면서 업데이트 해야겠다


#### Liquid Codes

If you want to display the **Liquid** snippet, surround the liquid code with `{% raw %}` and `{% endraw %}`:

````markdown
{% raw %}
```liquid
{% if product.title contains 'Pack' %}
  This product's title contains the word Pack.
{% endif %}
```
{% endraw %}
````

{: .box-note}
(기록)무료 도메인을 제공하는 사이트 [neocities](https://neocities.org/)