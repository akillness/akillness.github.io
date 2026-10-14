---
published: true
title: 맥북 M1/M2/M3 VSCODE C++ 설정
description: "Apple Silicon Mac에서 VS Code C++ 개발환경을 원본 문서 기준으로 바로잡기: Clang 확인, tasks.json·launch.json·c_cpp_properties.json 핵심값, x64 모드 오류, 그리고 원본 Tistory 가이드가 놓친 함정."
categories: [Development Tools/Productivity]
tags: [development tools, productivity, tools]
date: 2024-05-11 16:30:00 +0800
ads: false
restored_archive: "2026-10-12"
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
 

> ※ 주의점
tasks.json 의 label 부분과
"label": "clang++ build active file",
launch.json의 preLaunchTask 부분 이름이 같아야 한다.
"preLaunchTask": "clang++ build active file"
한글로 되어있을 경우엔 되도록 영어로 바꿔 주도록 한다.
{: .prompt-warning }

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
        "intelliSenseMode": "macos-clang-arm64"
      }
    }
  ],
  "version": 4
}
~~~

> **수정 기록 (2026-10-14):** 원본 가이드의 `"intelliSenseMode": "clang-x64"`는 Apple Silicon Mac에서 잘못된 값이다. VS Code 공식 문서(Using Clang in Visual Studio Code, 조회 2026-10-14) 기준 arm64 Mac의 IntelliSense 모드는 `macos-clang-arm64`이며, `compilerPath`는 `/usr/bin/clang`, `macFrameworkPath`는 `/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks`를 가리킨다. x64 모드를 쓰면 시스템 헤더 해석이 어긋나 자동완성·Go to Definition이 깨진다. (원본 파일의 마지막 코드펜스가 닫히지 않은 채 끝나 있던 것도 함께 봉합했다.)
{: .prompt-warning }

## 원본 가이드가 놓친 Apple Silicon 함정 3가지

원본 절차(위 1–9단계, 출처: [polarcompass.tistory.com/12](https://polarcompass.tistory.com/12))는 따라 하면 동작하지만, 아래 세 함정을 설명하지 않는다. 전부 VS Code 공식 문서의 Troubleshooting·설정 절에 핀을 박았다.

1. **Xcode를 깔았는데 `clang`이 없다는 오류.** App Store Xcode 설치와 Command Line Tools 설치는 별개다. `clang --version`으로 먼저 확인하고, 없으면 `xcode-select --install`을 실행한다. "보통은 Xcode를 설치하면 해결됨"이 아니라 CLT 경로(`/Library/Developer/CommandLineTools`)가 실체다.
2. **빌드는 되는데 F5 디버그가 안 먹는 경우.** `tasks.json`의 `label`과 `launch.json`의 `preLaunchTask` 문자열이 정확히 일치해야 한다(원본 ※ 주의점 유지). 한글 label은 매칭 실수를 부르므로 영어로 통일한다. 공식 문서의 `launch.json` 예시는 `"type": "cppdbg"`, `"MIMode": "lldb"`, `"preLaunchTask": "C/C++: clang++ build active file"` 형태이며, CodeLLDB 확장(`"type": "lldb"`) 방식과 혼용하면 안 된다.
3. **Catalina 이후 외부 콘솔 입력 불가 + C++98 기본값.** clang++ 기본 표준은 C++98이라 `vector<string> msg {...}` 초기화가 컴파일 에러를 낸다 — `--std=c++17` 플래그가 필수다. 외부 콘솔 입력 문제는 [vscode-cpptools#5079](https://github.com/microsoft/vscode-cpptools/issues/5079)로 추적 중인 기지 이슈이며, 공식 문서의 osascript 우회 task가 문서화되어 있다.

## Limitations

- 이 개정은 VS Code 공식 문서를 핀으로 삼은 정정이며, M1/M2/M3 실기에서의 재검증은 수행하지 않았다.
- 문서·버전 drift 가능: `compilerPath` 탐색 순서(PATH → Xcode 하드코딩 경로)와 `c_cpp_properties.json` 스키마는 확장 업데이트에 따라 바뀐다.
- 원본 Tistory 절차와의 차별점은 arm64 모드 정정과 함정 섹션뿐이다. 순수 복사물이 되지 않도록 출처를 명시한다.

## References

- Microsoft, Using Clang in Visual Studio Code — <https://code.visualstudio.com/docs/cpp/config-clang-mac>
- 원본 절차: polarcompass.tistory.com/12 — <https://polarcompass.tistory.com/12>
