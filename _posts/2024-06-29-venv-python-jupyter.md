---
title: Setting Jupyter Kernel according to venv of python
description: Python, venv, jupyter
categories: [Setting, Jupyter]
tags: [Venv, Jupyter]
# author: foDev_jeong
date: 2024-06-29 00:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

In this post, when i use jupyter notebook explain how to add venv of python.

## Setting venv of python 

- activate.bat 또는 source activate 실행

## Setting Jupyter Notebook

~~~sh
pip install jupyter jupyter notebook
~~~

## Install ipkernel to add Jyputer Kernel 

~~~sh
pip install ipykernel
~~~

## Add Jupyter Kernel

~~~sh
python -m ipykernel install --user --name "virtual env name" --display-name "shown name of diplay"
~~~

## Uninstall Jupyter Kernel

~~~sh
jupyter kernelspec uninstall .venv
~~~
<!-- 
![ Tools for building LLM Application ](/assets/img/llm/LLM_tools_for_building.jpeg){: .light .shadow .rounded-10 w='1212' h='668' } -->


> Reference
- ipkernel : <https://hellodata.tistory.com/38>
- Google Colab : <https://creatorjo.tistory.com/entry/%EA%B5%AC%EA%B8%80-%EC%BD%94%EB%9E%A9colab-%EA%B8%B0%EC%B4%88-%EC%82%AC%EC%9A%A9%EB%B2%95>
{: .prompt-info}


