---
title: "MacBook M1/M2/M3 VSCODE C++ Setup"
description: "1. VSCODE Download - If using mac OS with M1/M2/M3, download the Apple Silicon version."
categories: [Development Tools/Productivity]
tags: [Development Tools, Productivity, Tools]
date: 2024-05-11 16:30:00 +0800
---
# [MacOS / AppleSilicon] VSCODE C++ Configuration and Development Environment Setup AppleSilicon

> **Reference** <https://polarcompass.tistory.com/12>
{: .prompt-info }


1. VSCODE Download - If using mac OS with M1/M2/M3, download the Apple Silicon version.

    > Direct download <https://code.visualstudio.com/#alt-downloads>
    
    Visual Studio Code - Code Editing. Redefined Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.  Visual Studio Code is free and available on your favorite platform - Linux, macOS, and Windows.code.visualstudio.com
    
    > brew installation guide link <https://polarcompass.tistory.com/140?category=514165>

2. C++ extension installation - 
   - Search for 'c++' in the search bar 
   - Install C++ extension
3. Verify Clang Installation
   - Check if clang is installed.
   - Enter the following in the terminal window.
   - $ clang --version
   - If not installed, enter the code below or
   - $ xcode-select --install
   - Install xcode from the Appstore.
   - Usually installing xcode resolves the issue.
4. Create a Folder for Running C++
   1. Create the folder with any name you prefer, such as 'projects', 'hello_world', 'cpp', etc.
      1. * Since you will continue working in this initially configured folder, choose a name you prefer.
   2. The goal going forward is to configure the following three files.
      1.  tasks.json  - complier build settings
      2.  launch.json - debugger settings
      3.  c_cpp_properties.json  - complier path and IntelliSense settings
   3.  Later, if you create a new folder, you can copy and paste the three files above to develop with the same settings.
   4.  Create a file.
   5.  Create filename.cpp
   6.  Create a file named testfile.cpp, then copy and paste the code below.

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
 
   7. Save with Ctrl + S.

5. Build testfile.cpp
   1. Now we will create the tasks.json file and build testfile.cpp.
   2. First, go to Terminal > Configure Default Build Task.
   3. (Terminal > Configure Default Build Task...)
   4. Select C/C++ clang++ build active file.
   5. Once tasks.json is created, copy and paste the code below.

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

Now go back to the testfile.cpp file and build it with Cmd+Shift+B.

7. Install CodeLLDB Debugging Extension


CodeLLDB
8. Debug testfile.cpp

Next, create the launch.json file. Press Fn + F5 to run the debugger.

Or select Run > Add Configuration... from the main menu, then 

Select C++ (GDB/LLDB)

Then you will see the following options.


After the launch.json file is created, copy and paste the code below.

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
 

> ※ Important Note
The label part of tasks.json and
"label": "clang++ build active file",
the preLaunchTask part of launch.json must have the same name.
"preLaunchTask": "clang++ build active file"
If it is in Korean, change it to English whenever possible.
{: .prompt-warning }

9. C/C++ Configuration Setup

c_cpp_properties.json file.

Ctrl+Shift+P shortcut to open the Command Palette.

C/C++:Edit Configurations (UI)  to configure via UI, or

C/C++:Edit Configurations (JSON)  to copy and paste the code below.

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
