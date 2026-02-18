---
title: "Exploring LLM Use Cases at Karrot (Danggeun Market)"
description: "This post covers everything from planning to study LLM (Large Language Model) to writing actual code."
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-05-06 18:25:00 +0800
mermaid: true
---
This post covers everything from planning to study LLM (Large Language Model) to writing actual code. 
Through the article [Using LLM at Karrot](https://medium.com/daangn/%EB%8B%B9%EA%B7%BC%EC%97%90%EC%84%9C-llm-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0-76131ecebce1), let's explore what LLMs are good at and analyze real-world use cases.

## What LLMs Do Well

*Curiosity:* LLMs have learned from vast amounts of text data, acquiring knowledge about the world, language comprehension, and excellent reasoning abilities, enabling them to understand given text and perform instructed tasks without additional training. 


However, since LLMs cannot replace all problems that were previously solved by training deep learning models, the things LLMs do well can be broadly categorized as follows.

### Natural Language Processing: Text Analysis, Extraction, Classification

Simply by writing a prompt, it became possible to perform the same tasks with performance similar to or better than models specifically trained for those tasks.
![Prompt](/assets/img/llm/Prompt.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

### Answering Human Questions

Since LLMs excel at understanding questions and text and generating written content, they can also be effectively used for answering questions. 
Leveraging this, it is possible to create Assistant-type services that help people by answering their questions, or Agent-type services that completely replace the human answering role. 
By default, LLMs answer based on knowledge acquired through training, but the approach commonly used in services today involves first finding the information needed for the answer and passing it to the LLM along with the question (retrieval-augmented generation = RAG).

### Creative Writing

LLMs have an outstanding ability to generate new text. For example, they can creatively produce letters, novels, and other written content according to given instructions. 
By leveraging creative writing, one could imagine generating ad creatives for advertisers, or writing business news and secondhand marketplace listings on behalf of users.

While there are things LLMs do really well, they are not omnipotent. Although new models continue to be released and are rapidly improving, they still frequently generate incorrect content or exhibit instability. This is commonly called Hallucination.
And no matter how much LLMs advance, there are fields where training deep learning models is still essential.

* * * 

## LLM Applications at Karrot

> Through LLM use cases applied at Karrot, let's examine the approaches and types for stable service deployment

### Use Case 1 - Secondhand Trading: Recommendations and Advertising with LLM

Due to the nature of a secondhand market where transactions occur between users, the community is formed through unstructured information rather than standardized formats.



Accordingly, the architecture of use cases that employ LLMs to extract structured data from unstructured data is utilized.
![Use Case 1](/assets/img/llm/Use_case_1_carrot.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }


### Use Case 2 - Neighborhood Life: Place Linking and Tag Recommendations with LLM

In Neighborhood Life, many users mention place names when writing about local spots but often do not tag the places. In such cases, information about local businesses is lost because it is not linked to place data. The LLM reads Neighborhood Life posts, identifies what appears to be place names, and if the place name corresponds to an actual existing place, automatically creates a link and displays it in a “Mentioned Places” section. This is a case where LLM is used as a technology for storing place information in Neighborhood Life.

![Use Case 2](/assets/img/llm/Use_case_2_carrot.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

The place-finding feature was also extended to expand its scope of use to hashtag information.


![Use Case 3](/assets/img/llm/Use_case_3_carrot.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

### Use Case 3 - Groups: Group Recommendations with LLM

By examining group names and detailed descriptions, the LLM extracts the target age range and gender typically recruited by the group, as well as specific topics (e.g., tennis, golf, travel, cafe tours, etc.) for utilization. 
This information is used as data to recommend groups that users might be interested in across various curation and recommendation surfaces.
![Use Case 4](/assets/img/llm/Use_case_4_carrot.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }


### Use Case 4 - Real Estate: Auto-filling Property Information and Cover Photo Change Suggestions with LLM

When listing a real estate property, it can be cumbersome to fill in various information such as property type, price, floor, area, maintenance fees, and interior/exterior facilities in the input form. This process is automated with LLM to provide a convenient user experience for property registration. For real estate listings, many users write down information in advance and copy-paste it, and similarly on Karrot Real Estate, simply pasting the text allows the LLM to read the entire content, find the necessary information, and automatically fill in the input form. 

![Use Case 5](/assets/img/llm/Use_case_5_carrot.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }


* * * 

## What You Need to Utilize LLMs

Let's examine the process pipeline architecture that made the previously introduced use case services possible.
![Real-Time Pipeline](/assets/img/llm/realtime_llm_pipeline.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }



The pipeline that performs real-time LLM predictions and stores results utilizes a pipeline system developed by the ML Data Platform team. When a post is created, events flow into Kafka, and the system is configured to receive these events, perform pre-specified LLM predictions, and export results back to Kafka topics and BigQuery. It is designed so that simply adding a YAML configuration containing topic subscription information, model information, and prompts allows you to easily add a pipeline that performs real-time LLM predictions.

### LLM Model Selection

Multiple big tech companies are competitively releasing models and providing APIs, allowing us to choose which model to use for our tasks. Notable examples include Google's Gemini series, OpenAI's GPT series, and Anthropic's latest Claude 3 series, which form groups based on size and cost. 

The most powerful and expensive models include GPT-4, Gemini 1.5 Pro, and Claude 3 Opus, while models offering solid performance at reasonable prices include GPT-3.5-turbo, Gemini 1.0 Pro, and Claude 3 Haiku. The API costs between the two groups differ by approximately 10-30x, so selecting the appropriate model group based on task difficulty and throughput is necessary. 

While each model has published benchmark scores, it is best to test directly on the tasks you intend to perform before deciding. In terms of cost, the Gemini Pro model has an aggressive pricing policy and charges per character rather than per token, which we found to be advantageous for Korean, which tends to use relatively more tokens. 

Currently, Karrot most frequently uses Google's Gemini 1.0 Pro, PaLM2, and Gemini 1.0 Pro Vision models. Rather than picking one model and applying it to all use cases, it is important to select the appropriate model for each case, and even within a single use case, a strategy of branching to different models based on the type or length of examples can be considered.


### Text Processing Costs of Major LLM APIs

![Billing Models](/assets/img/llm/Billing_of_models.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

#### Prompt Engineering

The advantage of LLMs is that desired tasks can be performed with simple natural language instructions, but depending on how you instruct, you may or may not get the desired level of performance. While LLMs are rapidly advancing and already highly capable, writing good prompts still plays an important role in achieving good results. Below are some insights felt to be important while building the use cases introduced above.

-  Create test sets and iterate: Iterative evaluation and improvement were absolutely necessary to complete a good prompt. Since it is difficult to get good results on the first try, you need to prepare test sets with correct answers, evaluate the LLM prediction results, improve the prompt, and evaluate again in an iterative cycle. If you improve prompts while only testing 1-2 examples, overall performance can actually worsen. It was important to create at least several hundred test cases and continuously evaluate.


#### Iteratively Evaluate and Improve Prompts

![Prompt Development](/assets/img/llm/Prompt_development.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

-  Output format control: To leverage LLM-generated results for other features, the output must be easily processable by code. When instructing the LLM to output results in JSON format with given keys, you can control the output format and easily post-process it. If the model API you are using supports `JSON Mode`, you can use it to guarantee the output is valid JSON. Otherwise, even when the prompt instructs JSON output, invalid JSON may occasionally be produced, so validation and correction post-processing is essential.

-  Think before answering: People also perform better when they think step by step before giving a final answer. Similarly, LLMs can sometimes perform better when generating intermediate steps first before producing the final answer, rather than generating the final answer all at once. This technique, called Chain-of-thought (COT), is very widely used and has proven performance improvements. In the Neighborhood Life LLM case introduced above, better performance was observed when the model was asked to briefly summarize the key points of the given text before extracting the needed information.

-  Show examples: Sometimes showing a few examples of the desired format or instructions is more powerful than lengthy explanations. For instance, if you instruct “output as a comma-separated string,” the format may occasionally be wrong, but showing an actual example in that format eliminates such errors. When providing examples, it is important to match the desired input/output format exactly, as examples that differ from the instructions can cause confusion and degrade performance. Providing too many examples also negatively affected performance. Using only the minimum number of examples needed to understand the instructions is recommended.

-  Break into simple tasks: If you want to extract a piece of information but the extraction conditions are complex, rather than giving complex specific conditions, it can be a better approach to have each simplified condition extracted one at a time and then generate the final result or combine them through post-processing. For example, giving complex conditions like “Extract mentioned place names if any. But exclude if the place is mentioned only to indicate a location. Also exclude if it is not a review of the place.” makes it difficult, but instructing with multiple simple tasks like “Extract the following information: 1. Mentioned place names 2. Whether it is a review of the place 3. Whether the place name is simply mentioned to indicate a location” results in each task being performed excellently. Post-processing can then be used to keep only results that meet the required conditions. When the overall instructions become complex and lengthy, calling the model multiple times in stages can also be considered. Different models can be used for each stage based on difficulty to obtain the final result.


## Going Forward


### Making Prompt Engineering Real Engineering

Current prompt engineering still has many shortcomings from an engineering perspective, and to continue adopting and improving LLM utilization going forward, various engineering methods are being considered.

- Change management: Just as software tracks code changes and manages deployment versions, prompt and model change history should be easily trackable and reversible, and deployment version management is also needed
- Evaluation and deployment automation: When changes to prompts or models occur, output format, accuracy, safety, etc. should be automatically evaluated and rapidly deployable
- Observability: Monitoring is needed to know whether prompts deployed to production are working properly, from LLM call success rates to cost tracking and quality of generated results
- A/B testing: Online/offline A/B testing should be possible to compare multiple prompt versions through experiments and select the better version
- Scalability: Rather than using information obtained from LLMs for only one feature, it should be usable across various services and other machine learning models through integration with feature stores and similar approaches


<!-- ```liquid
{% if product.title contains 'Pack' %}
  This product's title contains the word Pack.
{% endif %}
  No title
``` -->

