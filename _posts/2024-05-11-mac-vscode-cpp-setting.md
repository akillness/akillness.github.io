---
title: 맥북 M1/M2/M3 VSCODE C++ 설정
description: Setting, Macbook, M2, VSCode
categories: [Setting, CPP]
tags: [Setting, VCCode, C++]
author: foDev_jeong
date: 2024-05-11 16:30:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


# [MacOS / AppleSilicon] VSCODE C++ 설정 환경 설정 개발환경 세팅 AppleSilicon

> **Reference** <https://polarcompass.tistory.com/12>
{: .prompt-info }


1. VSCODE 다운로드 - mac OS 환경 및 M1/M2/M3 이라면 Apple Silicon 버전 다운로드.

    > 직접 다운로드 <https://code.visualstudio.com/#alt-downloads>
    
    Visual Studio Code - Code Editing. Redefined Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.  Visual Studio Code is free and available on your favorite platform - Linux, macOS, and Windows.code.visualstudio.com
    
    > brew 설치법 링크 <https://polarcompass.tistory.com/140?category=514165>

2. C++ extension 설치 - 
   - 검색창에 'c++' 검색 
   - C++ extension 설치
3. Clang 설치 확인
   - clang이 설치되어 있나 확인한다.
   - 터미널 창에 아래 내용을 입력.
   - $ clang --version
   - 만약, 설치되어 있지 않으면 아래 코드를 입력 혹은
   - $ xcode-select --install
   - Appstore 에서 xcode를 설치해 준다.
   - 보통은 xcode를 설치하면 해결됨.
4. C++을 실행할 폴더 생성하기
   1. 폴더 이름은 'projects', 'hello_world', 'cpp' 등등 본인이 원하는 이름으로 생성한다.
      1. * 처음 셋팅한 이 폴더에서 앞으로 계속 작업을 할것이므로 원하는 이름을 적도록한다.
   2. 앞으로의 설정 다음 세개의 파일을 셋팅하는 것을 목표로 한다.
      1.  tasks.json  - complier build settings
      2.  launch.json - debugger settings
      3.  c_cpp_properties.json  - complier path and IntelliSense settings
   3.  이후에 새로운 폴더를 생성하면 위의 세개 파일을 복사해서 붙여넣으면 동일한 세팅값으로 개발이 가능하다.
   4.  파일 하나를 생성한다.
   5.  파일제목.cpp 생성
   6.  testfile.cpp로 파일 하나 만들어 준 후 아래 코드를 복붙한다.

~~~cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main()
{
    vector<string> msg {"Hello", "C++", "World", "from", "VS Code", "and the C++ extension!"};

    for (const string& word : msg)
    {
        cout << word << " ";
    }
    cout << endl;
}
~~~
 
   7. Ctrl + S 로 저장한다.

5. Build testfile.cpp
   1. 이제 tasks.json 파일을 생성 후 testfile.cpp를 build 할 것이다.
   2. 우선 Terminal > Configure Default Build Task 로 들어가 준다.
   3. (터미널 > 기본 빌드 작업 구성...)
   4. C/C++ clang++ build active file 선택해 준다.
   5. tasks.json 가 생성되면 아래 코드를 복붙한다.

~~~sh
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "type": "shell",
      "label": "clang++ build active file",
      "command": "/usr/bin/clang++",
      "args": [
        "-std=c++17",
        "-stdlib=libc++",
        "-g",
        "${workspaceFolder}/*.cpp",
        "-o",
        "${fileDirname}/${fileBasenameNoExtension}"
      ],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "problemMatcher": ["$gcc"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
~~~

1. Running testfile.cpp

이제 testfile.cpp 파일로 돌아와서 Cmd+Shift+B  파일을 build 해준다.

7. CodeLLDB 디버깅 Extension 파일 설치


CodeLLDB
8. Debug testfile.cpp

다음은 launch.json 을 만들어준다. Fn + F5 눌러 debug를 실행해준다.

혹은 메인 메뉴에서 Run > Add Configuration...을 선택 후 

C++ (GDB/LLDB) 선택

그 다음 다음과 같은 선택지를 보게 된다.


그 후  launch.json 파일이 생성 된 후 아래와 같은 코드 복붙한다.

~~~sh
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "clang++ - Build and debug active file",
      "type": "lldb",
      "request": "launch",
      "program": "${fileDirname}/${fileBasenameNoExtension}",
      "args": [],
      "stopAtEntry": true,
      "cwd": "${workspaceFolder}",
      "environment": [],
      "externalConsole": false,
      "MIMode": "lldb",
      "preLaunchTask": "clang++ build active file"
    }
  ]
}
~~~
 

※ 주의점
tasks.json 의 label 부분과

"label": "clang++ build active file",

launch.json의 preLaunchTask 부분 이름이 같아야 한다.

"preLaunchTask": "clang++ build active file"

한글로 되어있을 경우엔 되도록 영어로 바꿔 주도록 한다.

9. C/C++ configuration 세팅

c_cpp_properties.json 파일 세팅 해준다.

Ctrl+Shift+P 단축키로 Command Palette 열어준다.

C/C++:Edit Configurations (UI) 로 UI 형태로 세팅하거나

C/C++:Edit Configurations (JSON) 으로 아래 코드를 복붙 해준다.

~~~sh
{
  "configurations": [
    {
      "name": "Mac",
      "includePath": ["${workspaceFolder}/**"],
      "defines": [],
      "macFrameworkPath": [
        "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks"
      ],
      "compilerPath": "/usr/bin/clang",
      "cStandard": "c11",
      "cppStandard": "c++17",
      "intelliSenseMode": "clang-x64"
    }
  ],
  "version": 4
}
~~~
