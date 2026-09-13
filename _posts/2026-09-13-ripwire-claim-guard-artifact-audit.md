---
title: "ripwire Guards Its Gate Count in Source, Not in the PDF"
description: "Source Audit of redhat-et/ripwire at 1cf3086e: the gate count reads 612 in three guarded source files and 606 in the committed showcase deck the README links."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, ci, documentation, mcp, open-source]
date: 2026-09-13 12:57:05 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-13-ripwire-claim-guard-artifact-audit/claim-guard-boundary.svg
  alt: "Diagram of ripwire's gate-count guard at commit 1cf3086e: the loop in test/regression.sh names 612, three source files rewritten by docs/gatecount_build.py and asserted by test/manifestcheck.sh all read 612, and two committed build artifacts outside that family still read 606"
---

![Where ripwire's gate-count guard stops: the loop names 612, the three guarded source files say 612, and the two committed build artifacts still say 606](/assets/img/posts/2026-09-13-ripwire-claim-guard-artifact-audit/claim-guard-boundary.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every count was re-derived from the pinned commit 1cf3086e before publication.

## 🤔 Curiosity: If a project gates its own numbers, where can one still go stale?

[redhat-et/ripwire](https://github.com/redhat-et/ripwire/tree/1cf3086e8f7c1eb67368bca90a86e5438d911517) does not ask you to take its figures on trust, and it says so loudly. It is a C++23 CLI and MCP server the project calls zero-dependency — every dependency is vendored in-tree — and it hands a coding agent a ranked call graph instead of letting it grep around. Its pitch is not only speed. It is that every number it publishes has a committed instrument behind it. The repository is Apache-2.0, was created on 2026-07-29, and at retrieval carried 1,928 stars with a push timestamped 2026-09-13T03:07:28Z.

That is an unusual promise, and unlike most promises it is checkable. So I checked one number: how many gate scripts the suite runs. It appears on the front page, in the evaluation docs, and on the showcase deck. The deck prints it directly above the line "the COUNT itself is gated against the runner's own loop, so it cannot go stale quietly."

At commit `1cf3086e` that sentence is true of three files and false of two.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-ripwire-claim-guard-artifact-audit/references/showcase-preview.png" alt="Three slides from the ripwire showcase deck rendered side by side: a head-to-head competitor table with a 1.46x margin panel, a ten-everyday-moments token-cost table, and a calibration slide titled The calibration that disqualified a family">
  <figcaption>The deck preview the README uses as the link to <code>present/ripwire-showcase.pdf</code>; the PDF behind this image is the artifact that still states 606 &mdash; Image from redhat-et/ripwire (Apache-2.0), commit 1cf3086e. Source: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md">https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md</a>. Publisher: redhat-et (redhat-et/ripwire). Licence: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

## 📚 Retrieve: Counting the same number on five surfaces

I cloned the tree at `1cf3086e`, counted the authority myself, read each stated surface at its line, and extracted the text of both committed binaries. Every figure below is a recount, not a quotation of the project's own summary.

### The authority is one line

The gate list is a single `for` loop. At `test/regression.sh:271`, `for _g in a9disclosurecheck abicheck accessshapecheck …` carries **612** whitespace-separated names. That line is the definition of the number; everything else is a restatement of it.

### The three surfaces that are rewritten

`docs/gatecount_build.py:38` declares the rewrite targets exactly: `SITES = ( 'README.md', 'docs/EVALS.md', 'present/deck5_ripwire_build.js' )`. The generator derives the count from the same loop and rewrites every marked site, so the number is no longer hand-written in those files. `test/manifestcheck.sh:143` then asserts the same three files independently, with `gateCountSites=( "docs/EVALS.md" "README.md" "present/deck5_ripwire_build.js" )`.

There are eight marked sites across those three files, and all eight read 612 at the pinned commit: `README.md:1800` and `:1802`; `docs/EVALS.md:24`, `:5837` and `:6849`; and `present/deck5_ripwire_build.js:1071`, `:1095` and `:1345`. Each carries a `<!-- gatecount -->` or `// gatecount` marker so the generator can find it — `test/gatecountcheck.sh:5` and `test/manifestcheck.sh:136` both say eight.

Two derivations of one number from one loop is deliberate redundancy, and it holds for seven of those eight. The generator recognises three spellings; `manifestcheck.sh:145` calls its own scan "BOTH spellings" and implements two of them. The third — `(?<=loop in \`test/regression\.sh\` names )[0-9]+` — is used at exactly one site, `docs/EVALS.md:6849`, so that line is written by the generator and checked only by the generator's own `--check`, which `test/gatecountcheck.sh:51` shells out to. One number, one derivation, at the site nobody quotes.

Line 1095 of the generator is the one worth reading in full:

```js
stat(s, "612", "gate scripts named by test/regression.sh — and the COUNT itself is gated against the runner's own loop, so it cannot go stale quietly", // gatecount
```

### The two surfaces that are not

`present/ripwire-showcase.pdf` and `present/ripwire-showcase.pptx` are committed build artifacts of that generator. The README links the PDF twice on the way in: from the badge row at `README.md:8`, as a `slides` badge labelled "the showcase deck", and at `README.md:798`, where the deck-preview image above is itself an anchor to the PDF.

Running `pdftotext` over the committed PDF gives **606 gate scripts** at two places, and at the stat slide the figure `606` sits immediately above that same "so it cannot go stale quietly" label. `unzip -p 'ppt/slides/*.xml'` over the PPTX matches `606 gate scripts` on slides 24 and 32; slide 25 carries `606` as a standalone stat figure with its label in a separate run, which is the same split-argument shape the prose spelling cannot see. On the deck's "Every claim, and the command that re-derives it" slide, the row reads `606 gate scripts` beside `bash test/manifestcheck.sh` — a claim naming an instrument that did not produce it.

### The artifact was right when it was built

This is not sloppiness, and the timeline says so. Asking the GitHub API which commit last touched each path at `1cf3086e`:

| Path | Last changed by | Committed |
|---|---|---|
| `present/ripwire-showcase.pdf` | `29cc420a` | 2026-09-12T17:04:23Z |
| `present/ripwire-showcase.pptx` | `29cc420a` | 2026-09-12T17:04:23Z |
| `present/deck5_ripwire_build.js` | `63f62630` | 2026-09-12T23:39:33Z |
| `test/regression.sh` | `63f62630` | 2026-09-12T23:39:33Z |

Fetching `test/regression.sh` at `29cc420a` and counting the loop again returns **606**, and `README.md` at that commit also says 606. The deck was accurate at the moment it was exported. Six hours and thirty-five minutes later the loop grew by six, the generator and the three source files moved together, and the two binaries stayed behind. The drift did not come from a wrong number being typed. It came from a correct number being frozen into a file the rewrite does not reach.

`present/README.md` explains why the freeze is possible: the rebuild is a local manual step — `npm install`, `node deck5_ripwire_build.js`, then `soffice --headless --convert-to pdf` or a PowerPoint export. Neither `.github/workflows/ci.yml` nor `release.yml` mentions the deck, the pptx, LibreOffice or the `present/` directory, so no job regenerates them on push.

### The suite already knows how to read the artifact

The most interesting part is that the capability is not missing. `test/deckcheck.sh` states the boundary as a design decision in its header: the built artifacts "are NOT scanned (same rule as docs/COMMANDS.md: gate the generator, not its output) — and they cannot be, being binary."

A sibling gate in the same suite disagrees with that last clause. `test/ripwirepubliccheck.sh:106–134` loops over `present/ripwire-showcase.pdf` and `present/ripwire-showcase.pptx`, extracts their text with `pdftotext` and `unzip -p 'ppt/slides/*.xml'`, and greps five scrub classes — home paths, temp paths, internal document names, internal document headings and e-mail addresses — over what it extracts. When the extractor is absent it prints `SKIP … (NOT a pass)` rather than passing quietly, and a mutation control feeds each class a planted string to prove the grep is not inert.

So the artifacts are opened, decoded and searched on every regression run. They are searched for leaked filesystem paths, not for a stale count. All five gates involved — `manifestcheck`, `gatecountcheck`, `deckcheck`, `readmedriftcheck` and `ripwirepubliccheck` — are members of the very loop whose length is at issue.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-ripwire-claim-guard-artifact-audit/references/graph-uncertainty.png" alt="A close crop of a ripwire call graph showing solid and dashed call edges side by side, with dashed shafts marking calls the resolver could not pin to a single target">
  <figcaption>Dashed shafts are the labelled-guess convention the project leans on: an edge it could not resolve is drawn as unresolved rather than dropped &mdash; Image from redhat-et/ripwire (Apache-2.0), commit 1cf3086e. Source: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md">https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md</a>. Publisher: redhat-et (redhat-et/ripwire). Licence: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

### This exact drift has reached a public PDF before

`test/manifestcheck.sh` carries its own history in a comment, and it is unusually candid. The file list was widened on 2026-09-06 "for the third instance of exactly the drift the paragraph above describes", and the instance it names is this one:

> while the loop stood at 542 the deck's own "every claim, and the command that re-derives it" slide said **451**, in a row that NAMES THIS GATE as the command that re-derives it — a claim citing its own instrument, that the instrument had never read. The deck shipped that way through a public PDF.

The fix was to add the generator to the scanned family, then on 2026-09-10 to reconcile the whole thing with `docs/gatecount_build.py` so the number is written by a derivation rather than by hand. Both changes were correct. Both were applied to the generator. The published artifact was left where it was.

### What else the tree publishes about itself

Two more committed files are worth naming, because they are the reason this audit could be done from the outside at all.

`.ripwire_quality_acks` is a suppression ledger: 1,270 `ack` lines, each recording a quality finding that "stays suppressed until it worsens past its acked magnitude", with a reason written out in prose. The classes are led by `short-horizon-churn` (422), `api-surface:new-symbol` (202), `api-surface` (148), `verbosity` (135), `duplication` (134) and `complexity` (121). That ledger is what makes the project's own quality lens checkable from outside: the suppressions are readable without running anything.

`.ripwire_notes` is a field-notes file, and one of its two entries is now stale in an instructive direction. Dated 2026-08-23, it warns that "README.md's single '&#60;N&#62; gate scripts' claim (~line 1305) is NOT enforced &mdash; the derived-vs-stated sibling loop here covers docs/EVALS.md only." The 2026-09-06 widening closed that gap; `README.md` has been in `gateCountSites` since. The note is a dated working record rather than a published claim surface, so it is stale rather than wrong — but it shows the ledger habit cuts both ways, and that a hand-maintained note is itself a surface nothing re-derives.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-ripwire-claim-guard-artifact-audit/references/graph-cx.png" alt="A ripwire HTML call graph of Django migration autodetector code: 120 nodes and 183 call edges, nodes coloured by cyclomatic complexity on a five-stop scale, module outlines drawn as translucent regions">
  <figcaption>The product itself: a ranked call graph over 120 of 607 symbols, with the legend naming the root, ranker and top-k that produced it and the rules file saved beside it &mdash; Image from redhat-et/ripwire (Apache-2.0), commit 1cf3086e. Source: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md">https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md</a>. Publisher: redhat-et (redhat-et/ripwire). Licence: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

## 💡 Innovation: A drift gate's blast radius is its file list, not its idea

The useful lesson here is not "ripwire has a bug". Six is a small delta on a number no reader will act on, and the project caught this failure mode twice already without anyone outside noticing. The lesson is structural, and it generalises to any repository that publishes a derived figure.

**A claim-drift gate protects the population it enumerates.** ripwire's own header comments make this point better than I can: a glob that matches nothing is silent, a real file no glob covers sits unscanned, and both look green. The gate-count family was widened from one file to its siblings, then to the number's siblings across documents. The next boundary was never a document at all — it was the format. `docs/gatecount_build.py` rewrites text it can parse; a PDF and a PPTX are outputs of that text, and outputs are not in `SITES`.

**"Gate the generator, not its output" is sound only when the output is not itself published.** For `docs/COMMANDS.md`, where the rule came from, that holds. For a deck that ships as a committed binary, linked from the badge row of the front page, the output *is* the surface a reader consumes — often before the README. At that point the artifact is a claim, and it needs either a gate or a build step.

**The cheapest fix is the one the repository already owns.** `ripwirepubliccheck.sh` proves the extraction path works and already runs inside the regression loop. Adding the two artifacts to the gate-count comparison would be one more arm over text the suite is already decoding. The alternative — rebuilding the deck in CI so the binary cannot lag its source — is stronger but needs LibreOffice in the runner, which is a real cost for a repository whose whole identity is that a clone builds with the network unplugged.

**And a dated ledger is not a gate.** `.ripwire_notes` recorded a gap correctly, and the gap was closed by someone reading it. That is a good outcome and an unreliable mechanism. If a note describes an enforcement hole, the note's own staleness is the next hole.

For the mirror image of this problem — a headline number with no recountable artifact at all, rather than an artifact that recounts to the wrong value — see [Gensee Crate's Defense Rate Is the One Number You Cannot Recount](/posts/gensee-crate-evidence-tier-audit/). ripwire is several floors above that baseline; this audit is only possible because the instruments are committed.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-ripwire-claim-guard-artifact-audit/references/graph-lens-cx-churn.png" alt="The same ripwire call graph twice, above coloured by cyclomatic complexity and below coloured by git commit count, with most nodes sitting in a different colour band between the two views">
  <figcaption>Two lenses over one graph; the quality lens is the surface whose findings the committed suppression ledger records &mdash; Image from redhat-et/ripwire (Apache-2.0), commit 1cf3086e. Source: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md">https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md</a>. Publisher: redhat-et (redhat-et/ripwire). Licence: <a href="https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

## 🎯 Key Takeaways

- At `1cf3086e`, the loop in `test/regression.sh:271` names **612** gate scripts; all eight marked sites across `README.md`, `docs/EVALS.md` and `present/deck5_ripwire_build.js` agree at 612, and the committed `ripwire-showcase.pdf` and `.pptx` both say **606**.
- The artifacts were correct when exported: at `29cc420a` the loop named 606 too. The gap opened six hours and thirty-five minutes later, at `63f62630`, and the binaries are rebuilt by hand rather than by CI.
- The guarded family is defined by file, not by claim: `docs/gatecount_build.py:38` and `test/manifestcheck.sh:143` both list the same three source paths, and build outputs are not among them. Within those files the redundancy is also uneven — `manifestcheck` implements two of the generator's three spellings, so `docs/EVALS.md:6849` has a single derivation rather than two.
- `test/deckcheck.sh` states the artifacts "cannot be" scanned "being binary", while `test/ripwirepubliccheck.sh:106–134` extracts and greps both of them — the capability exists, it is just pointed at leaked paths instead of stale counts.
- If you publish a built artifact, treat it as a claim surface. Gate the file a reader opens, not only the file a generator reads.

## 🤔 New Questions This Raises

- What is the right default for committed build artifacts in a claims-disciplined repository: regenerate them in CI, gate their extracted text, or stop committing them and attach them to releases instead?
- `ripwirepubliccheck.sh` skips loudly when `pdftotext` is missing. Should a claim gate over binaries be allowed to skip at all, or should the extractor become a hard prerequisite of the suite?
- The suppression ledger's 1,270 entries are readable by anyone. Is there a point where a standing-suppression count becomes its own published metric, gated like the others?
- ripwire's drift class has now been caught three times by widening a file list. Is there a derivation that enumerates claim surfaces automatically — say, every tracked file whose extracted text matches a registered claim pattern — rather than by hand?

## Limitations

This is a static audit of the pinned tree at `1cf3086e`, retrieved 2026-09-13. I did not build the project, run its gate suite, or execute the MCP server, so I make no claim about whether the suite passes today or about any performance or token figure the project publishes — only about which surfaces state the gate count and what each of them says. The 606/612 comparison is scoped to the three spellings the project's generator recognises plus a whole-tree grep for `[0-9]+ gate scripts`; my first pass used only the two spellings `manifestcheck.sh` implements and missed `docs/EVALS.md:6849`, which is the same enumeration failure this article is about. Remaining matches are historical records or subset measurements and are correctly not rewritten: `CHANGELOG.md:1380`, `CHANGELOG.md:1586` and both hits in `bench/recalleval/snapshot.mdpack`, along with a comment in `test/det-gate.sh:11` that states a different subset ratio I did not attempt to reconcile. The statement that no CI job rebuilds the deck is scoped to the two workflow files present at this commit. PDF text extraction depends on `pdftotext`; the PPTX figures come from the raw slide XML. Repository metrics are retrieval-time values from the GitHub API. A rebuild of the deck — plausibly before you read this — closes the specific gap while leaving the structural point intact, and the project's track record suggests it will.

## References

### Primary sources (pinned at `1cf3086e`)

- [redhat-et/ripwire @ 1cf3086e](https://github.com/redhat-et/ripwire/tree/1cf3086e8f7c1eb67368bca90a86e5438d911517) — audited tree
- [test/regression.sh](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/test/regression.sh) — the authoritative gate loop
- [docs/gatecount_build.py](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/docs/gatecount_build.py) — the rewrite generator and its `SITES`
- [test/manifestcheck.sh](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/test/manifestcheck.sh) — derived-vs-stated assertion and the 451 incident
- [test/deckcheck.sh](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/test/deckcheck.sh) — "gate the generator, not its output"
- [test/ripwirepubliccheck.sh](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/test/ripwirepubliccheck.sh) — arm 2b, which extracts both artifacts
- [present/deck5_ripwire_build.js](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/present/deck5_ripwire_build.js) — deck generator, line 1095
- [present/README.md](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/present/README.md) — the manual rebuild path
- [present/ripwire-showcase.pdf](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/present/ripwire-showcase.pdf) — the linked artifact
- [README.md](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/README.md) — badge row, deck link, gate-count lines
- [docs/EVALS.md](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/docs/EVALS.md) — the second stated surface
- [.ripwire_quality_acks](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/.ripwire_quality_acks) — the suppression ledger
- [.ripwire_notes](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/.ripwire_notes) — the field-notes entry
- [THIRD_PARTY.md](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/THIRD_PARTY.md) — the vendored dependency set
- [LICENSE](https://github.com/redhat-et/ripwire/blob/1cf3086e8f7c1eb67368bca90a86e5438d911517/LICENSE) — Apache-2.0

### Comparison point

- [test/regression.sh @ 29cc420a](https://raw.githubusercontent.com/redhat-et/ripwire/29cc420aa4a5af35cf396368b951ec31149e4114/test/regression.sh) — the loop at the commit that last rebuilt the artifacts
- [GitHub API: redhat-et/ripwire](https://api.github.com/repos/redhat-et/ripwire) — repository metadata at retrieval

### Related on this site

- [Gensee Crate's Defense Rate Is the One Number You Cannot Recount](/posts/gensee-crate-evidence-tier-audit/)
- [MetaHarness Advertises Witness Signing Its Bridges Never Export](/posts/metaharness-witness-reachability-audit/)
- [diagram-design Hash-Locks Its Screenshots, Not Its Storefront](/posts/diagram-design-drift-audit/)
