---
title: "Goalflow's CodeNode Gets Two AST Screens, Not an OS Sandbox"
description: "Goalflow's checklist says the parser's safe_check is disabled, but pinned source calls it at parse time and runs a second CodeNode AST check. Neither is an OS sandbox."
categories: [AI, Agents]
tags: [goalflow, python, security]
date: 2026-10-19 21:34:42 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-10-19-goalflow-code-node-ast-screening-not-sandbox/goalflow-ast-screen.png
  alt: "Diagram showing a stale security checklist, the parser's AST screen, a second CodeNode runtime check, and the missing OS-level isolation and resource limits"
image_policy: source-first-fallback
---

## What does the current source actually do?

Goalflow's security checklist says the parser's `safe_check()` AST guard is “currently disabled/TODO.” That sentence does not match the pinned source: the security note says “disabled/TODO” ([line 57](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/docs/security-and-open-sourcing.md#L57)), while the Dify parser's CodeNode branch says it screens code at parse time and that CodeNode re-validates it at runtime, then calls `safe_check(data.code)` ([lines 271–272](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/dify_parser/dify_dsl_parser.py#L271-L272)). The checklist is stale; the more important question is what those checks can and cannot guarantee.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-10-19-goalflow-code-node-ast-screening-not-sandbox/goalflow-ast-screen.png" alt="Diagram showing a stale security checklist, the parser's AST screen, a second CodeNode runtime check, and the missing OS-level isolation and resource limits">
  <figcaption>Original illustration by Aside, showing the stale security note, two AST screens, and the missing OS-level boundary; not source evidence.</figcaption>
</figure>

[View the original transparent SVG diagram](/assets/img/posts/2026-10-19-goalflow-code-node-ast-screening-not-sandbox/goalflow-ast-screen.svg).

The phrase “AST guard” can sound stronger than the implementation is. An abstract syntax tree screen is a rule-based inspection of code before execution. Goalflow applies one in the parser and another in the CodeNode runtime. That is defense in depth, but it is not the same thing as running hostile Python inside an operating-system boundary.

| Layer | What the pinned source shows | What it does not establish |
|---|---|---|
| Security note | Says `safe_check()` is disabled/TODO | Whether that status is current |
| Dify parser | Calls `safe_check(data.code)` and screens selected syntax | Complete resistance to malicious Python |
| CodeNode runtime | Rechecks the AST, supplies restricted globals, then calls `exec` | OS-level isolation or CPU, memory, and time limits |

## What do the two AST screens reject?

The parser's `safe_check()` walks the parsed syntax tree. Its direct-call denylist includes names such as `open`, `eval`, `exec`, `compile`, `__import__`, `globals`, `vars`, `getattr`, and `input`. It also rejects dunder-attribute access and imports outside a compute-oriented allowlist. The source comments describe this as a coarse parse-time screen ([parser implementation, lines 760–819](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/dify_parser/dify_dsl_parser.py#L760-L819)).

CodeNode repeats the idea before execution in `_validate_code_ast()`. That check rejects dunder attributes, references to blocked builtin names, and imports outside the allowlist. The runtime then supplies a trimmed `__builtins__` mapping and a restricted import helper. Finally, it executes the code with `exec(self.code, safe_globals, safe_globals)` ([validator, lines 43–86](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/node/code_node.py#L43-L86); [invocation and execution, lines 206–255](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/node/code_node.py#L206-L255)).

Those are meaningful controls. They can reject obvious operations and reduce trivial escape routes. But the existence of a denylist does not prove that every path through Python's object model, every library interaction, or every resource-exhaustion case is contained. This audit did not try to construct a bypass, and it does not claim one exists.

## Why is this not an operating-system sandbox?

The CodeNode source states the boundary plainly: `exec()` on untrusted input is “not a true security boundary” and has “no CPU/memory/time limits.” It says hostile input should run in an OS-level sandbox, giving a subprocess with seccomp or nsjail as examples ([lines 210–213](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/node/code_node.py#L210-L213)).

That warning matters because the shown implementation is Python code executing through `exec` in the Goalflow runtime. A restricted namespace changes what names the snippet can directly access; it is not evidence of a separate filesystem, network policy, kernel boundary, or resource budget. The repository source also cannot tell us whether a particular deployment adds an outer container, process jail, or other controls. Those deployment facts need separate evidence.

If your workflow accepts code from an untrusted user, imported DSL, or model output, do not infer containment from the AST checks alone. Verify the actual deployment boundary and put resource limits around execution. The project's own comment points in that direction. Keep the checklist accurate too: “disabled” is not a good description of the pinned implementation, while “screening only, not a sandbox” is.

This distinction is familiar from other agent systems. The [AIO Sandbox confinement audit](/posts/aio-sandbox-confinement-contract-audit/) compares advertised sandbox behavior with the outer Docker/seccomp boundary. The [Octop shell-guard audit](/posts/octop-shell-guard-logs-by-default/) asks a related question: does a guard merely flag risky input, or does it actually stop execution?

## What do the visible tests establish?

The inspected CodeNode unit tests include cases named `test_simple_calculation`, `test_string_processing`, `test_data_analysis`, `test_error_handling`, `test_external_library`, and `test_output_filtering` ([unit-test lines 26–434](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/test/unit_tests/test_code_node.py#L26-L434)). The paired integration file includes sum, analyze, error-handling, and string-input cases ([integration-test lines 280–380](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/test/integration_tests/code_node_integration_test.py#L280-L380)). Those are useful functional examples. They do not establish that hostile code cannot escape the restricted namespace or exhaust the process.

That conclusion is deliberately scoped to those two test files. It is a coverage observation, not proof that no security tests exist elsewhere and not evidence that a bypass is possible. The earlier [security-fix commit `cf54df9`](https://github.com/wanmol/goal-flow/commit/cf54df98afe979d076d7b1a7d42886b989ec4af6) changed parser/runtime source but did not change either of these named test files, so the commit itself is not evidence of an adversarial test suite.

A stronger security test contract would state the threat model and exercise it: which authors can supply code, which host resources must remain unreachable, how long execution may run, and what happens when a limit is exceeded. Tests should be adversarial and resource-aware, but they still complement rather than replace the OS boundary the code comments recommend.

## Key Takeaways

- At pinned commit `258a3b1`, `safe_check()` is called in the Dify parser, and CodeNode performs a second AST check before execution.
- The security checklist's “disabled/TODO” status is stale for that revision.
- Restricted builtins and import checks are screening controls, not proof of isolation.
- CodeNode's own comments say there is no OS-level sandbox and no CPU, memory, or time limit.
- The inspected tests show ordinary CodeNode behavior, not hostile-code containment. This is a scoped observation, not a claim that no other tests exist.

## New Questions

- Can an untrusted user or model author the CodeNode body in the deployment being evaluated?
- Does the deployment execute CodeNode in a separate OS-constrained process, and where are its CPU, memory, time, filesystem, and network limits configured?
- Which adversarial tests cover the exact trust boundary, and do they run in the project's normal CI path?
- Can the security checklist be updated to distinguish parser screening, runtime screening, and OS-level confinement?

## References

- [Goalflow security and open-sourcing checklist, line 57, pinned commit `258a3b1`](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/docs/security-and-open-sourcing.md#L57)
- [Dify parser CodeNode branch, lines 271–272](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/dify_parser/dify_dsl_parser.py#L271-L272), and [AST screen, lines 760–819](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/dify_parser/dify_dsl_parser.py#L760-L819)
- [CodeNode AST validator, lines 43–86](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/node/code_node.py#L43-L86), and [runtime check and `exec`, lines 206–255](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/src/goalflow/node/code_node.py#L206-L255)
- [CodeNode unit-test examples, lines 26–434](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/test/unit_tests/test_code_node.py#L26-L434)
- [CodeNode integration-test examples, lines 280–380](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/test/integration_tests/code_node_integration_test.py#L280-L380)
- [Security-fix commit `cf54df9`](https://github.com/wanmol/goal-flow/commit/cf54df98afe979d076d7b1a7d42886b989ec4af6)
- [Goalflow README architecture overview, pinned commit `258a3b1`](https://github.com/wanmol/goal-flow/blob/258a3b176ed9b6b63d7ef6dd2711a75bc5486e04/README.md)
