---
title: "LLM Wiki: Why Your Best Knowledge Base May Be an Agent-Maintained Wiki, Not Another RAG Stack"
description: "A practical review of Andrej Karpathy's LLM Wiki idea, including persistent knowledge compilation, wiki maintenance loops, Obsidian workflows, and why agent-maintained markdown may beat repeated retrieval for serious research and product work."
categories: [AI, Agents, Knowledge-Management]
tags: [llm-wiki, rag, obsidian, ai-agents, knowledge-base, personal-knowledge-management]
date: 2026-04-05 09:00:00 +0900
pin: false
mermaid: false
math: false
image:
  path: "https://github.githubassets.com/assets/gist-og-image-54fd7dc0713e.png"
  alt: "LLM Wiki gist preview image"
---

## 🤔 Curiosity: What if the real problem with knowledge work is not retrieval, but forgetting everything you already learned?

A lot of current AI knowledge workflows still feel deceptively powerful.

You upload documents, connect a vector database, ask a question, retrieve chunks, and get an answer that sounds smart enough to keep going.

That works.

But it also hides a structural weakness: the system often rebuilds understanding from scratch every time you ask something important.

If your question depends on five papers, three meeting notes, two contradictory reports, and one half-forgotten insight from last week, most RAG-style systems still make the model reassemble that understanding on demand. The result is useful, but fragile. The knowledge does not really accumulate. The system retrieves evidence well, yet often fails to become meaningfully wiser over time.

That is why Andrej Karpathy’s "LLM Wiki" note is interesting.

The idea is simple, but much more ambitious than ordinary file chat:

> Do not just retrieve from a pile of documents. Let the LLM continuously build and maintain a persistent wiki that sits between the human and the raw sources.

That shift matters because it changes the unit of memory.

Instead of treating every question as a fresh search problem, the system compiles knowledge into an evolving markdown codebase: summaries, entity pages, concept pages, indexes, timelines, and cross-links. The human explores. The agent curates and maintains. The wiki becomes the long-lived artifact.

From a product engineering perspective, that is the interesting part. This is not "RAG, but prettier." It is closer to treating knowledge like software: accumulated, refactored, linked, versioned, and continuously maintained.

---

## 📚 Retrieve: What Karpathy’s LLM Wiki pattern actually proposes

### 1) The core layer is a persistent wiki, not a transient retrieval result

Karpathy’s note starts by contrasting standard document-chat behavior with a more cumulative model.

In a normal RAG loop:

- documents stay mostly raw,
- retrieval happens at question time,
- synthesis happens repeatedly,
- and the system often rediscovers the same structure over and over.

In the LLM Wiki pattern, the model builds a middle layer:

- raw sources remain immutable,
- the wiki becomes an LLM-maintained knowledge layer,
- and the schema file defines how the agent should ingest, answer, and maintain.

That architecture matters because it turns "memory" into something inspectable.

You can open the markdown. You can inspect page drift. You can see missing links. You can notice where the synthesis is weak. In other words, knowledge stops being a hidden latent state and becomes a visible artifact.

### 2) The structure is intentionally simple: sources, wiki, schema

One of the strongest parts of the note is that it does not overcomplicate the stack.

Karpathy describes three layers:

1. Raw sources
2. The wiki
3. The schema

That is a good design.

The raw sources stay immutable, which protects provenance. The wiki becomes the living interpretation layer. The schema file, such as `AGENTS.md` or `CLAUDE.md`, teaches the agent how to behave like a disciplined maintainer instead of a generic chatbot.

This is a very practical idea.

Most teams overinvest in retrieval infrastructure before they define maintenance behavior. But for serious knowledge work, the workflow rules often matter more than the embeddings. A mediocre retrieval stack with a strong maintenance protocol can become useful. A great retrieval stack with no durable synthesis protocol often becomes a very expensive pile of searchable fragments.

### 3) The important workflow is ingest, not just query

Karpathy emphasizes three operations:

- ingest,
- query,
- lint.

That sequence is worth paying attention to.

Most current systems obsess over query quality. LLM Wiki says the real leverage comes earlier: what happens when a new source arrives?

In this pattern, ingest means more than adding a file to an index. The agent should:

- read the source,
- discuss takeaways with the user,
- write or update a source summary,
- update concept and entity pages,
- revise synthesis where new evidence changes prior understanding,
- update the index,
- and append the change to a chronological log.

That is the right idea because knowledge bases decay when ingestion is shallow.

If new information enters the system without being woven into the existing map, the knowledge base turns into storage instead of understanding.

#### Concrete example

Imagine you are tracking AI coding agents over three months.

Each week you add:

- official release notes,
- benchmark posts,
- your own experiment logs,
- bug reports from real usage,
- screenshots of failures,
- and pricing changes.

A classic retrieval setup can answer isolated questions, but it may not maintain a coherent thesis like:

- which agents are strongest at repository-level execution,
- which ones fail under tool pressure,
- how pricing shifted over time,
- where benchmark claims diverged from field results,
- and which workflows are actually stable enough to ship.

An LLM-maintained wiki is better suited to that job because it is designed to accumulate interpretation, not just retrieve evidence.

### 4) Index and log are surprisingly important

Two files in Karpathy’s note matter more than they look:

- `index.md`
- `log.md`

`index.md` is the content map. It helps both the human and the LLM discover what exists.

`log.md` is the time map. It tracks what changed and when.

This is one of those simple ideas that experienced builders tend to appreciate immediately.

When long-running agent systems break, they usually do not fail only because of model quality. They fail because state becomes ambiguous. Nobody knows what changed, which summary is newer, whether one page superseded another, or what the last ingestion pass actually touched.

A chronological log is not glamorous, but it gives the system narrative continuity.

### 5) The note is really about maintenance costs

Karpathy makes the key claim near the end: humans abandon wikis because maintenance grows faster than value.

That is true.

The hard part of a knowledge base is rarely writing the first page. The hard part is:

- updating cross-references,
- revising summaries after contradictory evidence arrives,
- splitting overloaded pages,
- noticing orphan concepts,
- and keeping the whole thing coherent across dozens or hundreds of notes.

That is exactly the kind of repetitive structural work LLMs are unusually good at.

Not because they are always correct, but because they are tireless editors of medium-quality text structures.

That makes the LLM Wiki concept compelling. It assigns the human and the model to the right jobs:

- human: curation, judgment, interpretation, direction
- LLM: synthesis maintenance, cross-linking, filing, routine structural updates

---

## 🖼️ Source Images Worth Including

### Gist preview image
![LLM Wiki gist preview](https://github.githubassets.com/assets/gist-og-image-54fd7dc0713e.png)

The source note itself is mostly text, so there is no rich architecture figure embedded in the gist. Still, using the official gist preview image helps ground the article in the original source instead of turning it into a detached opinion piece.

---

## 💡 Innovation: Why this idea matters more than another RAG tutorial

The most useful way to read LLM Wiki is not as a note about note-taking.

It is really a note about persistent intelligence infrastructure.

### Case 1: Personal research compounds instead of resetting

A lot of people use AI tools like temporary amplifiers. They upload files, ask a question, get a result, and move on.

That creates bursts of intelligence, but not durable understanding.

An LLM Wiki changes the loop:

- every source can leave a structured trace,
- every important question can become a reusable page,
- every contradiction can be surfaced in a stable location,
- and every research session can strengthen the system instead of disappearing into chat history.

That is a much better fit for long-running topics like:

- AI agent reliability,
- health research,
- investment due diligence,
- product strategy,
- literature study,
- or competitive intelligence.

### Case 2: Teams finally get a wiki that someone actually maintains

The business example in the note is one of the most realistic ones.

Internal wikis usually fail for a boring reason: nobody wants to do the maintenance.

Meeting notes pile up. Slack discussions disappear. Project decisions are made in threads and never normalized. Customer insights stay trapped in calls. Documentation becomes a graveyard of stale summaries.

If an agent can continuously turn those raw artifacts into:

- updated project pages,
- entity pages for customers or products,
- decision logs,
- cross-linked roadmaps,
- and contradiction notes,

then the wiki becomes operational instead of ceremonial.

That is where this pattern gets commercially interesting.

### Case 3: Obsidian becomes an IDE for knowledge systems

Karpathy’s line about "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase" is probably the sharpest sentence in the whole note.

I think that framing is correct.

It gives builders a better mental model than "chat with your files."

If the wiki is a codebase, then a lot of engineering instincts suddenly transfer cleanly:

- markdown pages are files,
- links are references,
- indexes are registries,
- logs are commit history,
- lint passes are consistency checks,
- schema files are coding standards,
- and git gives you rollback, diff, and branching.

That is much more legible than pretending knowledge work is just one giant prompt.

### Case 4: This is a better path for serious agent systems than stuffing more into context

One of the biggest anti-patterns in AI products is trying to fix memory by increasing context size forever.

Longer context helps, but it does not solve organization.

If you keep shoving more raw material into the window, you eventually create a different problem:

- more noise,
- weaker salience,
- fuzzier provenance,
- and a higher chance that the model notices the wrong thing at the wrong time.

A maintained wiki is a compression layer with structure.

It is not just shorter than the raw corpus. It is better organized than the raw corpus. That is why it matters.

---

## A practical code pattern for starting an LLM Wiki

Below is a lightweight example of how to operationalize the pattern in a repo-backed vault. This is not copied from the gist as an official implementation. It is a compact starting shape for builders who want to turn the idea into a real workflow.

```bash
wiki/
├── raw/
│   ├── 2026-04-05-karpathy-llm-wiki.md
│   └── assets/
├── pages/
│   ├── overview.md
│   ├── concepts/
│   ├── entities/
│   └── sources/
├── index.md
├── log.md
└── AGENTS.md
```

And a minimal workflow prompt for the agent maintainer:

```md
# AGENTS.md

When a new source is added:
1. Read the raw file completely.
2. Create or update a source summary in `pages/sources/`.
3. Update relevant concept and entity pages.
4. Add missing internal links.
5. Record contradictions or superseded claims explicitly.
6. Update `index.md` with changed pages.
7. Append one entry to `log.md` with date, source, and pages touched.
```

A simple query loop can then treat the wiki as the first-class working set:

```python
from pathlib import Path

ROOT = Path("wiki")
question = "What has changed in AI coding agents over the last 30 days?"

index_text = (ROOT / "index.md").read_text()
log_text = (ROOT / "log.md").read_text()

candidate_pages = [
    ROOT / "pages" / "overview.md",
    ROOT / "pages" / "concepts" / "ai-coding-agents.md",
]

context = "\n\n".join(p.read_text() for p in candidate_pages if p.exists())

prompt = f"""
Use the wiki first, not the raw files.
Question: {question}

Index:
{index_text}

Recent log:
{log_text[-3000:]}

Relevant pages:
{context}
"""

print(prompt[:1200])
```

### Why this code example matters

The key lesson is not the code itself.

It is the operating principle:

- the wiki becomes the default context layer,
- the raw files remain the evidence layer,
- and the schema controls how the agent updates knowledge over time.

That is a much healthier pattern than repeatedly throwing unstructured documents into a prompt and hoping the model rediscovers your worldview on demand.

---

## Final Thoughts

Karpathy’s LLM Wiki note is short, but it points at something bigger than personal note-taking.

It points at a practical answer to one of the most annoying limits in current AI systems: they often sound cumulative without actually being cumulative.

A maintained markdown wiki is not magic. It can still drift. It can still encode bad summaries. It still needs human oversight, good prompts, and occasional linting.

But it has one enormous advantage over ephemeral chat memory and naive RAG pipelines:

it creates a durable artifact that can improve over time.

That is why I think this idea matters.

The future of useful AI knowledge systems may not look like a better chatbot with a larger upload box.

It may look more like a repo.

---

## Sources

- Andrej Karpathy, "LLM Wiki" gist: <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>
