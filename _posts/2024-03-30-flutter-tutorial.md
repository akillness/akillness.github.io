---
title: "Learning and Developing with Flutter -Beginner Level-"
description: "| Category&nbsp; | Schedule&nbsp; |Item&nbsp; | Notes&nbsp; |."
categories: [Development Tools/Productivity]
tags: [Development Tools, Productivity, Tools]
date: 2024-03-30 21:00:00 +0800
render_with_liquid: true
mermaid: true
---
> Through Task Planning, the focus is on acquiring overall prerequisite knowledge for Flutter usage and app development, and building a sense for app development. The goal of this Task is to share your knowledge related to Flutter development through self-directed learning and to elevate your skills to a level where you can freely modify, develop, and deploy code together.
{: .prompt-info}

* * *
### Task Planning for App Development with Flutter:

| Category&nbsp; | Schedule&nbsp; |Item&nbsp; | Notes&nbsp; | 
| :---:| :--- |:--- | :-- |
| Concepts |  | Understanding Flutter concepts and core components | Basics: Dart programming |
| Motivation |  | Why develop with Flutter | Case study: Naver Knowledge iN |
| Development |  | Development environment setup | - |
| Development |  | App planning with Flutter - 1 Building a clock | Simple app development |
| Development |  | App detailed design (1) | - |
| Development |  | App feature implementation (1) | - |
| Development |  | App planning with Flutter - 2 Building a blog | Simple web development |
| Development |  | App detailed design (2) | - |
| Development |  | App feature implementation (2) | - |
| Development |  | Building a database | - |
| Development |  | Publishing to the marketplace | - |



* * *
>⚠ The detailed content below is still being written.


* * *
## Understanding Flutter Concepts and Core Components

<details markdown="1">
<summary> Learn more about Flutter concepts and architecture </summary>

### Flutter Concepts
[Flutter](https://flutter-ko.dev/) is a framework developed by Google that enables developing mobile apps, web apps, and desktop apps from a single codebase. It was first released in May 2017, but Flutter version 1.0.0 was released in December 2018. While interest in Flutter is high, there is still a significant lack of information about applying it to production services domestically.

Additionally, Flutter allows you to quickly and efficiently develop high-quality user interfaces for mobile apps, web apps, and desktop apps.
Flutter supports cross-platform development targeting both Android and iOS from a single codebase. Flutter also uses hardware acceleration to deliver native-level performance and provides reusable widgets for building UIs. These widgets are rendered directly to the canvas, providing high performance and smooth animations.

Flutter uses Dart, a modern programming language, to write apps, and includes various libraries and tools that provide diverse UI components and features. Additionally, Flutter developers can use the Hot Reload feature to apply code changes in real-time and rapidly iterate on app development and testing.
 
For app developers, Flutter is a powerful tool that increases app development productivity and enables sharing and maintaining code. For users, it can be a useful choice for building apps that provide beautiful and rich experiences.

### Flutter Core Architecture

*Curiosity:* Flutter is written using Dart, a **single-threaded (single-trheaded)** language. A single thread can only perform one task at a time, which means a Flutter app can only perform one task at a time.



>However, this does not mean that a Flutter app cannot handle multiple tasks simultaneously.

+ How Dart handles processing
  + Long-running events are started first.
  + When waiting for something like HTTP requests or file reads, it goes to process other events.
  + A kind of listener is formed. This listener monitors the pending activity and notifies when the wait is over.
  + The object referencing this listener is returned to the main thread, and this object is the Future that we will learn about.
  + When that pending activity completes, the event loop sees this and executes the method related to that activity on the main thread to finish processing that slow event.

It may seem like a long process, but all we need to do is write code using Future.


``` dart
//  ReadaFile() is a method that takes a long time to process.
Future myFuture = ReadaFile();
// After calling this method to start reading the file, while receiving data from the file, 
// Dart goes to process other events.
```

Think of a Future as a box that is currently empty but will contain the requested data or an error at some point in the future. In other words, it is a mechanism where you move on to the next task without waiting for the result of the requested operation, and then receive the result when the task is completed.


Flutter uses an **event loop (event-loop)**.
Between when the app starts and when the app stops, numerous events will occur, such as users continuously tapping.

The app cannot predict when users will tap or in what order events will be triggered, and it must handle all these events with a single thread. That is why the app runs an event loop. It takes the oldest event from the event queue and processes it, repeating this process until the event queue is empty.

While the app is running (the user touching the phone screen, downloading something, etc.), the event loop keeps running, processing these events one at a time.


</details>

* * *

## Why Develop with Flutter
<details markdown="1">
<summary>Let's explore why Flutter was needed for app development through the Naver Knowledge iN development case study.</summary>


<!-- Insert content with one blank line below the summary -->
#### **Problems with Mobile App Development**
+ Limitations of implementing identical UIs
  +  Since mobile app platforms are divided into iOS and Android, even though spec discussions proceed together during the planning phase, separate development processes are required from the design phase onward. 
![Mobile Process](/assets/img/flutter/mobile_dev_process.png)
+ Developer imbalance issues in services
  +  Since each platform is developed separately, with development, testing, and deployment done per platform, a shortage of developers for one platform can make spec implementation impossible or cause deployment schedule delays. 
+ Development efficiency issues 
  + Knowledge sharing
    + Only individual platform communities are active
  + Unifying naming conventions
    + Difficulty in aligning conventions every time due to differences in preferred conventions per platform and development schedules
  + Library development
    + Requires separate library development personnel
    + Difficult to maintain consistently
    + Difficult to implement different specs per service as libraries

![Mobile Problems](/assets/img/flutter/mobile_dev_problem.png)

So, what about the need for cross-platform development?

#### **Perception of Cross-Platform Development**

![Cross platform thinking](/assets/img/flutter/cross_platform_survey.png)


+ Notable additional opinions
  + There are difficulties in recruiting and filling developer positions
  + Converting existing legacy projects to cross-platform, rather than new projects, would be more costly
  + Conversely, the cost would also be high when switching back from cross-platform to native as the user base grows

>We can see that while many drawbacks of traditional mobile app development can be significantly improved through the use of cross-platform, there are still aspects that make it difficult to adopt in development.

Most of the Naver Knowledge iN development team members, similar to the survey results above, had a skeptical view of cross-platform development. They started the review expecting that the runtime performance would be lower than natively developed apps. However, as the review progressed, they realized this was a misconception, and as of now (October 2021), Knowledge iN is being developed with Flutter.


#### **Cross-Platform Development Challenge**

From January 7 to January 14, 2019, over one week, 6 developers reviewed 4 cross-platform frameworks — [React Native](https://reactnative.dev/), [Xamarin](https://learn.microsoft.com/ko-kr/xamarin/), Flutter, and [SCADE](https://learn.microsoft.com/ko-kr/xamarin/) — based on performance and productivity. For the review, they used the iOS preliminary project from Boost Camp Season 3 as a reference, making the implementation of a box office app the first assignment. Through the box office app implementation, they tested basic UI and network operations.

| Category &nbsp; | Description &nbsp;|
| :---| :--- |
| Learning cost (learnability) | Can beginners learn it easily? |
| Readability | Is the development language or framework readable? |
| Third-party | Is it easy to use third-party libraries? |
| Community activity (community size) | Is it easy to find answers in communities like Stack Overflow when issues arise? |
| IDE usability (IDE support) | Is the IDE usability good? |
| Debugger | Does the debugger work well? Is debugging easy? |
| Compile speed | Is the compile speed much slower than existing iOS and Android development tools? |
| Runtime speed | Is the UI execution speed and animation execution speed slow? |
| Stability | Do crashes occur? |
| Compatibility | Can it be used alongside native code (Kotlin, Swift)? <br> Are there significant API differences between framework versions? |
| Localization | Is localization difficult? |
| Testability | Is it easy to do UI testing and unit testing? |


Based on the evaluation criteria, Flutter received the best assessment when comparing each platform. 

In particular, Flutter’s performance was much better than the team expected. The screen behavior showed performance that was nearly indistinguishable from native. As explained in the article comparing React Native, Flutter, and [Webview](https://developer.android.com/develop/ui/views/layout/webapps/webview?hl=ko) ([What’s Revolutionary about Flutter](https://hackernoon.com/whats-revolutionary-about-flutter-946915b09514)), Flutter renders UI directly to the Canvas without going through a Bridge, delivering performance beyond expectations.

 If 60fps performance can be achieved during screen rendering, the app behavior becomes smooth enough to provide good usability. Native, Flutter, and React Native all show performance close to 60fps ([Flutter vs React Native vs Native: Deep Performance Comparison reference](https://medium.com/swlh/flutter-vs-react-native-vs-native-deep-performance-comparison-990b90c11433)).

![Reactive and Flutter Performance](/assets/img/flutter/reactive_versus_flutter.png)


#### **First Test Results: Performance Ranking**
{: .box-note}
1. **Flutter**
2. React Native
3. Xamarin
4. SCADE



In the second test, a more challenging app was chosen as the assignment to verify how far implementation with Flutter could go. They decided to implement a prototype service that had been in development for about 2 months using Flutter, and 4 iOS developers and 3 Android developers conducted testing for about 2 weeks from January 16 to January 30, 2019. To test more features, they verified the implementation of libraries, Google Maps, WebView, custom UI, and more. As a result, they replicated in 2 weeks what 6 iOS developers and 6 Android developers had built over 2 months.

|| Traditional development | **Development with Flutter** |
|:---| :---:|:---:|
|Team size| iOS developers: 6 <br> Android developers: 6 | iOS developers: 3 <br> Android developers: 4 |
|Development period| 2 months| **2 weeks** |


The time difference of 2 months versus 2 weeks is not exact because the original prototype service development included time for responding to design and planning changes, server development, and more. However, the entire team agreed that it was much easier than developing natively on each platform. This is because Flutter can implement UI much faster and more conveniently than native approaches in prototype services that focus heavily on UI for usability verification. Android developers' satisfaction was particularly high.


The reason development time was shortened when developing with Flutter is due to the straightforward syntax of the [Dart](https://dart.dev/language) language used in Flutter and Flutter's declarative [UI](https://flutter-ko.dev/get-started/flutter-for/declarative) approach (see Introduction to Declarative UI). Since the declarative UI approach is more intuitive to understand, it is considered more convenient for writing complex UIs. From the framework's perspective as well, it makes implementing widget trees much easier, making it a good approach for implementing complex UIs. [SwiftUI](https://developer.apple.com/kr/xcode/swiftui/) and [Jetpack Compose](https://developer.android.com/jetpack/compose?hl=ko) also use the declarative UI approach, and as app designs become more complex, it seems inevitable that frameworks will move toward using the declarative UI approach.


The following is a summary of the feedback about Flutter written by team members after completing the second assignment. Since the feedback was written in January 2019, some aspects may differ from Flutter's current status. It would be helpful to reference this to understand how Flutter was perceived at that time.

|Category&nbsp; |Description&nbsp;|
| :--- |:---|
|Learning cost| The Dart language itself is not much different from the languages we use, so the learning cost is low. <br> For a more efficient code style, some trial and error with conventions may be needed.<br> From the perspective of developers who primarily use Java and Kotlin, the Dart language itself is not significantly different from the languages they currently use, so the learning cost seems to be on the lower side. <br> The concept of implementing UI through widget composition may be somewhat unfamiliar to iOS developers, but they adapt quickly.|
|Readability| When writing code to draw views, nesting '( )' and '{ }' makes it uncomfortable to read. Android Studio's closing bracket display feature helps compensate, but it still becomes uncomfortable to read as the nesting depth increases.<br> It is inconvenient to prefix with an underscore (_) when setting private.<br> It feels similar to drawing views by writing code rather than using XML in Android. Just as you can identify the start and end of views in XML, Android Studio also automatically indicates the start and end of widgets when using Flutter, which improved readability. Any view becomes complex as the depth increases, but there are methods to improve readability by splitting into separate widgets. <br> The IDE provides various refactoring features that improve readability.|
|Third-party| The libraries provided by Flutter themselves were easy to use.<br> It was disappointing that internal company libraries could not yet be used.|
|Community activity| The official documentation is very neatly organized, making it easy to learn the basics.<br> There are many articles on [Medium](https://medium.com/) and elsewhere explaining the internal structure and features.<br> There are quite a few posts on Stack Overflow about obstacles encountered when creating custom views. However, the volume cannot be considered large.|
|IDE usability| For existing Android developers, it is great because they can use Android Studio.<br> For iOS developers, there were differences from Xcode which was somewhat inconvenient.<br> As an Android developer, there was no difficulty since I could use the familiar Android Studio.<br> Used Visual Studio Code.<br> Useful features such as debugging, refactoring, and readability enhancement are built-in, making it convenient to work with.|
|Debugger| When errors occur in the layout, the Simulator shows the error instead of crashing, making it easy to identify errors.<br> You can also use breakpoints provided by Android Studio. For data, print statements were frequently used for verification.<br> As a developer with experience developing React Native, the Flutter debugger is really convenient compared to the React Native debugger. The debugger is identical to the existing Android development environment.|
|Compile speed| It felt faster to build than Xcode with many Swift files. In particular, the hot-reload feature that reflects code changes immediately without rebuilding during UI work was really convenient.|
|Runtime speed| Since it draws views directly, there were no speed issues. Both iOS and Android ran smoothly.|
|Stability| When a crash occurs, the app does not terminate but instead shows a red error screen only on the screen where the crash occurred. This allows you to know which screen the error occurred on, but you cannot quickly identify exactly what part caused the error (a personal issue).<br> The Flutter framework itself is stable, but the stability of Flutter's provided libraries (camera, maps, video, etc.) is still lacking.|
|Compatibility| Not yet evaluable|
|Localization| Developed and used a custom class internally.|
|Testability| It was good that testing could be done in 3 stages: unit tests, widget tests, and integration tests (intergation test).|


</details>


* * *
## Development Environment Setup

### Flutter SDK Installation and Setup

Flutter homepage download: [https://docs.flutter.dev/get-started/install](https://docs.flutter.dev/get-started/install)

+ Follow the instructions to install according to your operating system

### VSCode Installation

Visual Studio Code homepage download: [https://code.visualstudio.com/](https://code.visualstudio.com/)


+ After launching VS Code, click the block-shaped 'Extension' button on the left
+ Type Flutter and click on the Flutter with a checkmark to install it.
  + An error occurred while installing the 'Flutter' extension. Check the logs for details
    + **Solution: Close and restart Visual Studio Code to resolve**
+ When Flutter installation is complete, the button changes to 'Disable'
+ Press Ctrl + Shift + P simultaneously to open the command palette and type 'Flutter'
+ Type Flutter and click 'Flutter: Run Flutter Doctor' to check before running the project
+ An output window opens at the bottom of VS Code and the doctor tool that shows Flutter's installation status runs
+ Checkmarks indicate successfully installed components and exclamation marks (!) indicate items that require additional action
  + The To resolve this section says to run 'flutter doctor --android-licenses'
  + Android toolchain: enter 'flutter doctor --android-licenses' in the terminal and run it
  + After entering 'flutter doctor --android-licenses' and pressing Enter, agreement prompts appear — enter y for all of them
  + After going through the above process, you can confirm that the exclamation marks have changed to checkmarks 

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

*On MacOS, for the above 🔼 case, <span style="color:green"> **resolve** </span> as follows
- "Applications > Android Studio > Contents" folder and create a new jre folder.
- Copy the 'Contents' folder inside the jbr folder --->> to the newly created jre folder.

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


### Creating a VSCode Flutter Project

+ Press Ctrl + Shift + P to type Flutter in the command palette, then click the New Project option.
+ Click 'Application' for Flutter development.
+ Create a folder to save the Flutter project.
+ After specifying the folder location, you can set the Project Name type and project name.
+ After entering the project name, the Flutter project is created with default code.



### Running a VSCode Flutter Project
+ Press the 'F5' shortcut key in the sample code or click the ▶ button on the left to run the project.
+ Click the ▶ button on the left and press the 'Run and Debug' button to run the project.
+ The Flutter sample code runs in 'Chrome'.


### Running VSCode Flutter with an Emulator

+ In VSCode, press the Ctrl + Shift + P shortcut, type 'Emulator', and click.
  + **In practice, you need to install 'Android Studio emulator virtual device', and debugging is done using the emulator in Android Studio.** ( <span style="color:red" >***Android Studio is required** </span>)
    
+ The AVD installed in Android Studio is linked, allowing you to select an emulator to run.  
  + Verify the Android Studio Virtual Device screen+
+ After selecting an AVD, you can run it through the emulator in VSCode.
+ **Press the F5 shortcut key to run the project.**

Additional reference: [https://hileejaeho.cafe24.com/docs/flutter/vscode%EC%97%90%EC%84%9C-emulator%EB%A1%9C-%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0/](https://hileejaeho.cafe24.com/docs/flutter/vscode%EC%97%90%EC%84%9C-emulator%EB%A1%9C-%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0/)

* * *
## App Planning with Flutter 1

* * *
## App Detailed Design (1)

* * *
## App Feature Implementation (1)

* * *
## App Planning with Flutter 2

* * *
## App Detailed Design (2)


* * *
## App Feature Implementation (2)

The [Flutter HTML Editor](https://flutter.ducafecat.com/ko/pubs/html_editor-package-info) is a text editor for Android and iOS based on the Summernote JavaScript wrapper that supports WYSIWYG HTML code writing.

* * *
## Building a Database

* * *
## Publishing to the Marketplace



* * *
### Reference 
- [https://brunch.co.kr/@tilltue/56](https://brunch.co.kr/@tilltue/56)
  - *Retrieve:* Exploring this resource for insights
- [https://d2.naver.com/helloworld/3384599](https://d2.naver.com/helloworld/3384599)
  - *Retrieve:* Exploring this resource for insights
- [Flutter Design Concepts](https://velog.io/@stone1098/%ED%94%8C%EB%9F%AC%ED%84%B0%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90)
  - *Retrieve:* Exploring this resource for insights
- [Installing Flutter on MacOS](https://msyu1207.tistory.com/entry/Mac%EC%97%90%EC%84%9C-Flutter-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0feat-android-studio-xcode)
- [MD Emoticons](https://kr.piliapp.com/twitter-symbols/)
