---
title: Watch the concept🔥🤔, how Linux🐧 works
description: Study, Linux
categories: [Study, Linux]
tags: [OS, Linux]
# author: foDev_jeong
date: 2024-08-04 17:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ How Work Linux ](/assets/img/blog/how-work-linux.gif){: .light .shadow .rounded-10 w='1212' h='668' }

# Here's a breakdown of the key components and processes involved

## 🐧 Power On! ⚡
This signifies the start of the process, when the computer is powered on.

## 🐧 BIOS (Basic Input/Output System) & ROM (Read-Only Memory) 💻
BIOS is a firmware program stored in the ROM chip. It performs a Power-On Self Test (POST) to check the basic functionality of the system hardware and then loads the bootloader.

## 🐧 Boot Loader 🔄
The bootloader is a small program that loads 해시태그#Linux 🐧 kernel from the hard disk into memory.

## 🐧 Master Boot Record (MBR) 💾
The MBR is the first sector of the hard disk and contains the boot loader code and a partition table.

## 🐧 Kernel 🧠
kernel is the core of the Linux operating system. It manages hardware resources (like memory and CPU), provides security, and allows applications to interact with the hardware.

## 🐧 User Space (Applications) 💼
This refers to the software programs that users interact with, such as web browsers, word processors, and games. These programs run in user space, which is isolated from the kernel for security reasons.

## 🐧 System Calls 📞
System calls are a way for applications in user space to request services from the kernel. For instance, if an application wants to read a file from the hard disk, it would make a system call to the kernel.

## 🐧 Process Management 🔄
The kernel is responsible for managing processes, which are instances of running programs. It allocates resources to processes, schedules their execution time, and handles their termination.

## 🐧 Memory Management 🧠
The kernel manages the system's memory, allocating and freeing memory as needed by processes.

## 🐧 Device Drivers 🖥️
Device drivers are software programs that allow the kernel to communicate with specific hardware devices.

## 🐧 File System Management 🗄️
The kernel manages the file system, which is a way of organizing and storing files on the hard disk.

## 🐧 Shell (or Graphical User Interface (GUI)) 
The shell is a command-line interface that allows users to interact with the operating system by typing commands. Alternatively, a graphical user interface (GUI) provides a more user-friendly way to interact with the system using icons, menus, and windows.
