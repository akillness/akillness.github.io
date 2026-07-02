---
title: "Unsloth Local API Guide: Run Claude/OpenAI-Style Clients on Your Own Machine"
description: "A practical, code-first guide to exposing local GGUF models as authenticated Anthropic/OpenAI-compatible APIs with Unsloth."
date: 2026-05-05 13:00:00 +0900
categories: [AI, MLOps]
tags: [Unsloth, Local-LLM, API, GGUF, Anthropic, OpenAI, Tool-Calling, Inference]
image:
  path: /assets/img/posts/2026-05-05-unsloth-api/unsloth-api-overview.png
---

If you’ve ever wanted to keep models local *and* keep your modern agent workflow, Unsloth is one of the cleanest paths today.

It lets you run local GGUF models and expose them as authenticated APIs that look familiar to existing clients:

- `POST /v1/messages` (Anthropic-style)
- `POST /v1/chat/completions` (OpenAI-style)
- `GET /v1/models` (discover active model IDs)

This means your existing SDKs and coding agents don’t need a full rewrite.

![Unsloth API overview](/assets/img/posts/2026-05-05-unsloth-api/unsloth-api-overview.png)

---

## Why this matters in practice

Most “local inference” setups fail at integration, not model quality.

You can run a model, sure—but connecting it to your real tooling stack (SDKs, CLI agents, app backends, stream handlers, tool calls) often becomes fragile.

Unsloth’s design is pragmatic:

1. Load model locally.
2. Issue an API key.
3. Use standard client interfaces.

You preserve local control without giving up developer ergonomics.

---

## Quick install and start

```bash
curl -fsSL https://unsloth.ai/install.sh | sh
unsloth studio -p 8888
```

Load a model directly:

```bash
unsloth run --model unsloth/gemma-4-26B-A4B-it-GGUF:UD-Q4_K_XL
```

Alternative forms (also valid):

```bash
unsloth run --model unsloth/gemma-4-26B-A4B-it-GGUF --gguf-variant UD-Q4_K_XL
unsloth run -hf unsloth/gemma-4-26B-A4B-it-GGUF:UD-Q4_K_XL
```

For larger context / custom runtime parameters:

```bash
unsloth run --model unsloth/gemma-4-26B-A4B-it-GGUF:UD-Q4_K_XL -c 131072 --threads 32
```

---

## Create API key once, store safely

In Studio:

- avatar (bottom-left) → **Settings** → **API**
- create key (`sk-unsloth-...`)
- copy immediately (shown once)

![API key creation screen](/assets/img/posts/2026-05-05-unsloth-api/api-key-screen.jpg)

---

## Discover exact model ID before wiring clients

```bash
curl http://localhost:8888/v1/models \
  -H "Authorization: Bearer sk-unsloth-your-key"
```

Example:

```json
{
  "data": [
    { "id": "gemma-4-26B-A4B-it-GGUF" }
  ]
}
```

Use that `id` exactly.

---

## OpenAI-compatible Python example

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8888/v1",
    api_key="sk-unsloth-your-key",
)

resp = client.chat.completions.create(
    model="gemma-4-26B-A4B-it-GGUF",
    messages=[
        {"role": "system", "content": "You are a concise coding assistant."},
        {"role": "user", "content": "Write a Python Fibonacci function with memoization."},
    ],
    temperature=0.2,
)

print(resp.choices[0].message.content)
```

Streaming:

```python
stream = client.chat.completions.create(
    model="gemma-4-26B-A4B-it-GGUF",
    messages=[{"role": "user", "content": "Explain quicksort in 5 bullets."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta
    if getattr(delta, "content", None):
        print(delta.content, end="", flush=True)
print()
```

---

## Anthropic-compatible Python example

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://localhost:8888",
    api_key="sk-unsloth-your-key",
)

message = client.messages.create(
    model="gemma-4-26B-A4B-it-GGUF",
    max_tokens=400,
    messages=[
        {"role": "user", "content": "Summarize RAG for backend engineers."}
    ],
)

print(message.content)
```

---

## Enable built-in server-side tools (optional)

```bash
curl -N http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma-4-26B-A4B-it-GGUF",
    "messages": [
      {"role": "user", "content": "What is 123 * 456? Use Python and verify."}
    ],
    "stream": true,
    "enable_tools": true,
    "enabled_tools": ["python", "web_search", "terminal"],
    "session_id": "unsloth-blog-demo"
  }'
```

---

## Docker path (if you prefer containerized runtime)

```bash
docker run -d -e JUPYTER_PASSWORD="change-me" \
  -p 8888:8888 -p 8000:8000 -p 2222:22 \
  -v $(pwd)/work:/workspace/work \
  --gpus all \
  unsloth/unsloth
```

Then point clients to `http://localhost:8888`.

![Unsloth run model screen](/assets/img/posts/2026-05-05-unsloth-api/unsloth-run-model.jpg)

---

## Security checklist (don’t skip)

- Prefer localhost-only exposure.
- Treat API keys as passwords.
- Rotate/revoke keys regularly.
- Never commit keys to repo.
- Be cautious with tool execution on non-localhost bindings.

---

## Troubleshooting cheatsheet

**401 Unauthorized**
- Verify `Authorization: Bearer sk-unsloth-...`
- Recreate key if missing.

**Client uses wrong model**
- Query `/v1/models`
- Copy exact `id`.

**Streaming returns one final blob**
- Ensure correct endpoint path and real stream consumption.

**Tool calls not executing**
- Set `enable_tools: true`
- Include correct `enabled_tools`
- Check global server-side tool policy.

---

## Final take

Unsloth is not just “another local launcher.” It’s an integration layer that makes local models usable in real engineering workflows.

If your goal is **local control + API interoperability**, this is a strong baseline to build on.

**References**
- Docs: https://unsloth.ai/docs/basics/api
- Repo: https://github.com/unslothai/unsloth
