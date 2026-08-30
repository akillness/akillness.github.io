# 01:00 KST Scheduled Runbook

## Schedule

- Recurrence: daily at 01:00
- Timezone: `Asia/Seoul`
- Maximum output: one article package
- Safe baseline mode: `draft-only`
- Current approved mode: `publish-on-green` with standing approval granted on 2026-08-30
- Runtime registration: an external Aside cron named `Daily Source Audit Publish`

The schedule intentionally does not live in GitHub Actions: authenticated browser research and routine memory run in Aside. Verify the external routine separately; repository CI remains build/deploy-only.

## Run sequence

1. Read `CLAUDE.md`, the policy, and routine memory.
2. Verify the active repository and inspect dirty work without modifying it.
3. Start a new workspace run; this archives the previous `current` run.
4. Search the last 72 hours first, then evergreen Search Console gaps if no timely candidate qualifies.
5. Prefer AI agents, MCP, Unity/game production, multimodal game QA, and 3D vision.
6. Deduplicate against published and archived candidates.
7. Run the full harness and produce at most one validated package. The director downloads 4–12 rights-clear source-derived reference images and writes `draft/source-image-manifest.json`; if four cannot be obtained, the run blocks (fail closed) — a blocked or no-article night is a valid outcome.
8. If no candidate passes, close with a short rejected-candidate report.
9. Notify with run id, selected/rejected topic, evidence quality, draft path, and gate status.

## Source order

1. Official documentation and product/search blogs
2. Source repository, release tag, tests, issue tracker
3. Paper and dataset primary pages
4. Search Console and Google Trends
5. Credible journalism/industry research for context
6. Forums/social only as leads, never final proof

## Routine memory

Remember:

- last run id and status
- published, rejected, and duplicate topics
- sources that failed or contained injection
- recurrent search gaps
- last Search Console baseline
- whether standing `publish-on-green` approval is active

## Publication

`draft-only` stops before repository publication. `publish-on-green` is valid only when policy also has `standing_publish_approval: true` after explicit approval, and it still requires every gate. A dirty target path, changed origin, missing asset, future date, CI failure, or 404 forces draft-only fallback.
