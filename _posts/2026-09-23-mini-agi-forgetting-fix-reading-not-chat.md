---
title: "mini-AGI's forgetting fix is measured on reading, not on chat"
description: "A Source Audit of mini-AGI: the no-forgetting result comes from a 0.1x trunk rate on a corpus probe, while chat learning is on by default and unmeasured."
categories: [AI, Agents]
tags: [ai-agents, continual-learning, evaluation, open-source, trust-boundaries]
date: 2026-09-23 21:07:03 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/mini-agi-three-learning-paths.svg
  alt: "Original diagram of mini-AGI's three learning paths: the measured corpus run, the file-reading path, and the unmeasured chat path"
---

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; I read the pinned repository but did not train, serve, or chat with mini-AGI myself.

## 🤔 Curiosity: Which part of mini-AGI learns without forgetting?

[mini-AGI](https://github.com/volotat/mini-AGI) is Alexey Borsky's new MIT-licensed project, created on September 19, 2026. Its README describes a **continual learning byte-level language model** that assembles its own architecture, trains from scratch on a single 8 GB VRAM GPU, and keeps learning from everything it reads. The author is careful to add that, for now, it is a small toy-level model.

The pitch that caught my attention is in the Motivation section: a model that is yours, trained on your hardware, and that **keeps learning from every conversation you have with it**. For anyone building a personal assistant or a studio tool, that is the interesting part. It is also the risky part, because continual learning usually fails through forgetting.

So I asked a narrow question:

> **Does the published no-forgetting evidence cover the ways I would actually use a personal model: reading my files and chatting with it?**

The pinned code says only partly. The forgetting probe measures corpus reading with a slowed-down trunk. Chat learning is on by default, writes to disk, and its own source file says its cost is not measured. The file-reading path runs faster than the README says.

To be fair to the author, most of this is visible in the repository itself. The code is unusually candid. The gap is between the Motivation paragraph and what has been measured so far.

## 📚 Retrieve: What the pinned repository shows

I pinned the repository at commit [`efd4a168`](https://github.com/volotat/mini-AGI/tree/efd4a16822d7e46008847186df750ea3ff9fa00b) from September 23 and read the README, `serve.py`, `minagi/live.py`, `train.py`, `config.yaml`, and `minagi/config.py`. The repository had 20 commits at that point, and the MIT license was added on September 21.

### A model that pages its experts from disk

mini-AGI stores each expert as a file. Only a working set sits on the GPU: the README says **32 experts are resident at a time, about 109M parameters of the 540M** in its parameter table, which is why the pool can grow on an 8 GB card. The reference machine is an RTX 3070 Laptop GPU. The weights are not published yet.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/references/mini-agi-training-dashboard.png" alt="Nine-panel mini-AGI run dashboard captured at 240.0M characters and 144 experts, with loss, routing depth, and gradient-norm panels">
  <figcaption>The run dashboard as published in the README, captured earlier in the run. Source: <a href="https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md">https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md</a>. Publisher/creator: Alexey Borsky (volotat/mini-AGI). License: <a href="https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE">https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE</a>. Attribution: Alexey Borsky, mini-AGI README dashboard image, MIT License, pinned at commit efd4a168.</figcaption>
</figure>

Characters pass through two dense blocks and then one recurrent block that can be applied up to 24 times, with each application picking its own top-8 experts and a halting head deciding when a character has had enough depth. The README's architecture animation shows that routing live.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/references/mini-agi-expert-routing-frame.png" alt="First frame of the mini-AGI routing animation: rows of eight expert tiles, an amber halting line, and a per-character depth trace">
  <figcaption>First frame of the README's routing animation. Source: <a href="https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md">https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md</a>. Publisher/creator: Alexey Borsky (volotat/mini-AGI). License: <a href="https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE">https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE</a>. Attribution: Alexey Borsky, mini-AGI shape.gif first frame, MIT License, pinned at commit efd4a168.</figcaption>
</figure>

One provenance note matters for everything below. The README's AI usage section says a Claude model implemented most of the code, and that **the animations, graphs, and other media were produced by Claude from the real data traces**. The figures in this post are the author's published charts, reproduced as evidence of what the project reports.

### The forgetting probe, and what it proves

The README calls this **the measurement the whole design rests on**. The model reads **524,000 characters of chess and nothing else, at batch 1**, and the project scores what happens to the seven subjects it did not read.

| Configuration, as reported | Unread subjects | Retained vs chance |
|---|---|---|
| Working set frozen, trunk rate = expert rate | +2.5871 nats | 42.88% |
| Swapping, trunk rate = expert rate | +2.2300 nats | 50.68% |
| Swapping, trunk at 0.1x, the run's setting | +0.0067 nats | 99.84% |

The README is explicit that **the expert pool is not what prevents forgetting**. Freezing the working set costs only 0.3571 nats, 13.8% of the effect. The mechanism is the trunk learning rate: the trunk carries 97.6% of the squared gradient norm, and running it at a tenth of the experts' rate is what keeps the unread subjects flat.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/references/mini-agi-forgetting-mitigations.png" alt="mini-AGI forgetting chart for a 524,000-character chess read: two arms reach +2.5871 and +2.2300 nats, the 0.1x trunk arm stays at +0.0067">
  <figcaption>Forgetting on the seven unread subjects under three configurations, as published. Source: <a href="https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md">https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md</a>. Publisher/creator: Alexey Borsky (volotat/mini-AGI). License: <a href="https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE">https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE</a>. Attribution: Alexey Borsky, mini-AGI mitigations chart, MIT License, pinned at commit efd4a168.</figcaption>
</figure>

The second chart looks inside the same probe with the trunk at 0.1x. **Chess, the subject being read, improves by 0.013 nats**, the seven unread subjects stay within ±0.02 nats, and only 54 of 136 experts receive any gradient.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/references/mini-agi-massed-chess-probe.png" alt="mini-AGI chess probe with the trunk at 0.1x: chess improves 0.013 nats, unread subjects stay within ±0.02, and 54 of 136 experts get gradient">
  <figcaption>Every subject during the chess probe, and how much of the pool was touched, as published. Source: <a href="https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md">https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md</a>. Publisher/creator: Alexey Borsky (volotat/mini-AGI). License: <a href="https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE">https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE</a>. Attribution: Alexey Borsky, mini-AGI massed probe chart, MIT License, pinned at commit efd4a168.</figcaption>
</figure>

Here is my reading, and it is an interpretation rather than a new measurement. The README's own Benchmarks section says the same configuration run twice lands about 0.014 apart and tells readers to **treat about 0.03 as the threshold for a real difference**. By that rule, both numbers from the working configuration, the +0.0067 nats of forgetting and the 0.013-nat chess gain, sit below a real difference. The probe shows that the 0.1x trunk did not forget. It does not, on its own, show how much the model learned from those 524,000 characters. That is the classic stability-versus-plasticity question, and it is still open.

### Path 1: the corpus run

The README starts the main run with `train.py read data/train --save --weights-dir weights --held-out data/val`. The shipped `config.yaml` sets the trunk to 0.1x, and the read command applies a controller that watches held-out loss and moves the learning rate in both directions. This is the path the probe describes, and it is the one with published numbers.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/references/mini-agi-training-progress.png" alt="mini-AGI training progress across 921 evaluations and 437.2M characters, with overall and per-subject held-out loss curves">
  <figcaption>Every sample round of the run to date, as published. Source: <a href="https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md">https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md</a>. Publisher/creator: Alexey Borsky (volotat/mini-AGI). License: <a href="https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE">https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE</a>. Attribution: Alexey Borsky, mini-AGI training progress chart, MIT License, pinned at commit efd4a168.</figcaption>
</figure>

### Path 2: reading your own files

The README's "Reading your own files" section is the shortest route to a personal model: `train.py read ~/notes --save`. Its flag table makes two promises that the pinned code does not keep.

First, it says **`--lr` defaults to 5e-5, below a training run**. In `train.py`, the default is read from `config.yaml`'s `training.lr`, and 5e-5 is only the fallback when that key is missing. The shipped config sets `training.lr` to **3.0e-4**, and `minagi/config.py` loads that file from the repository root. So with the repository as published, reading your notes starts from the same base rate as the corpus run unless you pass `--lr` yourself.

Second, the table lists `--mix ""` to skip the before/after scoring. The `read` subcommand defines no `--mix` argument; only the `stream` subcommand does. The before/after scoring on `read` is controlled by `--held-out`, which defaults to `data/val`, and it runs only if that folder exists.

When it does run, the check is a good one. `read` prints a warning when held-out loss after reading exceeds the before value by more than two standard errors, and nothing is saved without `--save`.

### Path 3: chatting with serve.py

The chat server is where the Motivation promise lives, and its docstring is blunt: **"IT LEARNS WHILE YOU TALK TO IT, and this CHANGES THE WEIGHTS ON DISK."** The model takes an optimiser step every `training.chunk` characters of the conversation. Learning is the default: `--no-learn` is the opt-out, and `--learn-lr` defaults to 3e-4. The live learner does receive the configured 0.1x trunk multiplier.

The cost is where the file is most candid. `minagi/live.py` says that learning from a conversation **"IS NOT MEASURED IN THE CURRENT REGIME."** In an earlier, denser variant, it cost around **+0.65 nats on held-out against +0.02 for real documents** of the same length. Whether the cost is still material now is, in the file's own capitals, UNKNOWN. It also says a smaller learning rate is not the fix, because the model is partly learning from its own output.

I searched both files for a held-out evaluation, revert, or forgetting check. **Neither `serve.py` nor `minagi/live.py` contains one**; the only matches are docstring mentions. So the path the README pitches most warmly is the one path with no measurement and no guard.

### What the scaling numbers can tell you

The README reports **2.450 bits per byte on the PG19 test split**, a fitted power law of `L ∝ D^-0.243` with R² 0.97 on its own held-out data, and a reading rate of about 804 characters per second at 437.2M characters read. The days-to-target table built on that fit is a forecast from one ongoing run, and the author presents it as such.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/references/mini-agi-data-scaling.png" alt="mini-AGI data scaling chart: PG19 bits per byte against data with a fitted power law, plus per-subject slopes">
  <figcaption>Data scaling with the fitted power law, as published. Source: <a href="https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md">https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md</a>. Publisher/creator: Alexey Borsky (volotat/mini-AGI). License: <a href="https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE">https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE</a>. Attribution: Alexey Borsky, mini-AGI data scaling chart, MIT License, pinned at commit efd4a168.</figcaption>
</figure>

## 💡 Innovation: Treat each learning path as its own claim

The useful move is to stop reading "continual learning without forgetting" as one property of the model. In mini-AGI it is three paths with three evidence levels.

![Original diagram of mini-AGI's three learning paths and their evidence levels](/assets/img/posts/2026-09-23-mini-agi-forgetting-fix-reading-not-chat/mini-agi-three-learning-paths.svg)

| Path | Default as shipped | Evidence in the repository |
|---|---|---|
| Corpus run (`train.py read data/train`) | trunk at 0.1x, rate steered by held-out loss | published chess probe and benchmarks |
| Your files (`train.py read ~/notes --save`) | rate 3.0e-4 from config, not the documented 5e-5 | per-read check, only if `data/val` exists |
| Chat (`serve.py`) | learning on, rate 3e-4, writes to disk | none; the code calls the cost unknown |

If I were wiring this into a personal assistant or a studio tool today, I would start from that table:

- **Serve with `--no-learn`** until chat learning has its own held-out readout. The code itself says the cost is unknown.
- **Pass `--lr` explicitly** when reading your own files, for example the 5e-5 the README intends, and point `--held-out` at a folder that actually exists.
- **Copy the weights directory before any `--save`.** The README says the directory is the model, so a copy is your only undo.
- **Score held-out loss after every learning session**, and treat changes smaller than 0.03 as noise, as the README advises.
- **Keep product memory outside the weights** until the chat path is measured. The [Fable 5 self-improving agent system post](/posts/fable-5-self-improving-agent-system/) covers that design: the model stays fixed and the system around it improves. The [context engineering and agent memory post](/posts/context-engineering-agent-memory-design/) covers the external-memory side.

None of this argues against the project. It argues for measuring the chat path with the same care the author gave the corpus path.

## 🎯 Key Takeaways

- mini-AGI's no-forgetting result is a corpus-reading probe: 524,000 characters of chess moved the seven unread subjects by **+0.0067 nats** with the trunk at 0.1x.
- By the README's own 0.03 threshold, that probe also shows only a 0.013-nat gain on the subject being read, so how much the model learns during such a read is still open.
- **`serve.py` learns from chat by default and writes weights to disk**, while `minagi/live.py` says that cost is not measured and neither file has a held-out check.
- The personal-file path runs at **3.0e-4 under the shipped config**, not the README's 5e-5, and the README's `--mix ""` flag does not exist on `read`.
- For a personal or studio assistant, serve read-only, set `--lr` explicitly, keep a real held-out folder, and back up the weights directory before saving.

### Limitations and trade-offs

- I read the code and the README at one commit. I did not train, serve, or chat with the model, and the weights are not published.
- The probe numbers and charts are the author's self-reported results from one run.
- Applying the README's 0.03 rule to within-run probe deltas is my interpretation; a within-run comparison may have less noise than two separate runs.
- The repository is days old and changing quickly, so these defaults may change after the pinned commit.

## 🤔 New Questions

- What does an hour of chat do to held-out loss under the current streaming regime, compared with the +0.65 nats of the earlier variant?
- Can the forgetting probe be rerun with the trunk at 0.2x or 0.3x to map how much learning the 0.1x setting gives up?
- Should the chat server refuse to save when held-out loss rises beyond the noise floor, the way `read` already warns?
- For a studio assistant, is a slowly learning local model better than a frozen model with a growing external memory?

## References

### Primary repository evidence

- [mini-AGI at pinned commit `efd4a168`](https://github.com/volotat/mini-AGI/tree/efd4a16822d7e46008847186df750ea3ff9fa00b)
- [README at the pinned commit](https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/README.md)
- [`serve.py`](https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/serve.py)
- [`minagi/live.py`](https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/minagi/live.py)
- [`train.py`](https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/train.py)
- [`config.yaml`](https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/config.yaml)
- [`minagi/config.py`](https://github.com/volotat/mini-AGI/blob/efd4a16822d7e46008847186df750ea3ff9fa00b/minagi/config.py)
- [MIT License at the pinned commit](https://raw.githubusercontent.com/volotat/mini-AGI/efd4a16822d7e46008847186df750ea3ff9fa00b/LICENSE)

### Related reading

- [Fable 5 self-improving agent system](/posts/fable-5-self-improving-agent-system/)
- [Context engineering and agent memory design](/posts/context-engineering-agent-memory-design/)
