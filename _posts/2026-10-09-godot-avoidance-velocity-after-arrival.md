---
title: "Godot Avoidance Stops Forwarding Velocity After Arrival"
description: "Godot 4.7.2 gates avoidance velocity on a submitted target. A pinned source audit traces the arrival reset and separates route, steering and body movement."
categories: [AI, Research]
tags: [godot, navigation, game-development, source-audit]
date: 2026-10-09 00:14:47 +0900
image:
  path: /assets/img/posts/2026-10-09-godot-avoidance-velocity-after-arrival/cover.png
  alt: "Editorial illustration of capsule characters with separate desired and adjusted direction arrows"
---

## 🤔 Curiosity: Why does avoidance go quiet after arrival?

A character can keep receiving movement intent while the navigation agent stops forwarding desired velocities to avoidance. The setter still accepts a vector, but the inspected forwarding branch is gated by target submission.

This is a source-level finding, not a reported runtime bug. I inspected Godot source at `ed1daf0bf001b61586d9930840f2f1394092c079` (4.7.2 stable) and the matching 4.7 docs snapshot at `6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d`. These are separate engine and documentation pins. No project was run and no benchmark or measured jitter is claimed.

> **Editorial method:** AI assisted the research and draft under the evidence-gated editorial harness; an independent evidence review checked the pinned sources. No human review, Godot runtime test, or first-hand production result is claimed.

## 📚 Retrieve: Technical Analysis of the controller handoff

The documented navigation pattern has three owners. A path query provides the next position; the game script turns that into desired movement; then the character body applies movement. Godot explicitly says the navigation system never moves the agent's parent. For `CharacterBody3D`, the official example connects `velocity_computed`, submits desired velocity when avoidance is enabled, and in the callback assigns the resulting safe velocity to the body before `move_and_slide()`.

That handoff matters because `set_velocity()` is not a movement command. In the pinned `NavigationAgent3D` implementation it stores the supplied vector and marks `velocity_submitted`. During internal physics processing, the agent forwards it to `NavigationServer3D` only when it has a parent and `target_position_submitted` is true. The code also checks `avoidance_enabled` before the server call. In 2D avoidance mode it may retain the vertical component separately and submit the horizontal plane. The RVO implementation describes the supplied velocity as a suggestion, not a promise: simulation tries to fulfill it.

![Original explanatory diagram: flow.svg](/assets/img/posts/2026-10-09-godot-avoidance-velocity-after-arrival/flow.svg)

The original diagram is explanatory, not a runtime trace. It separates route target, desired velocity, safe velocity, and parent-body movement. The project remains responsible for body motion; the agent does not move its parent.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-09-godot-avoidance-velocity-after-arrival/references/agent_avoidance_enabled.png" alt="Godot Inspector showing Avoidance Enabled checked On, alongside Max Speed and Path Max Distance properties.">
  <figcaption>Attribution: Godot documentation image agent_avoidance_enabled.png, CC BY 3.0, reproduced unmodified; no endorsement implied. It shows Avoidance Enabled On with Max Speed and Path Max Distance properties. Creator: Juan Linietsky, Ariel Manzur and the Godot community. Source: <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationagents.rst">pinned NavigationAgents tutorial</a>. License: CC BY 3.0, <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/LICENSE.txt">as stated by the docs repository</a>. Reproduced unmodified; no endorsement implied.</figcaption>
</figure>

The lifecycle edge appears at arrival. `_transition_to_navigation_finished()` marks navigation finished and clears `target_position_submitted`. When avoidance is enabled, it also updates the server position, submits zero normal and forced avoidance velocities, and clears stored vertical velocity before emitting `navigation_finished`. Separately, `set_velocity()` can still store a later vector and mark it submitted. But the internal physics forwarding branch is nested under the target-submitted condition. **The source-level deduction is conditional:** after the completion transition, later `set_velocity()` calls alone do not enter that inspected forwarding branch until a target is submitted again. This does not mean the solver has shut down, nor does it establish what every other code path or custom integration does.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-09-godot-avoidance-velocity-after-arrival/references/agent_safevelocity_signal.png" alt="Godot documentation Signals panel for NavigationAgent2D showing velocity_computed with a Vector2 argument.">
  <figcaption>Attribution: Godot documentation image agent_safevelocity_signal.png, CC BY 3.0, reproduced unmodified; no endorsement implied. This is specifically a <strong>NavigationAgent2D / Vector2</strong> signal hookup illustration, not a NavigationAgent3D screenshot. Creator: Juan Linietsky, Ariel Manzur and the Godot community. Source: <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationagents.rst">pinned NavigationAgents tutorial</a>. License: CC BY 3.0, <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/LICENSE.txt">as stated by the docs repository</a>. Reproduced unmodified; no endorsement implied.</figcaption>
</figure>

The documentation adds a second condition that is useful when avoidance is used without route following: a `target_position` is still required, or the documented `safe_velocity` result is always zero. The source trace gives that requirement a concrete submission gate; it does not turn the docs' statement into proof that all avoidance-only setups behave identically. For an ordinary path-following actor, the documented loop checks `is_navigation_finished()` early, calls `get_next_path_position()` once per physics frame while active, derives a desired velocity, and stops querying after completion.

A safe integration sketch is therefore lifecycle-aware rather than a keepalive loop:

```gdscript
func _physics_process(delta):
    if NavigationServer3D.map_get_iteration_id(navigation_agent.get_navigation_map()) == 0:
        return
    if navigation_agent.is_navigation_finished():
        return

    var next_position = navigation_agent.get_next_path_position()
    var desired = global_position.direction_to(next_position) * movement_speed
    if navigation_agent.avoidance_enabled:
        navigation_agent.set_velocity(desired)
    else:
        _on_velocity_computed(desired)

func _on_velocity_computed(safe_velocity: Vector3):
    velocity = safe_velocity
    move_and_slide()
```

This is a compact reading aid for the official `CharacterBody3D` example, not a tested drop-in controller. In a game with separate states, the controller should decide whether arrival means stop, idle, or accept a new command; the source evidence supports explicitly submitting a new target when navigation should resume, not silently keeping the old target alive by re-querying after completion.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-09-godot-avoidance-velocity-after-arrival/references/navigationlayers_naming.png" alt="Godot navigation-layer bitmask selector with a tooltip reading SwampNavMesh, Bit 9, value 512.">
  <figcaption>Attribution: Godot documentation image navigationlayers_naming.png, CC BY 3.0, reproduced unmodified; no endorsement implied. This is a named route-layer bit selection example, not Project Settings layer naming and not an avoidance mask. The tooltip reads SwampNavMesh, Bit 9, value 512. Creator: Juan Linietsky, Ariel Manzur and the Godot community. Source: <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationlayers.rst">pinned NavigationLayers tutorial</a>. License: CC BY 3.0, <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/LICENSE.txt">as stated by the docs repository</a>. Reproduced unmodified; no endorsement implied.</figcaption>
</figure>

A 3D actor can still use the 2D avoidance mode. The documented `use_3d_avoidance` switch selects xz-plane avoidance or xyz avoidance; those modes run in separate avoidance simulations, so agents split between them do not affect one another.

### Three boundaries that look like one

Route selection, avoidance steering, and body collision are separate concerns. Navigation layers select which navigation meshes a path query considers. Avoidance layers and masks select which avoidance objects participate in avoidance calculations. The docs state avoidance has no navigation-mesh or physics-collision information and does not affect pathfinding. So changing a route-layer selection is not a way to tune who avoids whom, and an avoidance result is not a guarantee of physical collision-free movement.

Obstacles add another boundary. `affect_navigation_mesh` and `carve_navigation_mesh` control how an obstacle participates in navigation-mesh baking; that is distinct from its avoidance behavior. The obstacle tutorial says static outline obstacles work only with 2D avoidance. Dynamic radius obstacles are soft “please move away” constraints and are not reliable in crowded or narrow spaces. Neither statement proves that a particular obstacle bake succeeded or that bodies collide successfully in a running scene.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-09-godot-avoidance-velocity-after-arrival/references/nav_mesh_obstacles_properties.webp" alt="Godot NavigationObstacle3D Inspector showing Radius, Vertices, Affect Navigation Mesh, Carve Navigation Mesh and avoidance settings.">
  <figcaption>Attribution: Godot documentation image nav_mesh_obstacles_properties.webp, CC BY 3.0, reproduced unmodified; no endorsement implied. It shows obstacle inspector settings and the separation between baking and avoidance controls, not obstacle collision success. Affect Navigation Mesh is checked; Carve Navigation Mesh and Avoidance Enabled are unchecked. Their visible On labels do not establish checked state. Creator: Juan Linietsky, Ariel Manzur and the Godot community. Source: <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationobstacles.rst">pinned NavigationObstacles tutorial</a>. License: CC BY 3.0, <a href="https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/LICENSE.txt">as stated by the docs repository</a>. Reproduced unmodified; no endorsement implied.</figcaption>
</figure>

### Why identical-target resubmission is not the fix

It may seem natural to call `set_target_position()` every frame so the target flag remains set. The implementation explicitly does not compare target equality: each setter call stores the target, marks it submitted, and requests repathing. That makes identical-target resubmission a repath request, not a neutral keepalive. It does not prove a path is recomputed immediately, or that repeated calls cause measurable cost or jitter; those outcomes were not measured here.

The practical controller choice is narrower: submit a destination when a command or state transition actually requests navigation, then follow the documented active-path loop and treat `navigation_finished` as a lifecycle event. If the actor should resume movement, explicitly decide and submit the next target. If it should remain arrived, do not mistake continued desired-velocity updates for a route lifecycle. A useful follow-up would record target submission, callback delivery, completion, and body velocity across arrival and a subsequent command, then compare a new target with repeated identical-target calls.

For that follow-up, first decide what the profiler should measure: [Godot Physics Time and the Slowest Step](/posts/godot-physics-time-slowest-step/) is a useful controller-measurement companion. When comparing editor imagery with actual behavior, [Godot Editor Preview Is Not Runtime Evidence](/posts/godot-editor-preview-is-not-runtime-evidence/) offers a different caution about interpreting configuration views. Here, the screenshots document settings and signal hookup only; they do not stand in for a game run.

## 💡 Innovation: Make the handoff observable

For a controller review, observe four boundaries: target submission, desired velocity, `velocity_computed`, and parent-body movement. This separates calculated intent, forwarded intent, and applied movement without claiming these observations diagnose every navigation issue.

A focused test can observe desired-velocity submission and callback during an active path, completion, and a subsequent target. Avoidance-only use still needs a target position according to the docs. Until run, the post-arrival explanation remains a conditional deduction from pinned 4.7.2 source, not a reproduced symptom or a claim about all releases.

## 🎯 Key Takeaways

- `set_velocity()` stores controller intent; the inspected forwarding path also requires a parent, a submitted target, and enabled avoidance.
- Arrival clears the target-submitted flag and, when avoidance is enabled, resets normal and forced avoidance velocities. Later setter calls alone therefore do not pass through the inspected forwarding branch until a target is submitted again. This is a source-level inference.
- `velocity_computed` is a steering result for the controller to consume. The parent body remains responsible for movement, including `move_and_slide()` in the official `CharacterBody3D` example.
- Do not use repeated identical-target calls as a keepalive: the setter requests repathing even when the target is unchanged. No cost or jitter magnitude was measured.
- Navigation layers, avoidance masks, mesh baking, avoidance obstacles, and physics collision solve different parts of the problem.

## 🤔 New Questions

1. In a minimal Godot 4.7.2 scene, does callback delivery resume immediately after a new target is submitted following `navigation_finished`?
2. Which controller state should own target submission when an arrived actor may idle, accept a new command, or continue moving?
3. What does a bounded comparison of one-time target changes and per-frame identical-target submissions show in a real profiler, with scene, frame count, and engine build recorded?

## References

### Engine source

- Godot `NavigationAgent3D`, commit [`ed1daf0`](https://github.com/godotengine/godot/blob/ed1daf0bf001b61586d9930840f2f1394092c079/scene/3d/navigation/navigation_agent_3d.cpp), especially `set_velocity`, internal physics processing, target submission, and navigation-finished transition. Godot version file at the same commit identifies 4.7.2 stable.
- Godot RVO `NavAgent3D`, commit [`ed1daf0`](https://github.com/godotengine/godot/blob/ed1daf0bf001b61586d9930840f2f1394092c079/modules/navigation_3d/nav_agent_3d.cpp), preferred-velocity comment and assignment.

### Official documentation, 4.7 snapshot

- [Using NavigationAgents](https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationagents.rst): path following, avoidance, signal connection, target requirement, and CharacterBody3D example.
- [Using NavigationLayers](https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationlayers.rst): route-query layer masks.
- [Using NavigationObstacles](https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/tutorials/navigation/navigation_using_navigationobstacles.rst): obstacle baking and avoidance constraints.
- [Godot docs content license](https://github.com/godotengine/godot-docs/blob/6d86d7c7f3b8f4f56c71e113022d72fe80b2c84d/README.md): tutorial content outside `classes/` is CC BY 3.0 with attribution to Juan Linietsky, Ariel Manzur and the Godot community.
