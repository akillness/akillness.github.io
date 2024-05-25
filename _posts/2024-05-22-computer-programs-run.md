---
title: How do computer programs run
description: Graph, Analytics
categories: [Blogging, Data Pipeline]
tags: [Data Pipeline, Process, Computer]
# author: foDev_jeong
date: 2024-05-22 13:22:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## How do computer programs run? 

The diagram shows the steps. 
 
### 🔹 User interaction and command initiation 
By double-clicking a program, a user is instructing the operating system to launch an application via the graphical user interface. 
 
### 🔹 Program Preloading 
Once the execution request has been initiated, the operating system first retrieves the program's executable file. 
 
The operating system locates this file through the file system and loads it into memory in preparation for execution. 
 
### 🔹 Dependency resolution and loading 
Most modern applications rely on a number of shared libraries, such as dynamic link libraries (DLLs). 
 
### 🔹 Allocating memory space 
The operating system is responsible for allocating space in memory. 
 
### 🔹 Initializing the Runtime Environment 
After allocating memory, the operating system and execution environment (e.g., Java's JVM or the .NET Framework) will initialize various resources needed to run the program. 
 
### 🔹 System Calls and Resource Management 
The entry point of a program (usually a function named `main`) is called to begin execution of the code written by the programmer. 
 
### 🔹 Von Neumann Architecture 
In the Von Neumann architecture, the CPU executes instructions stored in memory. 
 
### 🔹 Program termination 
Eventually, when the program has completed its task, or the user actively terminates the application, the program will begin a cleanup phase. This includes closing open file descriptors, freeing up network resources, and returning memory to the system. 



![ How Computer Programs Run ](/assets/img/blog/How_computer_programs_run.gif){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 컴퓨터 프로그램은 어떻게 실행될까요?

다이어그램은 단계를 보여줍니다. 
 
### 🔹 사용자 상호 작용 및 명령 시작 
프로그램을 두 번 클릭하면 사용자가 그래픽 사용자 인터페이스를 통해 응용 프로그램을 시작하도록 운영 체제에 지시할 수 있습니다. 
 
### 🔹 프로그램 사전 로딩 
실행 요청이 시작되면 운영 체제는 먼저 프로그램의 실행 파일을 검색합니다. 
 
운영 체제는 파일 시스템을 통해 이 파일을 찾아 실행을 준비하기 위해 메모리에 로드합니다. 
 
### 🔹 종속성 해결 및 로드Dependency resolution and loading 
대부분의 최신 응용 프로그램은 DLL(동적 연결 라이브러리)과 같은 여러 공유 라이브러리에 의존합니다. 
 
### 🔹 메모리 공간 할당 
운영 체제는 메모리 공간 할당을 담당합니다. 
 
### 🔹 런타임 환경 초기화 
메모리를 할당한 후 운영 체제 및 실행 환경(예: Java의 JVM 또는 .NET Framework)은 프로그램을 실행하는 데 필요한 다양한 리소스를 초기화합니다. 
 
### 🔹 시스템 호출 및 리소스 관리 
프로그램의 진입점(일반적으로 'main'이라는 함수)은 프로그래머가 작성한 코드의 실행을 시작하기 위해 호출됩니다. 
 
### 🔹 폰 노이만 아키텍처 
Von Neumann 아키텍처에서 CPU는 메모리에 저장된 명령을 실행합니다. 
 
### 🔹 프로그램 종료 
결국 프로그램이 작업을 완료하거나 사용자가 응용 프로그램을 적극적으로 종료하면 프로그램은 정리 단계를 시작합니다. 여기에는 열려 있는 파일 디스크립터를 닫고, 네트워크 리소스를 확보하고, 메모리를 시스템에 반환하는 것이 포함됩니다. 

</details>