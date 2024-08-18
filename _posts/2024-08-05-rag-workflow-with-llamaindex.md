---
title: Practical Implementation of Agentic RAG Workflows with Llama-Index and Qdrant
description: LLM, Llama-Index
categories: [LLM, Llama-Index]
tags: [Implementation, Llama-Index]
# author: foDev_jeong
date: 2024-08-05 11:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ Agentic workflow with Llamaindex ](/assets/img/llm/llamaindex-agentic-workflow.png){: .light .shadow .rounded-10 w='1212' h='668' }

In this article, we introduce “Terraform Assistant,” a cutting-edge workflow powered by Llama 3.1. This workflow demonstrates how to generate Terraform scripts 
on-demand and save them as physical files.

The unique aspect of this workflow is its ability to index these scripts into a vector store using Qdrant, enabling a powerful Q&A RAG system for Infrastructure as Code (IaC). 


> - Article 👉 <https://medium.com/@manthapavankumar11/practical-implementation-of-agentic-rag-workflows-with-llama-index-and-qdrant-3b6622cd3124>
> - Workflow Blog 👉 <https://www.llamaindex.ai/blog/introducing-workflows-beta-a-new-way-to-create-complex-ai-applications-with-llamaindex>
{: .prompt-info}


Agentic Terraform Assistant with LlamaIndex Workflows 

If you’re a devops engineer who’s an aspiring AI engineer, this weekend learn how to build an agentic terraform assistant with LlamaIndex and Qdrant.

Define an LLM workflow to automatically generate a terraform script for any given topic (e.g. Azure), validate it, and store it.
Define a RAG workflow to index these scripts into Qdrant and retrieve from it.

This is a lightning quick blog post by Kameshwara Pavan Kumar Mantha on workflows, released in LlamaIndex just this past week. Workflows provide an event-driven system where each step can respond to events and respond to actions. It lets you model agent interactions with error correction, async, state management, and more.

 
This script then undergoes a validation process to ensure its correctness and compliance with specified standards. Once validated, the script is saved as a physical file, completing the first part of the workflow. 
 
This flow is designed to automate and streamline the creation and validation of Terraform scripts, reducing the manual effort required by DevOps engineers.


~~~py

from llama_index.core.workflow import (
    Workflow,
    Event,
    StartEvent,
    StopEvent,
    step
)
from llama_index.core import Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
import logging

logging.basicConfig(level=logging.INFO)
Settings.embed_model = OllamaEmbedding(model_name='mxbai-embed-large:latest', base_url='http://localhost:11434')


class TerraformScriptEvent(Event):
    script: str


class ValidationErrorEvent(Event):
    error: str
    wrong_output: str
    passage: str


class InfrastructureAsCodeAssistant(Workflow):
    llm = Ollama(model='llama3.1', base_url='http://localhost:11434', temperature=0.8, request_timeout=300)

    @step()
    async def create_script(self, ev: StartEvent) -> TerraformScriptEvent:
        try:
            topic = ev.get("topic")
            prompt = f"Write optimized terraform script for {topic}. No explanation is needed just give the script only."
            logging.info(f'create_script_prompt: {prompt}')
            response = await self.llm.acomplete(prompt)
            logging.info(f'generated script: {response}')
            return TerraformScriptEvent(script=str(response))
        except Exception as e:
            print("Creation failed,...")
            logging.error(str(e))

    @step()
    async def validate_script(self, ev: TerraformScriptEvent) -> TerraformScriptEvent:
        try:
            terraform_script = ev.script
            prompt = (f"Assume you are a senior devops engineer and given the terraform script: {terraform_script}, "
                      f"your job is to validate the script before user execute it in order to reduce the error time."
                      f"don't give any comments if no deviations found the script. comment if only script has errors")
            logging.info(f'validating the script: {prompt}')
            response = await self.llm.acomplete(prompt)
            logging.info(f'after validation: {response}')
            return TerraformScriptEvent(script=str(response))
        except Exception as e:
            print("Validation failed, ...")
            logging.error(str(e))

    @step()
    async def save_script(self, ev: TerraformScriptEvent) -> StopEvent:
        try:
            terraform_script = ev.script
            with open('main.tf', mode='w') as script:
                script.write(terraform_script)
            return StopEvent(result=str(terraform_script))
        except Exception as e:
            print("Script writing failed, ...")
            logging.error(str(e))

~~~