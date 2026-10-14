---
name: archive-development
description: Rebuild one restored historical archive note at a time into an original, source-pinned article that meets the site's low-value-content standard — survey what changed, research the primary sources, develop the text, validate, publish, and graduate the post out of the archive exception. Owner instruction 2026-10-14.
---

# Archive development (survey → research → develop → publish)

Owner instruction (2026-10-14): *"Do not leave the restored archive posts as they were. For each post, survey, research, develop, and publish."* The 283 notes restored on 2026-10-12 are mostly LLM rewrites of third-party posts with an appended machine translation. Left alone they are the strongest low-value signal on the site. This skill turns them, one at a time, into articles that carry a finding of their own.

Ledger: `_data/archive_development.json` (`tools/archive-development.mjs status|next|set`). Validator: `tools/validate-archive-development.mjs`. Reader-facing note: `_includes/archive-development-note.html` (rendered from `archive_developed` + `archive_development_note`).

## Non-negotiables

- One post per unit of work, one commit per post, `git push origin HEAD:master` after the local gates pass. Never batch-rewrite. A scheduled run develops at most `archive_development_max_posts_per_run` (policy) posts.
- **The original URL and publication date stay.** Record the rebuild in `last_modified_at` (+0900), `archive_developed` (YYYY-MM-DD), and a visible `archive_development_note` (≥80 chars: what was re-read and what changed since the original note).
- **Primary sources, pinned.** Re-read the paper (arXiv version), repository (commit or tag), documentation page, or dataset card. Every number carries its source and date. Nothing is carried over from the old note without re-verification; if the old number cannot be found in a primary source, it is dropped or marked unverified.
- **A finding, not a paraphrase.** The developed article must say something the source does not say about itself: what the method actually does at the pinned revision, where the announced number comes from, what changed since the original date (follow-up work, deprecations, newer releases, benchmark updates), what a practitioner should do differently now.
- **Honest first person.** No invented experiments, no "I tested" unless a check was actually run in this unit of work (record the command and date in the article). "I re-read…", "The repository at commit … shows…", "I could not verify…" are the allowed forms.
- **No templated skeleton, no per-post AI disclaimer.** Plain finding-specific H2 headings; exactly one `Key Takeaways`, one `New Questions`, one `References`; one H2 must carry the survey ("What changed since 2024", "Where this stands in 2026"). The site-wide editorial method note is linked by the layout.
- **English article.** Remove `lang: ko` and the appended `Translate to Korean` block; a Korean edition belongs to the Korean channels, not this URL.
- **Category axis.** Move the post to `AI, Agents`, `AI, Research`, or `AI, Tooling`; lowercase reusable tags.
- **Original visual.** At least one comparison table or authored inline SVG derived from the inspected sources. Mermaid only when clearer. Old decorative Mermaid "architecture" diagrams invented from a press summary are deleted, not kept.
- **Internal links.** At least two links to genuinely related existing `/posts/` articles.
- **Advertising follows the word count.** Remove `ads: false`; the 800-word boundary (`google_index_min_post_words`) decides. A developed article below the boundary is not finished.

## Procedure for one post

1. `node tools/archive-development.mjs next --count 1` → pick the entry; `set <path> --status in_progress`.
2. **Survey (what is the topic now?)** Read the old note only to learn its claims and sources. Then search the current state: newer paper versions, follow-up methods, repository activity (last release/commit), official docs, benchmark leaderboards, deprecations. Decide the article's real question for a 2026 reader.
3. **Research (pin the sources).** Open each primary source; record URL, version/commit/tag, retrieval date, and the exact statement or number used. Prefer: paper (arXiv vN), official repository at a commit, official docs, dataset/benchmark pages, maintainers' release notes. Secondary posts are context only, never the source of a number.
4. **Develop.** Rewrite the body from scratch in the site voice (`persona.md`). Structure: opening H2 that asks the reader's question → what the source shows (pinned) → what changed since the original date → what a practitioner should do with it → `Key Takeaways` → `New Questions` → `References` (categorized, with read dates). Build the table/SVG from the inspected material. Keep or replace the hero image only if rights are clear.
5. **Front matter.** Keep `date`; set `last_modified_at`, `archive_developed`, `archive_development_note`; remove `restored_archive`, `ads: false`, `lang: ko`, retired-comment lines; set categories/tags; keep `title` ≤ 90 chars stating the finding; `description` 80–180 chars without a stage label.
6. **Validate.** `node tools/validate-archive-development.mjs <path> --pre-ledger` until PASS, then `node tools/archive-development.mjs set <path> --status graduated --developed-at YYYY-MM-DD --note "<survey summary>"`, then run the validator again without `--pre-ledger`, `npm run editorial:prepush`, `node tools/validate-editorial-harness.mjs`, and the test suite.
7. **Publish.** Stage exactly the post, any new asset folder, and `_data/archive_development.json`. One commit: `archive(dev): rebuild <slug> from the <YYYY-MM> note`. Push `HEAD:master`. Confirm the Pages workflow succeeds and the anonymous permalink returns 200 with the new title and the rebuild note.
8. **Record.** Report the pinned sources, the finding, what the validator measured, and the live URL. Never claim AdSense or ranking outcomes.

## When a post cannot be developed honestly

Mark it `retired` (noindex, sitemap false, ads false, marker removed; file kept) with a survey note explaining why: copied third-party material with no independent angle, a personal diary, a dead product with nothing verifiable left, or a weekly news roundup whose only value was recency. Prefer `merged` (with `merged_into`) when a developed sibling already covers the topic. These decisions are recorded in the ledger and are reviewable in Git history.
