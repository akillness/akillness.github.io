---
title: Use Transformers.js with Gradio and run your ML app completely in -browser
description: "Gradio-Lite plus Transformers.js for serverless in-browser ML, pinned to the Transformers.js repo and demo Space: pipeline API, ONNX/WASM/WebGPU execution, quantization knobs, and what the original social copy omits."
categories: [LLM/Model & Papers]
tags: [llm, model, paper]
date: 2024-05-13 15:20:00 +0800
published: true
ads: false
robots: noindex, follow
sitemap: false
---
# Run Transformers.js with Gradio-Lite entirely in the browser (with what the social copy omits)

The original note was a social-post copy: Gradio's release lets you write Python, use Transformers.js pipelines, and run serverless ML demos on-device, with three guide links and a sample object-detection Space. That is accurate but not sufficient — it explains no decision a reader can act on, and two of the three linked guides now return 404 as retrieved 2026-10-14. This rewrite keeps the release facts and adds the missing technical substance, pinned to primary sources. The post stays out of search and sitemaps under the retired contract (`robots: noindex, follow`, `sitemap: false`, ledger status retired); the remediation for AdSense here is quarantine, not indexation.

## What was released

- Gradio-Lite integration with Transformers.js (credited to @whitphx with @xenovacom's Transformers.js): Python-authored Gradio demos whose inference runs fully in the browser with no server.
- Guides (as originally linked): <https://www.gradio.app/guides/gradio-lite-and-transformers-js> and <https://www.gradio.app/guides/gradio-lite> — both return 404 as retrieved 2026-10-14, so the steps below are pinned to the library repo and demo Space instead.
- Sample serverless demo: object detection on device — <https://huggingface.co/spaces/Gradio-Community/object-detection-on-device> (Gradio-Community Space, running as retrieved).

## What the stack actually does

Transformers.js (<https://github.com/huggingface/transformers.js>, 16.3k stars as retrieved, Apache-2.0) runs Hugging Face Transformers directly in the browser with no server. It is designed to be functionally equivalent to the Python `transformers` API: the same `pipeline` abstraction groups a pretrained model with preprocessing and postprocessing. Example from the repo (sentiment analysis, same call shape as Python):

```js
import { pipeline } from '@huggingface/transformers';
const pipe = await pipeline('sentiment-analysis');
const out = await pipe('I love transformers!');
```

Execution uses ONNX Runtime in the browser. Default is CPU via WASM; GPU via WebGPU is opt-in per pipeline (`device: 'webgpu'`), with the repo warning that WebGPU remains experimental across browsers. For constrained environments the `dtype` option selects `fp32` (WebGPU default), `fp16`, `q8` (WASM default), or `q4` — the bandwidth/performance knob the social copy never mentions. Models convert from PyTorch/TensorFlow/JAX via Optimum to ONNX. Supported coverage spans NLP (classification, NER, QA, summarization, translation, generation), vision (classification, detection, segmentation, depth), audio (ASR, classification, TTS), and zero-shot multimodal tasks; text-to-image, video classification, and tabular tasks are explicitly unsupported.

## What the social copy omits

- The vanished guides: anyone following the original three links today lands on two 404s. The durable references are the repo README/docs (`huggingface.co/docs/transformers.js`) and the live Space.
- The execution trade-off: WASM works everywhere but slower; WebGPU is faster but experimental; `q4`/`q8` quantization cuts download size and memory at some accuracy cost. "Completely in-browser" is true in all three configurations with different latency and compatibility.
- Model sourcing: the browser loads hosted pretrained models (default `/models/` plus Hugging Face Hub remotes, configurable via `env`), so first-load bandwidth and caching are part of the deployment decision.

## Trade-offs

- Use Gradio-Lite plus Transformers.js when the demo must run with no server (privacy, offline, zero backend cost) and the task is within the supported list (for example object detection, classification, ASR).
- Prefer server-side inference when the model is unsupported in the browser, when `q4` degradation is unacceptable, or when WebGPU experimental status is a risk for the target audience.
- Keep the Python Gradio authoring but verify the JS-side pipeline ID and dtype per model; the Python-side API existing does not imply the browser build supports that task.

## Limitations

- This rewrite did not re-run the object-detection Space; Space status ("Running") and repo numbers (16.3k stars, 1.2k forks, 2,019 commits) are reported as retrieved 2026-10-14.
- Guide contents could not be verified because both Gradio guide URLs return 404; behavior claims rest on the repo README.
- The Korean translation `<details>` block from the original is removed: machine-duplicated bilingual copy without added information is itself a low-value pattern.

## References

- Transformers.js repository — <https://github.com/huggingface/transformers.js>
- Transformers.js documentation — <https://huggingface.co/docs/transformers.js>
- Object-detection-on-device demo Space — <https://huggingface.co/spaces/Gradio-Community/object-detection-on-device>
- Original Gradio guides (404 as retrieved 2026-10-14) — <https://www.gradio.app/guides/gradio-lite-and-transformers-js>, <https://www.gradio.app/guides/gradio-lite>
