---
title: "TradingAgents and LibreChat Are Not Drop-In Replacements"
description: "A pinned-commit read of TradingAgents and LibreChat: what adopting open source actually transfers, what it never removes, and why these two are not substitutes."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, open-source, licensing, mcp]
date: 2026-09-13 23:12:40 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/responsibility-transfer.svg
  alt: "Two-column diagram: what adopting an open-source AI stack transfers (who runs the software, who maintains the deployment, where data sits, the licence line item) against what it does not remove (model API calls, data-provider access, hosting and uptime, upgrades and security, judging output quality), with TradingAgents and LibreChat shown at the bottom as answers to different jobs"
---

![Two-column diagram contrasting what adopting an open-source AI stack transfers with what it leaves on the adopting team, with TradingAgents and LibreChat shown as answers to different jobs](/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/responsibility-transfer.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every claim was re-read from the pinned repository commits rather than from the social post that surfaced them.

> **Not financial advice:** This article is a documentation audit of two repositories. The reference images reproduced below are example outputs shipped inside the TradingAgents README, and two of them render a directional call on a named security. They are documentation examples, not results produced or endorsed here. Nothing in this article is financial, investment, or trading advice, and no security is recommended.

## 🤔 Curiosity: What does "replace the software you pay for" actually move?

A post on X put a list of GitHub repositories in front of me with a simple promise: a lot of these projects "can straight-up replace the software you're paying monthly for." Its first two entries were [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents) and [danny-avila/LibreChat](https://github.com/danny-avila/LibreChat).

That post is discovery context for this audit and nothing more. It is not a source, it is not quoted as authority for any technical claim here, and it is editable after the fact — at capture time the page's own title metadata carried an older, shorter revision than the one the page rendered. Everything below was re-read from the two repositories at pinned commits: TradingAgents at `be952b8e` and LibreChat at `e18606e5`.

The question worth spending an evening on is not whether either project is good. It is narrower and more useful before a migration meeting: **when you adopt one of these, what moves, and what quietly stays with you?**

Both READMEs answer that question themselves, in their own words, and the answers do not match the replacement framing that carried them to me.

## 📚 Retrieve: Reading both repositories against the claim made for them

### The discovery link, scoped precisely

I checked the link structure before reading anything else, because a list post's credibility is its links. One URL turned out to serve two different revisions of the same post at the same moment, and the difference between them matters more than either revision does.

The page's `<title>` metadata carried an older revision whose text stops after three entries and contains exactly three `t.co` shorteners. Resolved:

| Shortener in the captured title metadata | Resolves to |
|---|---|
| `t.co/Nz1JbK3DkR` | `https://github.com/TauricResearch/TradingAgents` |
| `t.co/L5kL4AwV4w` | `https://github.com/danny-avila/LibreChat` |
| `t.co/5T4f3qrb40` | `https://x.com/shanyanggm/status/2098941338297458746` |

The third one resolves to the post's own status URL. That is the whole observation: a shortener that returns to the post rather than leaving it. It says nothing about where the project named in that line actually lives.

The revision the page *renders* is an edited expansion, marked "Last edited 10:06 AM · Sep 13, 2026", and it carries ten shorteners — a different set from the three in the title metadata. Resolving all ten gives ten distinct GitHub repositories:

| # | Repository (owner/name) | Resolved URL |
|---|---|---|
| 1 | TauricResearch/TradingAgents | `https://github.com/TauricResearch/TradingAgents` |
| 2 | danny-avila/LibreChat | `https://github.com/danny-avila/LibreChat` |
| 3 | heygen-com/hyperframes | `https://github.com/heygen-com/hyperframes` |
| 4 | Fincept-Corporation/FinceptTerminal | `https://github.com/Fincept-Corporation/FinceptTerminal` |
| 5 | harry0703/MoneyPrinterTurbo | `https://github.com/harry0703/MoneyPrinterTurbo` |
| 6 | cloudflare/agentic-inbox | `https://github.com/cloudflare/agentic-inbox` |
| 7 | OpenBMB/VoxCPM | `https://github.com/OpenBMB/VoxCPM` |
| 8 | reconurge/flowsint | `https://github.com/reconurge/flowsint` |
| 9 | addyosmani/agent-skills | `https://github.com/addyosmani/agent-skills` |
| 10 | NangoHQ/nango | `https://github.com/NangoHQ/nango` |

Every cell in that table is a resolution target, in the order the anchors appear in the post. The one-line description the post attaches to each entry is deliberately absent: those lines reach an English reader through X's automatic translation, none of them was checked against the project it describes, and reprinting them here would launder a caption into a finding. Eight of these ten repositories were not opened in this run and nothing below should be read as an assessment of them.

Two things follow, and the first is a correction of the obvious inference. HyperFrames is linked in the rendered revision — `t.co/o0OnS8iJMG` resolves to `https://github.com/heygen-com/hyperframes` — so nothing here should be read as "the post never linked it". The entry that arrived without an external link arrived that way in one revision of an edited post, not in the revision the page renders. That repository already has its own commit-pinned audit on this site: [HyperFrames Measures "Same Video" in Decibels, Not Bytes](/posts/hyperframes-determinism-audit/).

The second is why this article goes deep on exactly two of the ten. TradingAgents and LibreChat are the two targets this run selected, and no earlier post here mentions either of them, so both are unexamined ground rather than a repeat. Being on the list is not what qualified them: a link's presence is evidence that someone published a link, and nothing more. Whether a repository suits a job you are paying for is a separate question, and it is the one the rest of this article works on.

### TradingAgents describes a research framework, not a trading product

The README's own framing is a firm, not a product: TradingAgents "is a multi-agent trading framework that mirrors the dynamics of real-world trading firms," deploying specialized LLM-powered agents "from fundamental analysts, sentiment experts, and technical analysts, to trader, risk management team."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/references/tradingagents-schema.png" alt="TradingAgents architecture diagram: four stacked data groups labelled Market, Social Media, News and Fundamentals feed a Researcher Team where Bullish and Bearish panels exchange Buy Evidence and Sell Evidence through a Discussion arrow, then a Trader sends a Transaction Proposal to a Risk Management Team of Aggressive, Neutral and Conservative reviewers, a Manager, and a final Execution box">
  <figcaption>The architecture figure the README places directly above its research-only disclaimer: four data groups on the left, a bull/bear discussion in the middle, then trader, risk reviewers, manager and execution &mdash; Image from TauricResearch/TradingAgents (Apache-2.0), commit be952b8e. Source: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md">https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md</a>. Publisher: TauricResearch (TauricResearch/TradingAgents). Licence: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

Immediately under that diagram sits the sentence a replacement framing tends to drop:

> TradingAgents framework is designed for research purposes. Trading performance may vary based on many factors, including the chosen backbone language models, model temperature, trading periods, the quality of data, and other non-deterministic factors. It is not intended as financial, investment, or trading advice.

The last clause is a link in the original, pointing at a separate disclaimer page. The project repeats the point later in its Reproducibility section, where it states that two runs of the same ticker and date can differ, that "Backtest results are not guaranteed to match any published figure", and that the right mental model is "a research scaffold for studying multi-agent analysis, not as a strategy with a fixed, replicable return."

A subscription product that a firm pays for monthly is normally bought because someone stands behind the output. This README explicitly does not.

### The roles are the surface you would be operating

The framework decomposes into named role groups, and the README illustrates each one. The Analyst Team is four specialists — Fundamentals, Sentiment, News, Technical — each producing a summary that later stages consume.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/references/tradingagents-analyst-team.png" alt="Four analyst cards from the TradingAgents README, each pairing a goal line with a Key Points Summary: Market cites RSI, ADX and Bollinger Bands, Social Media cites dated AAPL sentiment peaks, News cites global economic trends and sector insights, and Fundamentals cites an Apple Inc. financial analysis with liquidity and valuation flags">
  <figcaption>Four analyst roles, each with a goal line and a Key Points Summary; the Social Media card is dated to a 2024 window, which is a reminder that these are captured example outputs rather than live behaviour &mdash; Image from TauricResearch/TradingAgents (Apache-2.0), commit be952b8e. Source: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md">https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md</a>. Publisher: TauricResearch (TauricResearch/TradingAgents). Licence: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

Those summaries feed a Researcher Team that the README describes as "both bullish and bearish researchers who critically assess the insights provided by the Analyst Team," balancing gains against risk "through structured debates."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/references/tradingagents-researcher-debate.png" alt="Two facing researcher cards from the TradingAgents README labelled Bullish and Bearish, joined by two arrows marked Debate, one summarising an Apple investment outlook built on growth potential and the other summarising Apple investment risks including competitive challenges and valuation concerns">
  <figcaption>The bull/bear debate step, drawn as two opposed cards with Debate arrows in both directions &mdash; Image from TauricResearch/TradingAgents (Apache-2.0), commit be952b8e. Source: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md">https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md</a>. Publisher: TauricResearch (TauricResearch/TradingAgents). Licence: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

A Trader Agent then "composes reports from the analysts and researchers to make informed trading decisions."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/references/tradingagents-trader-decision.png" alt="A Trader card from the TradingAgents README whose goal is to evaluate and make decisions on market opportunities, beside a green decision panel reading BUY Apple Shares with a reasoning line about financials outweighing valuation and liquidity risks and a recommendation to buy for long-term growth">
  <figcaption>The trader step as the README illustrates it, ending in a decision panel with a one-line rationale; this is an example output shipped with the documentation, not a result measured here and not a recommendation &mdash; Image from TauricResearch/TradingAgents (Apache-2.0), commit be952b8e. Source: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md">https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md</a>. Publisher: TauricResearch (TauricResearch/TradingAgents). Licence: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

Finally a Risk Management team of three postures reviews the proposal and reports to a Portfolio Manager who, in the README's words, "approves/rejects the transaction proposal."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/references/tradingagents-risk-manager.png" alt="Three risk-analyst cards from the TradingAgents README labelled Risky, Neutral and Safe with their stated goals, an arrow marked Report, and a Manager card whose Key Points Summary reads Buy Recommendation for Apple">
  <figcaption>Risky, Neutral and Safe reviewers reporting into the manager step that approves or rejects the proposal; like the trader figure above, the summary text inside it is an example output shipped with the documentation, not a recommendation made or measured here &mdash; Image from TauricResearch/TradingAgents (Apache-2.0), commit be952b8e. Source: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md">https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md</a>. Publisher: TauricResearch (TauricResearch/TradingAgents). Licence: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

Read as an operations diagram rather than a feature list, that is five role groups per analysed ticker, several of whose members exist specifically to argue with each other. The debate is the method. It is also the workload.

### What the install actually asks you for

Installation is a source install: clone, create a Python 3.12 environment, `pip install .`. Docker is offered as an alternative, and its first step is telling: `cp .env.example .env  # add your API keys`, followed by `docker compose run --rm tradingagents`.

The keys are not optional decoration. The README's Required APIs section opens with "TradingAgents supports multiple LLM providers. Set the API key for your chosen provider," and then lists environment variables for OpenAI, Google, Anthropic, xAI, DeepSeek, Qwen, GLM, MiniMax and OpenRouter — plus `ALPHA_VANTAGE_API_KEY`, a market-data provider rather than a model one. The same section documents local and OpenAI-compatible endpoints, where "No key is needed for local servers," so the shape of the bill depends on which endpoint you configure; what does not change is that **you** configure it, and the cost lands on you in whichever form that choice takes.

The README's own CLI screenshot makes the workload legible in a way prose does not.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-tradingagents-librechat-self-hosting-audit/references/tradingagents-cli-news-run.png" alt="A terminal screenshot of the TradingAgents CLI: a Progress panel where the Market, Social and News analysts read completed, the Fundamentals Analyst reads in_progress and the research, trading, risk and portfolio rows all read pending, a Messages and Tools log of tool calls and reasoning steps, a long news analysis report, and a footer line reading Tool Calls 14, LLM Calls 13, Generated Reports 3">
  <figcaption>A partially completed run in the project's own CLI capture: three analysts finished, the fourth in progress, every downstream team still pending, and a footer counter reading Tool Calls 14, LLM Calls 13, Generated Reports 3 &mdash; Image from TauricResearch/TradingAgents (Apache-2.0), commit be952b8e. Source: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md">https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md</a>. Publisher: TauricResearch (TauricResearch/TradingAgents). Licence: <a href="https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

That footer is a documentation capture, not a measurement I took, and it is not a price. But it is the project's own illustration of what one analysis looks like in motion: thirteen model calls and fourteen tool calls recorded while four of the twelve agent rows in that capture have reached `completed` or `in_progress`, and every research, trading, risk and portfolio row still reads `pending`.

Where that work is billed depends on the endpoint, and the README draws the line itself. Configure a hosted provider and every call is charged to the credential you supplied, once per run, every run. Configure a local server and, in the README's words, "No key is needed for local servers" — an OpenAI-compatible endpoint needs one only if that endpoint requires it — so the same work is paid for in hardware, electricity and operator time instead of provider billing. Neither column is free; they are different ledgers.

### LibreChat unifies providers; it does not supply them

LibreChat's README describes the project in one sentence: it "is a self-hosted AI chat platform that unifies all major AI providers in a single, privacy-focused interface." The feature summary continues: "Beyond chat, LibreChat provides AI Agents, Model Context Protocol (MCP) support, Artifacts, Code Interpreter, custom actions, conversation search, and enterprise-ready multi-user authentication."

I am wording that list exactly as documented, because each item is a documented capability of the platform and not something this run exercised. Nothing here was installed, deployed or benchmarked.

The word doing the quiet work is *unifies*. The model-selection list is Anthropic, AWS Bedrock, OpenAI, Azure OpenAI, Google, Vertex AI and the OpenAI Responses API, with custom endpoints documented as "Use any OpenAI-compatible API with LibreChat, no proxy required." Those are providers you bring. The README also lists local and self-hostable options such as Ollama and Apple MLX, which is a genuine route to shrinking the provider bill — and a route that trades it for hardware you own and operate.

The deployment surface is documented with the same candour. The README lists proxy and reverse-proxy configuration, Docker and other deployment options, and a choice to "Use completely local or deploy on the cloud." Its Admin Panel is "Bundled with the Docker Compose stacks for one-command setup." Its resumable streams are described as production-ready and working "from single-server setups to horizontally scaled deployments with Redis."

Every one of those sentences is a feature to a reader and a duty roster to an operator. Horizontal scaling with Redis is a capability when you need it and a component to patch, monitor and back up from the day you enable it.

### The comparison nobody should be making

Here is the part the list framing obscures. These two repositories are not competitors, alternatives, or substitutes for each other. They answer different questions.

| | TradingAgents | LibreChat |
|---|---|---|
| Documented purpose | Multi-agent research framework mirroring a trading firm | Self-hosted chat platform unifying AI providers |
| What it replaces, honestly | A research workflow you would otherwise write yourself | The hosted chat front end, not the model behind it |
| Stated limits in its own docs | Research purposes; not financial, investment or trading advice; runs vary | Self-hosted, so deployment and operations are yours |
| What you must supply | Model provider keys and a data provider such as Alpha Vantage | Model providers, local or hosted, plus the hosting |
| Licence (source note) | Apache-2.0 | MIT |

Both were sizeable projects at retrieval — TradingAgents around 105,000 stars, LibreChat around 43,000 — and those retrieval-time counts say something about attention and nothing about whether either fits your job. Scoring them against each other is a category error. The only defensible comparison is each project against the specific job you are trying to stop paying for.

## 💡 Innovation: Open source moves the operator, not the bill

The useful reframing is a single sentence: **open source changes who runs and maintains an AI workflow; it does not by itself remove the model, data or hosting cost, and it does not remove the operational responsibility.**

That is not a criticism of either project. Both say it plainly in their own documentation — one by insisting on the word *research*, the other by putting *self-hosted* in its first line. The distortion happens downstream, in the retelling, where "free to install" becomes "free to run."

Three consequences follow for anyone drafting a migration proposal.

**The licence is the cheapest part of the decision.** Apache-2.0 and MIT are recorded here as source notes about what the repositories ship, and this article draws no legal conclusion beyond that. They tell you the software may be used and adapted. They say nothing about model spend, data-vendor contracts, uptime, or who answers when a run stops halfway through.

**Duties do not disappear when a vendor does; they change owner.** Authentication, upgrades, backups, and the security response were previously in a subscription. After adoption they are in your sprint. The team best placed to judge that is the one that would be on call, which is usually not the team drafting the proposal.

**Output quality becomes your problem too, and it is the expensive one.** A vendor's answer to "is this output any good?" is a support contract. TradingAgents' answer is explicit: runs of the same ticker and date can differ, and published backtest figures are not guaranteed to reproduce. That is intellectually honest, and it means evaluation is part of the adoption cost rather than an optional extra.

### A pre-migration checklist that survives contact with a list post

Before treating any repository as a replacement for something you pay for, answer these in writing:

1. **What exact job is being replaced?** Name the workflow, not the product category. "Our analysts' weekly research pass" is a job; "trading software" is not.
2. **Who supplies the models after the switch?** Hosted keys, a local runtime, or both — and who holds the budget for whichever it is.
3. **What non-model dependencies come with it?** Market data, news feeds, storage, a vector store, a queue. TradingAgents' `ALPHA_VANTAGE_API_KEY` is the visible tip of this.
4. **Who operates it on a bad day?** Name a person for upgrades, auth, backups and incident response, not a team.
5. **What does the project itself refuse to promise?** Read the disclaimer and the reproducibility section before the feature list. The strongest evidence about a project's limits is usually written by its maintainers.
6. **How will you judge the output?** Define the evaluation before the pilot, because after adoption nobody else is contractually obliged to care.
7. **Is this project even answering your question?** Two projects on the same list can be excellent and still be irrelevant to each other and to you.

Steps two and three are where the same running-cost question shows up one layer down: [ECC Retired Six MCP Servers Over a Tax Its Catalog Still Pays](/posts/ecc-context-tax-audit/) is an agent harness whose own connector policy argues that every default surface charges rent on each session. For the operational-responsibility half of the checklist, [CAO's Honest Trust Boundary and Its Phantom Auth Switch](/posts/cao-trust-boundary-audit/) shows what "self-hosted" hands back to the operator in a project that documents its boundary unusually well.

## 🎯 Key Takeaways

- TradingAgents at `be952b8e` states its own scope directly: a multi-agent framework "designed for research purposes" that "is not intended as financial, investment, or trading advice," with a Reproducibility section warning that runs vary and published backtest figures are not guaranteed to reproduce.
- Its install path is a Python 3.12 source install or Docker, and its Required APIs section expects operator-supplied model keys plus a data-provider key such as `ALPHA_VANTAGE_API_KEY`. On a hosted provider those calls bill to your credential; the README also documents local servers that need no key and OpenAI-compatible endpoints that need one only if the endpoint requires it, where the cost becomes hardware you run. The bill's shape is a configuration choice — not an absence.
- LibreChat at `e18606e5` describes itself as "a self-hosted AI chat platform that unifies all major AI providers," documenting Agents, MCP support, Artifacts, Code Interpreter, custom actions, conversation search and enterprise-ready multi-user authentication. Unifying providers is not supplying them, and self-hosting is not a hosted service with the price removed.
- The two projects answer different jobs, so comparing them as substitutes is a category error the list format invites. Compare each against the specific workflow you want to stop paying for.
- Licences are source notes here: Apache-2.0 for TradingAgents, MIT for LibreChat. They govern use of the code, not model spend, data contracts, uptime or the duty to evaluate output.
- The X post was discovery context only, and one URL served two revisions at once: the title metadata carried an older three-shortener revision whose third link resolved to the post's own status URL, while the rendered revision was an edited expansion with ten shorteners resolving to ten distinct repositories, HyperFrames among them. Reading a list post means recording which revision you read.

## 🤔 New Questions This Raises

- If a project's own README carries a research-only disclaimer, what is the honest way to present it internally to a stakeholder who arrived via a "replace your subscription" list?
- What is the smallest useful pilot that measures the running cost of a multi-agent workflow such as TradingAgents, without treating either the pilot or the framework as a strategy?
- For a self-hosted chat platform, which duties genuinely shrink relative to a hosted product, and which merely change name? Backups and auth are obvious; model routing and evaluation are less so.
- List posts are now a common discovery channel for engineering tooling. What minimum check should an engineer run on one — link resolution, licence, last commit, disclaimer — before it reaches a planning document?

## Limitations

This is a documentation and metadata audit at two pinned commits, retrieved 2026-09-13. I did not install, configure, deploy, benchmark or run either project, so nothing here is a claim about performance, reliability, output quality, security posture, or cost in any currency. This article makes no investment recommendation of any kind: the Apple buy calls visible in two of the reference images are example outputs shipped inside the upstream TradingAgents README, reproduced as documentation evidence and not as financial, investment, or trading advice. Every capability statement about LibreChat is reported as documented, not as verified behaviour. The TradingAgents CLI counters (`Tool Calls: 14 | LLM Calls: 13 | Generated Reports: 3`) come from a screenshot the project ships in its README; they describe that capture and are not a measurement, a benchmark or a price. Repository star and fork counts are retrieval-time values from the GitHub API and move continuously. Licence statements describe the `LICENSE` files at the pinned commits and the SPDX identifier the GitHub API reports; they are source notes, not legal advice, and any specific downstream use needs its own review. The disclaimer page linked from the TradingAgents README was not fetched, so that claim is scoped to the sentence and link as written in the README. The X post is editable: the three-shortener structure described above is the revision exposed in the page title metadata at capture time, while the revision the page rendered carried an edit marker and ten shorteners, which were resolved individually to the ten repository URLs listed above. The post's own one-line descriptions of those ten projects were not checked against the projects and are not reproduced in this article. The eight repositories other than TradingAgents and LibreChat appear only as resolved URLs; none of them was read, audited or assessed in this run. Both repositories continue to move, and the two commits pinned here are a snapshot, not a state.

## References

### Primary sources (pinned)

- [TauricResearch/TradingAgents @ be952b8e](https://github.com/TauricResearch/TradingAgents/tree/be952b8eccb49720509af544c6675233bc1f10d0) — audited tree
- [TradingAgents README](https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/README.md) — framework description, research-only disclaimer, roles, installation, Required APIs, Reproducibility
- [TradingAgents LICENSE](https://github.com/TauricResearch/TradingAgents/blob/be952b8eccb49720509af544c6675233bc1f10d0/LICENSE) — Apache-2.0 text
- [danny-avila/LibreChat @ e18606e5](https://github.com/danny-avila/LibreChat/tree/e18606e5ce739af2d39a0d3c41bedb164ac69cb5) — audited tree
- [LibreChat README](https://github.com/danny-avila/LibreChat/blob/e18606e5ce739af2d39a0d3c41bedb164ac69cb5/README.md) — self-hosted platform description, feature surface, custom endpoints, deployment options
- [LibreChat LICENSE](https://github.com/danny-avila/LibreChat/blob/e18606e5ce739af2d39a0d3c41bedb164ac69cb5/LICENSE) — MIT text
- [GitHub API: TauricResearch/TradingAgents](https://api.github.com/repos/TauricResearch/TradingAgents) — repository metadata at retrieval
- [GitHub API: danny-avila/LibreChat](https://api.github.com/repos/danny-avila/LibreChat) — repository metadata at retrieval
- [LibreChat documentation](https://www.librechat.ai/docs) — the docs entry point the README links for feature detail

### Discovery context (not evidence)

- [The X post that surfaced both repositories](https://x.com/shanyanggm/status/2098941338297458746) — a list framing open-source projects as replacements for paid software

### Related on this site

- [ECC Retired Six MCP Servers Over a Tax Its Catalog Still Pays](/posts/ecc-context-tax-audit/)
- [CAO's Honest Trust Boundary and Its Phantom Auth Switch](/posts/cao-trust-boundary-audit/)
- [SkillHub's Security Scanner Blocks on Crash, Not on Verdict](/posts/skillhub-observer-scanner-audit/)
- [HyperFrames Measures "Same Video" in Decibels, Not Bytes](/posts/hyperframes-determinism-audit/) — the third repository on the same list, audited separately at its own pinned commit
