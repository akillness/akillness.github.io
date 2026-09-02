---
title: "mjlab Source Audit: The Green Badge Proves the CPU Path"
description: "mjlab markets Isaac Lab ergonomics on MuJoCo Warp. The pinned tree shows CPU-only CI, benchmarks that record no hardware, and a second licence inside the package."
categories: [AI, Research]
tags: [mjlab, mujoco, reinforcement-learning, robotics, simulation, open-source, licensing, ci]
date: 2026-09-02 16:50:00 +0900
mermaid: false
image:
  path: /assets/img/posts/2026-09-02-mjlab-source-audit/ci-verification-gap.svg
  width: 1200
  height: 630
  alt: "Two columns contrasting what mjlab's CI verifies, all on ubuntu-latest with no GPU, against the GPU training path, benchmarks and forked directory that CI never touches"
---

## 🤔 Curiosity: what does a green badge on a GPU project actually prove?

[mjlab](https://github.com/mujocolab/mjlab) is one of the more interesting things to appear in robot learning this year: Isaac Lab's manager-based environment API, rebuilt on MuJoCo Warp so that physics runs on the GPU, without dragging in Isaac Sim. It has 2,951 stars as of 2 September 2026, monthly releases since January, a backing paper, and at the pinned commit its CI run concluded successfully.

I went looking for the seam between what such a project claims and what its repository can actually verify. It is a habit worth having on any simulation stack, because the failure mode is not a crash. It is a policy that trains to convergence and behaves subtly wrong.

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated editorial harness; every repository claim is pinned to commit 8ee51fb and no GPU run was performed.
{: .prompt-info }

## 📚 Retrieve: what the pinned tree shows

I read the working tree at commit `8ee51fbcf806a7419189f706d9e394cbeb7790fa` statically: README, docs, packaging metadata, CI workflows, benchmark scripts and licence headers. I did not execute anything, and I have no GPU measurements of my own to offer.

The project describes itself precisely: it "combines Isaac Lab's manager-based API with MuJoCo Warp, a GPU-accelerated version of MuJoCo," providing "composable building blocks for environment design, with minimal dependencies and direct access to native MuJoCo data structures." It is also a published research artifact, cited in its own README as *mjlab: A Lightweight Framework for GPU-Accelerated Robot Learning*.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/architecture-diagram.png" alt="mjlab architecture diagram: three entities compiled through MjSpec and MjModel into MuJoCo Warp running N worlds on GPU, then a ManagerBasedRLEnv with observation, action, reward, termination, event, command, curriculum and metrics managers, then RSL-RL, then a trained policy">
  <figcaption>mjlab architecture diagram. Source: mjlab documentation, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/architecture_diagram.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/architecture_diagram.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

That diagram is the whole product in one picture: entities compile through `MjSpec` and `MjModel` into MuJoCo Warp running many worlds on the GPU, a `ManagerBasedRLEnv` wraps them with the familiar Isaac Lab manager set, and RSL-RL turns that into a trained policy. Every box after MuJoCo Warp only matters if the GPU stage works.

### Finding 1 — CI verifies the CPU path, and only the CPU path

The README states plainly that "mjlab requires an NVIDIA GPU for training." The CI workflow tells a different story about what is checked. All six jobs run on `ubuntu-latest`. The tests and type-checks run through `uv run --extra cpu`, and the wheel and source-distribution smoke tests install into an isolated environment with no CUDA extra at all.

The suite is not weak. It runs ruff lint and format, pytest across Python 3.10 to 3.13 both locked and against an unlocked latest-dependency resolve, pyright and `ty` four times each, a MuJoCo stub freshness check, and isolated wheel and sdist smoke tests, with every action SHA-pinned. There is even a nightly workflow that upgrades every dependency and re-runs the suite. By the standards of research code this is unusually disciplined.

But none of it touches a GPU. The badge is an honest report of what it runs; the inference a reader draws from it is the problem. On a project whose defining feature is GPU-parallel physics, the green check attests to the path the README says training does not use.

### Finding 2 — The benchmark numbers do not carry a machine

The repository publishes nightly benchmark reports. The result record that generates them serialises exactly `task`, `num_envs`, `num_steps`, `decimation`, `physics_sps`, `env_sps` and `overhead_pct`, plus the git commit. There is no field for GPU model, driver version or CUDA version.

The runs happen on a maintainer's own machine through a systemd user timer, against a task pinned to 4096 environments and 6000 iterations, and CI explicitly excludes `scripts/benchmarks/**` from both push and pull-request triggers.

The project's own comparative statement is careful in a way the record is not. The FAQ says only that "Based on our experience over the last few months, mjlab is **on par or faster** than Isaac Lab" — a hedge in prose, sitting above a machine-readable result format that drops the hardware context entirely.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/nightly-tracking-g1.png" alt="Rendered frame from the nightly G1 humanoid motion-tracking benchmark task">
  <figcaption>mjlab nightly benchmark render. Source: mjlab repository, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/scripts/benchmarks/nightly_images/tracking_g1.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/scripts/benchmarks/nightly_images/tracking_g1.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

So a steps-per-second figure from those reports is a number without a machine attached to it. That is not an accusation of inflation. It means the number cannot be compared against your hardware, or against a competing framework, without information the record does not store. If you are going to quote throughput in a procurement argument, measure it yourself.

### Finding 3 — The platform boundary is stricter than the README says

Three documents describe the supported platforms, and they do not agree in scope.

| Source | What it permits for training |
|---|---|
| README | "requires an NVIDIA GPU for training. macOS is supported for evaluation only" |
| Installation docs | "Training: Linux + NVIDIA GPU (CUDA 12.4+ recommended)" |
| FAQ | Windows and WSL have "preliminary testing… not guaranteed to be stable" and will be "tested less frequently" |

A Windows workstation with a fast NVIDIA card satisfies the README and fails the installation docs. The FAQ also documents a trap the README omits: passing `device="cpu"` "does not stop Warp from initializing the GPU," so a CPU run still claims VRAM unless you hide the CUDA devices before launch.

### Finding 4 — "Minimal dependencies" is a claim about the simulator, not the install

The packaging metadata lists twenty runtime dependencies. Alongside the expected `mujoco`, `mujoco-warp`, `torch` and `warp-lang` sit `wandb` as a hard runtime requirement rather than an optional extra, `rsl-rl-lib` pinned to an exact version, plus `tensorboard`, `onnxscript`, `trimesh`, `viser`, `mjviser`, `mediapy` and `imageio-ffmpeg`.

Against Isaac Sim's footprint the claim is defensible, and that is clearly the intended comparison. Read as "this will be a small install," it is not. The exact RL-library pin also makes the training backend effectively single-vendor today, which is what the open issues asking for other integrations are about.

### Finding 5 — Two licences, and the tooling only checks one

The package is Apache-2.0. It also vendors utilities forked from NVIDIA Isaac Lab under BSD-3-Clause, and it says so: "Forked components retain their original licenses," with SPDX headers in each forked file and a dated change log recording divergence from upstream. That is better hygiene than most forks manage.

Two details complicate it. There is no `NOTICE` file, so a downstream redistributor must read file headers to discover the second licence. And the same directory is excluded from ruff, pyright and `ty` in the packaging config, which means the one directory under a different licence is also the one directory no static check covers. It is not untested — `tests/test_lab_api_math.py` exercises part of it — but the type checkers and linters skip it entirely.

### What the project does well, in its own artifacts

None of the above makes this a weak project, and the documentation is unusually generous. The native viewer ships live reward and motion panels, the browser viewer exposes camera feeds and debug toggles, ghost overlays compare a reference motion against the policy, and the terrain system renders procedurally generated courses.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/native-viewer.png" alt="mjlab native MuJoCo viewer showing several humanoid robots in a paused simulation beside live motion and reward plots">
  <figcaption>mjlab native viewer. Source: mjlab documentation, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/native_viewer.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/native_viewer.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/ghost-visualization.png" alt="Browser viewer showing humanoid robots with translucent green ghost overlays representing the reference motion alongside the policy">
  <figcaption>mjlab ghost visualization. Source: mjlab documentation, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/ghost_visualization.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/ghost_visualization.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/viser-viewer.png" alt="Browser-based viser viewer running mjlab with robot arms, a camera feed pane, visualization and debug toggles">
  <figcaption>mjlab viser viewer. Source: mjlab documentation, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/viser_viewer.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/viser_viewer.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/terrain-box-pyramid-stairs.png" alt="Procedurally generated box pyramid stairs terrain rendered as concentric blue steps">
  <figcaption>mjlab terrain generator output. Source: mjlab documentation, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/terrains/box_pyramid_stairs.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/terrains/box_pyramid_stairs.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-02-mjlab-source-audit/references/cartpole-training-curve.png" alt="Cartpole swingup training curve where mean reward rises steeply and plateaus near fifty within roughly one hundred iterations">
  <figcaption>mjlab cartpole tutorial training curve. Source: mjlab documentation, Apache-2.0, commit 8ee51fb · <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/tutorials/cartpole_training_curve.png">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/docs/source/_static/tutorials/cartpole_training_curve.png</a> · License: <a href="https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE">https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE</a> · The mjlab Developers (mujocolab/mjlab)</figcaption>
</figure>

The API is also a genuine reimplementation rather than a thin wrapper. Isaac Lab appears nowhere in the dependency list; the forked code is leaf maths, string and import helpers. The migration guide, however, still carries a "work in progress" warning.

## 💡 Innovation: what I would take into a production evaluation

**Ask what the badge covers before you trust it.** This is not a criticism unique to mjlab. Any project whose value lives on an accelerator will have a CI story shaped by what runners cost. The useful move is to read `runs-on` and the test invocation flags before treating a green check as coverage, and to write your own GPU smoke test as the first thing you add.

**Demand a machine with every throughput number.** A benchmark record without GPU model, driver and CUDA version cannot be compared to anything. If you need a number for a decision, produce it on your hardware. The same reasoning drove my audit of [GPU residency and scheduling on Apple Silicon](/posts/omlx-metal-residency/): where the work physically runs decides what the measurement means.

**Read all three platform documents, not the README.** README, installation guide and FAQ disagreed in scope here, and the strictest one is the one your CI machine will meet. Budget for the Linux requirement rather than the NVIDIA requirement.

**Treat a differently licensed subdirectory as a review boundary.** A vendored fork under another licence is normal and fine. What deserves attention is that the same directory was excluded from every static check, so the code with the unusual licence is also the code no static checker reads, covered by a single small test file. If you redistribute, generate your own notice file.

**Weigh the open-issue themes, not the count.** Thirty-three open items is unremarkable. The theme is what matters: the cluster concerns actuator and sampling semantics, which is the class of defect that produces a trained policy that looks converged and transfers badly, rather than an error you can see. The same trap appears on the reconstruction side of 3D work, where I found that [an avatar method's gain split between its tracking signal and its framework](/posts/npga-paper/) rather than sitting where the summaries put it.

## 🎯 Key Takeaways

- Every CI job runs on `ubuntu-latest` and none touches a GPU, so the green badge attests to CPU correctness while the GPU training path that defines the project has no automated gate in the repository.
- The nightly benchmark record stores task and environment counts but **no GPU model, driver or CUDA version**, and benchmark paths are excluded from CI triggers.
- The README's platform line is one constraint short of the installation docs: training is documented as Linux plus NVIDIA, not merely NVIDIA.
- Requesting `device="cpu"` still initialises the GPU and claims VRAM unless CUDA devices are hidden before launch.
- "Minimal dependencies" is a comparison against Isaac Sim, not a small install: twenty runtime dependencies, with `wandb` mandatory and the RL backend pinned to one library.
- The Apache-2.0 package vendors BSD-3-Clause code, discloses it well, ships no `NOTICE`, and excludes exactly that directory from ruff, pyright and `ty`.

## 🤔 New Questions

- Would a single self-hosted GPU smoke test, even one short training step at a small world count, close most of the verification gap without the cost of a full GPU CI fleet?
- If the benchmark record added GPU model and driver fields, would the published nightly series remain comparable across its own history?
- Does the manager-API reimplementation drift from Isaac Lab semantics over time, and would anyone notice without a cross-framework equivalence test?

## References

**Primary source, pinned to commit 8ee51fb**
- Repository: <https://github.com/mujocolab/mjlab>
- Pinned tree: <https://github.com/mujocolab/mjlab/tree/8ee51fbcf806a7419189f706d9e394cbeb7790fa>
- CI workflow: <https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/.github/workflows/ci.yml>
- Packaging metadata: <https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/pyproject.toml>
- Benchmark measurement code: <https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/scripts/benchmarks/measure_throughput.py>
- Licence: <https://github.com/mujocolab/mjlab/blob/8ee51fbcf806a7419189f706d9e394cbeb7790fa/LICENSE>

**Upstream projects**
- MuJoCo Warp: <https://github.com/google-deepmind/mujoco_warp>
- NVIDIA Isaac Lab: <https://github.com/isaac-sim/IsaacLab>

**Related audits on this site**
- <https://akillness.github.io/posts/omlx-metal-residency/>
- <https://akillness.github.io/posts/npga-paper/>
