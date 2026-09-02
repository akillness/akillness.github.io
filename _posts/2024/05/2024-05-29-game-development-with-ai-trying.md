---
title: "Hugging Face's AI Game Development Course, Audited in 2026"
description: "The free ML for Games course stopped shipping units in 2024, it offers no certificate, and four tools it teaches have been renamed, rebranded or abandoned. What still holds up."
categories: [Learning/Guide]
tags: [Learning, Guide, Lecture]
date: 2024-05-29 23:13:00 +0800
image:
  path: /assets/img/blog/ML_for_Games.jpeg
  width: 1920
  height: 1080
  alt: "Four-panel ML for Games course collage: the course title card, the Jammo robot answering 'Show me how you can dance!', a burger-shop scene, and an isometric voxel interior"
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
---

## 🤔 Curiosity: does the free course still teach the field?

Search for an AI game development course and you land on the free track this page has recommended since 2024: Hugging Face's **ML for Games**. Two years later the honest question is not whether the course is good, but whether it still describes the field a game developer is about to enter.

So I audited it against two things: its own repository, and the field's own map of what LLMs can do in games. Short answer up front: still worth reading as a concept map, no longer safe to follow as build steps.

> **Update (2026-09-02).** This page previously reproduced the course's demo-validation criteria. Those criteria were live on the course page as late as 2024-05-26, as captured by the Internet Archive, and have since been removed; the course now states that it provides no Certificate of Completion. The audit below replaces them.
{: .prompt-warning }

*Originally published 2024-05-29. Re-audited and rewritten on 2026-09-02.*

## 📚 Retrieve: what the course actually is now

### Finding 1 — It is finished, and it says so

The course syllabus states plainly that it "is now **self-paced and will not have new future units**" and that "we **don't provide a Certificate of Completion for this course**."

What shipped is four numbered units and two extras, 40 sections, plus a seventh entry whose single section exists only to announce that nothing further is coming:

| Entry | Sections | What it covers |
|---|---:|---|
| Unit 0. Welcome to the course | 8 | Setup, syllabus, prerequisites |
| Unit 1. Smart Robot NPC with Unity Sentis | 7 | On-device sentence similarity driving an NPC |
| Defining my Demo Part 1 | 5 | Finding the idea, writing a GDD |
| Bonus 1. Classical AI in Video Games | 7 | Pre-LLM game AI, taught for both Unity and Unreal |
| Unit 2. AI Tools for Game Developers | 9 | Code, music, voice, animation, texture, 2D art, SFX |
| Unit 3. LLM-powered NPC with Gigax and Cubzh | 4 | Generative NPC dialogue in a hosted world |

Two structural tells that the plan stopped mid-flight: the demo unit is labelled "Part 1" with no Part 2, and there is a whole entry whose only job is to announce that nothing further is coming.

The repository looks alive and is not. Its last content commit is **2024-11-20**; every 2026 commit is chore work, pinning GitHub Actions and bumping a doc-builder SHA. That is roughly 21 months of editorial staleness behind a green-looking repo.

Engine coverage is narrower than the course intended, but not as narrow as it first looks. The AI units are Unity-centric: Unit 1 runs on Unity Sentis and Unit 3 runs inside a hosted world. The classical-AI bonus is the exception and treats the two engines as co-equal paths, telling readers they will "learn to implement these with Unreal or Unity" and giving Unreal its own page of engine documentation covering nav meshes, behaviour trees, state trees, EQS, perception, MassEntity and smart objects.

The gap is Godot. The course states that "for now, all our content uses the Unity Game Engine" and that "in the future, we will add content about Unreal Engine, Godot, and more." **No Godot content ever shipped** — the word appears exactly once in the entire course, inside that promise.

![Course prerequisites slide listing a computer, a free Hugging Face account, and a free game engine licence for either Unity or Unreal](/assets/img/blog/ML_for_Games_tools.jpeg){: .shadow .rounded-10 w='1920' h='1080' }
_The course's own prerequisites slide. Its engine card says "Either Unity or Unreal" — the AI units went Unity-first anyway, and Godot never arrived._

### Finding 2 — Four of the tools it teaches have moved

This is the part that will actually cost a learner an afternoon, because the instructions still read correctly while the ecosystem underneath them renamed itself.

| Taught as | Status on 2026-09-02 | What it means for the learner |
|---|---|---|
| Unity **Sentis** (Unit 1) | Renamed. The package docs say "Sentis is now called Inference Engine", and the package is now `com.unity.ai.inference` | Following Unit 1 verbatim searches for a product name that no longer exists |
| **Cubzh** (Unit 3) | Rebranded to **Blip**, now `bliporg/blip`, Apache-2.0, pushed 2026-03-09 | The world platform is alive under a different name |
| **Gigax** (Unit 3) | Dormant, last push 2024-07-26, no licence file | The LLM-NPC engine of the final unit has not moved in two years, and carries no grant of rights |
| **Coqui** XTTS (Unit 2) | Vendor gone: `coqui.ai` returns 404. The `coqui-ai/TTS` repository survives at ~46k stars, last push 2024-08-16 | The voice section points at a company that no longer exists |

None of this makes the course worthless. It does mean the correct way to use it in 2026 is as a **concept map**, not as a copy-paste tutorial.

### Finding 3 — Against the field's own map, it covers two roles of nine, and part of a third

The reference survey this page has always linked, [*Large Language Models and Games: A Survey and Roadmap*](https://arxiv.org/abs/2402.18659) by Gallotta, Todd, Zammit, Earle, Liapis, Togelius and Yannakakis (IEEE Transactions on Games, 2024, v5 December 2024), enumerates nine distinct roles an LLM can take in a game. Mapping the course onto that taxonomy is my own reading, not the course's claim:

| Role in the survey | Covered by the course? |
|---|---|
| Non-Player Characters | **Yes** — Unit 1 for intent matching, Unit 3 for generative dialogue |
| Design Assistant | **Yes** — Unit 2's Code Assistants and asset tools |
| Player | No |
| Player Assistant | No |
| Commentator/Reteller | No |
| Analyst | No |
| Game Master | No |
| Game Mechanic | No |
| Automated Designer | **Partial** — Unit 2 generates visuals and audio, but as standalone assets, not content constrained by playability |

So: two roles clearly, one partially, six not at all. That is a fair result for a beginner track. The course does print its scope — the syllabus has "What this course covers" and "What this course does not cover" sections, and says plainly that it is "not an introduction to game development" and "not an introduction to Machine Learning or AI." But it draws that boundary against prerequisites, not against what an LLM can do in a game. The nine-role view is the one I found missing. If your interest is an LLM that runs the encounter, reads the telemetry, or generates the level rather than the barks, this course is not about that.

### Finding 4 — The survey names the failures the course never teaches you to handle

Three limitations from the survey's own limitations section land directly on anyone shipping a talking NPC:

- **Grounding.** "LLMs lack grounding, so the text they generate is detached from constraints of reality." In a game that becomes NPCs which "may hallucinate quests that do not exist in the game."
- **Intent.** "LLMs sometimes struggle to capture user intent. This is especially evident with expressions of sarcasm" — which is most of what players type.
- **Memory.** "The 'memory' of an LLM is constrained by its context size… The longer the conversation, the less likely it is that the LLM will recall early events."

The course teaches you to make an NPC talk. It does not teach you to stop it inventing a quest, to survive a sarcastic player, or to keep a character consistent across a 40-hour campaign. Those are the parts that decide whether the feature ships.

### Finding 5 — Attention moved to agents, and the numbers are not close

Hugging Face now runs twelve learn tracks. The one that grew most is the agents course, created 2025-01-16 and still being pushed in 2026, at roughly **32,000 GitHub stars** — about five times the next-largest track and some 280 times the games course's **114**. Whatever else that gap measures, it says where the maintained teaching material is.

That is not a detour from game AI. An NPC that plans, remembers, uses tools and stays in character is an agent problem wearing a costume, and the constraint engineering I keep finding in agent harnesses, such as the machine-checked teaching contracts in the [OpenMAIC audit](/posts/openmaic-pedagogy-as-code-audit/), transfers more directly to shipping an NPC than another asset-generation tutorial does.

## 🎮 The classical-AI counterweight

The course's most durable unit is the one with no LLMs in it. Before reaching for a model, it is worth watching how far hand-authored systems get, because a great deal of perceived game intelligence is choreography rather than cognition.

Article: [The AI of Dark Souls](https://www.aiandgames.com/p/the-ai-of-dark-souls) — AI and Games #75

{% include embed/youtube.html id='PrHKzKQdZxY' %}

Prepare to Die by Simple AI, on difficulty as a design signal:

{% include embed/youtube.html id='s2S8o3fmJyc' %}

The Secret Reward Systems of Dark Souls II:

{% include embed/youtube.html id='4ke8D_FgAj0' %}

## 💡 Innovation: how I would use this course in 2026

**Take it for the map, not the build steps.** Read Units 0 to 3 for the shape of the problem, then implement against current package names. Unit 1's idea survives; its `Sentis` references do not.

**Fill the gaps yourself, deliberately.** The course leaves out training and fine-tuning, inference budgeting, guardrails, evaluation, prompt versioning, and telemetry. Those are not advanced extras. They are the difference between a demo and a feature.

**Budget the runtime before the prompt.** A talking NPC has a per-frame cost like any other system. My audit of [Neural Parametric Gaussian Avatars](/posts/npga-paper/) makes the same point on the rendering side: a single expressive character can consume the entire frame budget, and per-identity cost decides whether a cast is possible at all.

**Write the failure list first.** Take the survey's three limitations and turn them into acceptance tests before writing dialogue prompts: can the NPC be made to promise a quest that does not exist, can it be derailed by sarcasm, does it contradict itself after an hour.

**Do not chase the certificate.** There isn't one, and the demo-validation criteria are gone too. Build a small, reviewable artifact anyway, because the portfolio outcome now has to come from you.

## 🎯 Key Takeaways

- The course is **formally finished**: self-paced, no future units, no certificate, content frozen since **2024-11-20** behind a repository whose 2026 commits are chores.
- **Unity-centric, not Unity-only.** Unit 1 is Unity Sentis, Unit 3 runs in Cubzh with Lua, and the classical-AI bonus covers Unreal as a co-equal path. The promised Godot content never shipped.
- **Four taught dependencies have drifted:** Sentis is now Inference Engine, Cubzh is now Blip, Coqui's vendor is gone, and Gigax has not moved since July 2024 and carries no licence.
- Against the survey's nine LLM roles, the course covers **two clearly** (NPC, design assistant) and **one partially** (automated designer, as asset generation).
- It teaches you to make an NPC talk, not to handle grounding, sarcasm, or context loss, which the survey names as the field's live failure modes.
- Maintained attention has shifted to the agents track, roughly 32,000 stars against 114.

## 🤔 New Questions

- Is any current free course covering the other seven roles, particularly Game Master and Analyst, or is that material only in papers?
- Would porting Unit 1 to `com.unity.ai.inference` and to Godot be a better contribution than writing another new tutorial?
- What would an evaluation unit even look like for a generative NPC, given that the survey's failures are qualitative?

## References

**The course**
- ML for Games course: <https://huggingface.co/learn/ml-games-course/unit0/introduction>
- Course repository: <https://github.com/huggingface/making-games-with-ai-course>
- Contributors: <https://huggingface.co/learn/ml-games-course/unit0/who-are-we>
- Demo criteria as archived on 2024-05-26: <https://web.archive.org/web/20240526035813/https://huggingface.co/learn/ml-games-course/unit0/game-demo>
- Hugging Face learn index: <https://huggingface.co/learn>

**The field's map**
- Large Language Models and Games: A Survey and Roadmap: <https://arxiv.org/abs/2402.18659>
- IEEE Transactions on Games entry: <https://doi.org/10.1109/TG.2024.3461510>

**Tools whose status changed**
- Unity Inference Engine, formerly Sentis: <https://docs.unity3d.com/Packages/com.unity.ai.inference@latest>
- Blip, formerly Cubzh: <https://github.com/bliporg/blip>
- Gigax: <https://github.com/GigaxGames/gigax>
- Coqui TTS: <https://github.com/coqui-ai/TTS>

**Author and community**
- Thomas Simonini: <https://huggingface.co/ThomasSimonini> · <https://www.youtube.com/c/ThomasSimonini>
- Hugging Face Discord: <https://discord.com/invite/hugging-face-879548962464493619>

**Further learning that is still maintained**
- AI Agents course: <https://huggingface.co/learn/agents-course/unit0/introduction>
- LLM course: <https://huggingface.co/learn/llm-course/chapter1/1>
- Audio course: <https://huggingface.co/learn/audio-course/chapter0/introduction>

> **Editorial method:** this audit was researched and drafted with AI assistance under an evidence-gated editorial process, then revised across independent review passes. Course facts are read from the live course pages and its GitHub repository on 2026-09-02, with one page checked against the Internet Archive, and survey quotations from arXiv:2402.18659v5.
{: .prompt-info }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > 한국어 요약 </summary>

허깅페이스의 **ML for Games** 코스는 2026년 현재 **공식적으로 종료**됐다. 강의 페이지가 직접 "self-paced이며 새 유닛은 없다", "수료증을 제공하지 않는다"고 밝히고 있고, 저장소의 마지막 콘텐츠 커밋은 **2024-11-20**이다. 2026년 커밋은 전부 CI·보안 잡무라 저장소만 보면 유지보수 중인 것처럼 보인다.

내용은 **Unity 중심**이지만 Unity 전용은 아니다. Unit 1은 Unity Sentis, Unit 3는 Cubzh와 Lua로 돌아가고, 클래식 AI 보너스는 Unity와 언리얼을 대등한 경로로 다루며 언리얼 전용 문서 페이지도 따로 있다. 다만 약속했던 **Godot은 끝내 없다** — 코스 전체에서 그 단어는 약속 문장에 딱 한 번 나온다. 그리고 가르치는 도구 **넷이 이동했다**. Unity **Sentis는 Inference Engine으로 개명**(`com.unity.ai.inference`), **Cubzh는 Blip으로 리브랜딩**, **Coqui는 회사 자체가 사라졌고**(coqui.ai 404), **Gigax는 2024-07-26 이후 정지 + 라이선스 없음**이다.

범위도 분명히 해둘 필요가 있다. IEEE ToG 서베이가 정리한 **LLM의 9가지 역할** 중 이 코스가 확실히 다루는 것은 **NPC와 디자인 보조 둘**이고, **자동 디자이너는 부분적**(에셋 생성에 한정)이다. 그리고 서베이가 지적한 실전 실패 요인(**환각으로 없는 퀘스트를 약속함, 빈정거림 해석 실패, 컨텍스트 한계로 초반 사건 망각**)은 코스에서 다루지 않는다. 2026년에는 이 코스를 **개념 지도로만 쓰고**, 런타임 예산·가드레일·평가·프롬프트 버전관리는 직접 채워야 한다.

</details>
