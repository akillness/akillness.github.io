---
title: "open-code-review protects Octave only if you type a space"
description: "Alibaba's open-code-review sniffs .m files to separate Objective-C from MATLAB. Five of its twelve signals begin with #, which Octave also treats as a comment character."
date: 2026-09-18 11:30:00 +0900
categories: [AI, Agents]
tags: [code-review, source-audit, go, static-analysis]
image:
  path: /assets/img/posts/2026-09-18-open-code-review-octave-sniff-space-audit/sniff-decision-path.svg
  alt: "Decision path for a .m file in open-code-review: the glob layer maps it to matlab.md, the sniffer reads the first non-blank line, and a prefix match rewrites the result to objc.md."
---

## 🤔 Curiosity

A file extension is a weak signal, and `.m` is the weakest of all. MATLAB, Octave, and Objective-C all use it. Any review tool that maps extensions to rule sets has to decide what a `.m` file is before it can say anything useful about it.

[open-code-review](https://github.com/alibaba/open-code-review), Alibaba's hybrid code-review tool, decides this with a content sniff. At commit `438a5c2` the repository carries 35,162 stars, an Apache-2.0 license, and a first commit dated 2026-05-18. Its `internal/config/rules` package holds a glob table, 52 per-language rule documents, and one small decorator whose entire job is the `.m` problem.

The decorator is unusually well commented. It explains which prefixes count as Objective-C, and it explains one thing it deliberately refuses to do: treat a bare `#` as an Objective-C signal, because Octave uses `#` for comments and a `.m` Octave file would be misfiled. The test file repeats the reasoning and asserts it.

So the question is narrow and answerable from source: does the prefix list actually deliver the protection its comment promises?

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-open-code-review-octave-sniff-space-audit/references/ocr-highlights-en.png" alt="open-code-review feature highlight banner listing hybrid deterministic and LLM review, line-level comments, and multi-language rules.">
  <figcaption>Feature highlights from the project README. Source: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/README.md">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/README.md</a> · License: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE</a> · alibaba/open-code-review Contributors · Image from alibaba/open-code-review at 438a5c2, Apache-2.0.</figcaption>
</figure>

## 📚 Retrieve

Resolution happens in two layers, and reading them in order matters.

The first layer is a plain glob table in `internal/config/rules/system_rules.json`. It maps `**/*.m` to `matlab.md` and `**/*.mm` to `objc.md`. So by default every `.m` file in a diff is reviewed as MATLAB.

The second layer is `sniffer.go`. It decorates the system layer — not the outermost resolver — so that user-configured rules keep outranking it. For a `.m` path it reads the first non-blank line and, if that line looks like Objective-C, returns `objc.md` instead. It is deliberately stateless, because `Resolve` runs inside concurrent per-file goroutines.

The whole classification reduces to one pure function over one list:

```go
var objcSniffPrefixes = []string{
	"#import", "#include", "#pragma", "#if", "#define",
	"@import", "@interface", "@implementation", "@class", "@protocol",
	"//", "/*",
}
```

`looksLikeObjC` returns true when the first non-blank line has any of those twelve prefixes, and false when the line is empty or matches none. Five of the twelve begin with `#`.

The source comment directly above the list explains the boundary it is drawing:

> Deliberately not widened to a bare "#": Octave, which also uses ".m", treats "#" as a comment character, so that would misclassify a real Octave/MATLAB file.

`sniffer_test.go` encodes the same intent. Its negative list — lines that must *not* sniff as Objective-C — is:

```go
notObjc := []string{"", "function y = f(x)", "classdef Foo", "% a comment", "x = 1;", "# an Octave comment"}
```

One Octave case, and it is written with a space after the `#`.

That space is doing all the work. The GNU Octave manual is explicit that no space is required: a comment "starts with either the sharp sign character, '#', or the percent symbol '%'", and "any text following the sharp sign or percent symbol is ignored by the Octave interpreter". An Octave author who writes `#import raw counts from csv` or `#define the grid spacing here` has written an ordinary comment. `looksLikeObjC` sees `#import` and `#define`.

| First non-blank line of a `.m` file | Octave meaning | Rule doc resolved |
|---|---|---|
| `# an Octave comment` | comment | `matlab.md` (tested) |
| `% an Octave comment` | comment | `matlab.md` (tested) |
| `#import raw counts from csv` | comment | `objc.md` |
| `#define the grid spacing here` | comment | `objc.md` |
| `#if this run fails, rerun` | comment | `objc.md` |
| `#include the outliers this time` | comment | `objc.md` |
| `#pragma is not an Octave word` | comment | `objc.md` |

Five of the twelve signals are reachable from a plain comment. The guard holds for exactly the shape the single test uses.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-open-code-review-octave-sniff-space-audit/references/ocr-demo.jpg" alt="Landing-page screenshot of open-code-review showing a terminal running a review inside a project directory.">
  <figcaption>Product demo screenshot shipped in the repository's pages assets. Source: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/pages/public/images/blog/introducing-ocr-blog/demo.png">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/pages/public/images/blog/introducing-ocr-blog/demo.png</a> · License: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE</a> · alibaba/open-code-review Contributors · Image from alibaba/open-code-review at 438a5c2, Apache-2.0.</figcaption>
</figure>

## 💡 Innovation

The interesting part is not that a heuristic has an edge. It is that the two halves of the same decorator fold in opposite directions.

`peekFirstLine` reads the file from the working tree, or through `git show <ref>:<path>` when a ref is set. Every failure path in it returns the empty string, and `looksLikeObjC("")` is false. A missing file, a read error, a git failure, a five-second timeout — all of them keep the glob layer's answer, which is MATLAB. When that half does not know, it declines to override.

The prefix list is the other half, and it overrides on a single positive match with no corroboration. When that half does not know, it decides.

How much rides on the decision is measurable. `matlab.md` carries 95 rule bullets about MATLAB-specific defects: leading-function names that disagree with the file name, nested functions used where a local function would do, typos in `error` and `warning` identifiers. `objc.md` carries 109 bullets about Objective-C object ownership: strong-reference cycles, `unsafe_unretained` dereferences after deallocation, manual-retain-count balance. Comparing the two bullet sets line by line yields zero identical lines. A misclassified Octave file does not get a slightly worse review. It gets all 109 rules of a memory model it does not have, and loses all 95 rules written for it.

That also explains why the fix is not "add more prefixes". The list is a denylist of shapes that look like Objective-C, and Objective-C's `#`-directives are lexically indistinguishable from Octave comment text. Distinguishing them needs a second signal the sniffer already has cheap access to — the rest of the peeked line, or the presence of `%` comments or `function`/`endfunction` further down — not a longer list. The repository's own `TestSniffer_RealisticObjCHeaders` shows the team already reasoned about the opposite failure direction, where real Objective-C files open with a `//` banner rather than `#import`. The Octave direction has one test and one space.

One hypothesis I checked and discarded: case. `resolveDetail` lowercases both the pattern and the path before matching, so `**/*.R` does reach `script.r` and `**/*.m` does reach `Model.M`. Case sensitivity is not a gap here, and saying otherwise would have been wrong.

A smaller provenance note from collecting the images for this article: `pages/public/images/blog/introducing-ocr-blog/demo.png` is a JPEG. Its first two bytes are `FF D8`, not the PNG signature. Nothing depends on it, but it is a reminder that extensions are advisory in more places than the rule table.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-open-code-review-octave-sniff-space-audit/references/ocr-providers.jpg" alt="Terminal screenshot of the open-code-review provider selection prompt listing OpenAI-compatible and Anthropic-compatible endpoints.">
  <figcaption>Provider selection prompt from the project README. Source: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/README.md">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/README.md</a> · License: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE</a> · alibaba/open-code-review Contributors · Image from alibaba/open-code-review at 438a5c2, Apache-2.0.</figcaption>
</figure>

This is the same failure shape I wrote about in [the Orca telemetry audit](/posts/orca-telemetry-universal-claim-audit/), where a privacy page's universal claim held for 82 of 83 event schemas and broke on the one field that accepted free text. A guard is not described by its intent. It is described by the narrowest input that reaches it.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-18-open-code-review-octave-sniff-space-audit/references/ocr-benchmark-en.png" alt="Benchmark chart from the open-code-review README comparing its detection results against other code review tools.">
  <figcaption>Benchmark chart published in the project README. Source: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/README.md">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/README.md</a> · License: <a href="https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE">https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/LICENSE</a> · alibaba/open-code-review Contributors · Image from alibaba/open-code-review at 438a5c2, Apache-2.0.</figcaption>
</figure>

## 🎯 Key Takeaways

- At `438a5c2`, `**/*.m` resolves to `matlab.md` by default, and `sniffer.go` overrides that to `objc.md` when the first non-blank line matches one of twelve prefixes.
- Five of those twelve prefixes start with `#`. The GNU Octave manual states that `#` opens a comment and that any following text is ignored, so ordinary Octave comments such as `#import raw counts` reach the Objective-C branch.
- The source comment says bare `#` was excluded specifically to protect Octave. The only Octave test case is `"# an Octave comment"`, which has a space and therefore never exercises the gap.
- The two halves of the same decorator fold in opposite directions: read failures keep MATLAB, a single prefix match switches to Objective-C without corroboration.
- The blast radius is total, not partial. `matlab.md` and `objc.md` share zero identical rule bullets across 95 and 109 lines.
- Case sensitivity is not the problem. `resolveDetail` lowercases both sides before matching.

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness, and every claim is pinned to primary source at a named commit rather than to first-hand operation of the tool.

## 🤔 New Questions

How often does the gap fire in practice? That needs a corpus of real Octave `.m` files, counted by whether their first non-blank line starts with `#` and no space. I did not measure it, so I will not guess at it.

Would a two-signal sniff be cheap enough? The decorator already pays one read per `.m` file and explicitly avoided a cache because `Resolve` is concurrent. Scanning a few more lines for `endfunction`, `%` comments, or a `function` header with no braces would stay inside that same read.

And does this generalise across the rule table? `**/*.{ml,mli}` maps to OCaml while Standard ML uses the same extension, and `**/*.{v,sv,vh}` maps to Verilog while `.v` is also Coq. Neither has a sniffer. Whether those collisions matter depends on how often both languages appear in the same review population — the kind of question the [CodeBurn hard-cap audit](/posts/codeburn-guard-hard-cap-audit/) had to answer about budget thresholds before any number meant anything.

## References

**Primary source, pinned to `438a5c20f6d4d92b0dada45c9ea7f42d8354a18f`**

- [`internal/config/rules/sniffer.go`](https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/internal/config/rules/sniffer.go) — the `.m` decorator, `objcSniffPrefixes`, `looksLikeObjC`, `peekFirstLine`
- [`internal/config/rules/sniffer_test.go`](https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/internal/config/rules/sniffer_test.go) — the positive and negative sniff cases
- [`internal/config/rules/system_rules.json`](https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/internal/config/rules/system_rules.json) — the glob-to-rule-doc table
- [`internal/config/rules/system_rules.go`](https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/internal/config/rules/system_rules.go) — `resolveDetail`, brace expansion, lowercase matching
- [`internal/config/rules/rule_docs/matlab.md`](https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/internal/config/rules/rule_docs/matlab.md) and [`objc.md`](https://github.com/alibaba/open-code-review/blob/438a5c20f6d4d92b0dada45c9ea7f42d8354a18f/internal/config/rules/rule_docs/objc.md)

**Language specification**

- [GNU Octave Manual — Single Line Comments](https://docs.octave.org/latest/Single-Line-Comments.html)

**Project metadata**

- [alibaba/open-code-review on GitHub](https://github.com/alibaba/open-code-review)
