---
title: "Analysis of llama.cpp Internals and a Simple matmul Sample Implementation Using ggml"
description: "llama.cpp also started when Georgi Gerganov held a hackday over the weekend to implement the llama model using ggml."
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-07-12 11:00:00 +0800
---
> 👉 Github : <https://github.com/likejazz/ggml-simple>
{: .prompt-info}

## Open Source RouteLLM Shows the Real Battle is in Query Routing. 

llama.cpp also started when Georgi Gerganov held a hackday over the weekend to implement the llama model using ggml. And as everyone knows, it has grown into such a massive project that calling it the Linux of the LLM world would not be an exaggeration.

llama.cpp (more precisely, ggml) works similarly to TensorFlow in that it first builds a computation graph and then executes it. As shown in the attached image, calling the graph with the `ggml_graph_compute()` function executes the computation. 

![ LLAMA cpp ](/assets/img/llm/LLAMA-CPP.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

Note that the attached image was written based on an older version — now when running with CUDA, you must use `ggml_backend_graph_compute()`. 

This separate graph computation step is a necessity, but when doing modeling, this approach is quite cumbersome. 

That is why TensorFlow eventually ceded ground to PyTorch. However, since llama.cpp was designed exclusively for inference from the start, this approach is not much of a problem. 
On the contrary, it is easier to optimize and supports various backends — llama.cpp supports CUDA in addition to CPU, METAL on Mac, and AMD's ROCm as well. The core is also implemented concisely in C, which is why the sample I created is C++ code but uses only C syntax. 
The tensor variable itself is implemented as a struct called ggml_tensor from the start.

PyTorch, on the other hand, starts with torch::Tensor — which is already a namespace. All syntax is C++-specific. With llama.cpp you have to manually code the process of copying memory from CPU to GPU, whereas torch abstracts all that away, making it usable in C++ almost as easily as Python. 

You can see the philosophy of each framework here: PyTorch as an all-in-one package that is easy to use and supports everything in deep learning, versus llama.cpp which is portable, lightweight, concise, dependency-free, and gives you full control over every part.

As LLMs run on-device becomes increasingly common, I think demand for lightweight, concise frameworks like llama.cpp will keep growing. Directly inferencing and optimizing models using ggml will likely become more common too. Of course, the open-source community will implement most of that for us, so the majority of people will just use it off the shelf.


