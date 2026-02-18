---
title: "Research Notes on Kakao API"
description: "I wondered if I could make a chatbot using Kakao API, and found that basic chatbot functions are already provided to room admins in OpenChat (greeting..."
categories: [Development Tools/Productivity]
tags: [Development Tools, Productivity, Reference]
date: 2024-03-31 18:30:00 +0800
render_with_liquid: true
mermaid: true
---
I wondered if I could make a chatbot using Kakao API, and found that basic chatbot functions are already provided to room admins in OpenChat (greetings, scheduler). To create conversation bots or GPT-like messenger bots, you need to develop through the Kakao developer site. I'll stop here for now ^^

## **Not Much of a Story**

> **Note:** Always maintain your mindset, and you need your own motivation for why you should take on new challenges :D
{: .prompt-info }

I looked into whether I could create something like an OpenChat function using the Kakao API, and here is a summary of what I found.

1. "Open Chatbot" (Room Admin Bot): Without using Kakao API, if you have room admin privileges in an open chat room, very simple functions (greeting on entry, scheduled comments, command-triggered comments) are available on mobile
2. "App-linked API" function: It is continuously updated so you need to look for recent info, but you can register an ID on the [Kakao Developers](https://developers.kakao.com/) site and find sample projects to develop

I should update the above information as I find more


#### Liquid Codes

*Curiosity:* If you want to display the **Liquid** snippet, surround the liquid code with `{% raw %}` and `{% endraw %}`:



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
(Note) A site that provides free domains: [neocities](https://neocities.org/)
