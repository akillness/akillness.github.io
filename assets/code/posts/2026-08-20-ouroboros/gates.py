#!/usr/bin/env python3
"""Ouroboros' two mathematical gates, reproduced from the upstream source.

Gate 1 - Ambiguity <= 0.2   : do not build until the request is clear.
Gate 2 - Similarity >= 0.95 : do not stop evolving until the ontology is stable.

Formulas mirror Q00/ouroboros @ v0.51.14:
  - weights/threshold : src/ouroboros/bigbang/ambiguity.py
  - similarity        : src/ouroboros/core/lineage.py  (OntologyDelta.compute)
  - stagnation        : src/ouroboros/resilience/stagnation.py

Everything here is pure stdlib arithmetic - no LLM, no network. Upstream asks a
model to score each clarity dimension; this file takes those scores as input so
the gate arithmetic itself stays deterministic and testable.

Run it and every check below executes:
    python3 gates.py
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum

# --------------------------------------------------------------------------
# Gate 1: the ambiguity score (bigbang/ambiguity.py)
# --------------------------------------------------------------------------

AMBIGUITY_THRESHOLD = 0.2

# Greenfield: 3 dimensions. Brownfield adds context clarity, so the other
# three are scaled down to make room for it.
GREENFIELD_WEIGHTS = {"goal": 0.40, "constraint": 0.30, "success": 0.30}
BROWNFIELD_WEIGHTS = {"goal": 0.35, "constraint": 0.25, "success": 0.25, "context": 0.15}

# Per-dimension floors. A high total cannot paper over one blind dimension.
FLOORS = {"goal": 0.75, "constraint": 0.65, "success": 0.70, "context": 0.60}


@dataclass(frozen=True)
class AmbiguityVerdict:
    """Why the interview may or may not proceed to Seed generation."""

    score: float
    clarity: float
    ready: bool
    blocking_dimensions: tuple[str, ...]

    def explain(self) -> str:
        head = f"ambiguity={self.score:.3f} clarity={self.clarity:.3f}"
        if self.ready:
            return f"{head} -> READY (<= {AMBIGUITY_THRESHOLD})"
        if self.blocking_dimensions:
            return f"{head} -> BLOCKED by {', '.join(self.blocking_dimensions)}"
        return f"{head} -> BLOCKED (> {AMBIGUITY_THRESHOLD})"


def score_ambiguity(clarities: dict[str, float], *, brownfield: bool = False) -> AmbiguityVerdict:
    """Ambiguity = 1 - sum(clarity_i * weight_i).

    `clarities` maps dimension -> 0.0..1.0 (upstream: LLM-scored at temp 0.1).
    Brownfield mode requires the extra `context` dimension.
    """
    weights = BROWNFIELD_WEIGHTS if brownfield else GREENFIELD_WEIGHTS

    missing = set(weights) - set(clarities)
    if missing:
        raise ValueError(f"missing clarity dimensions: {sorted(missing)}")
    for name, value in clarities.items():
        if not 0.0 <= value <= 1.0:
            raise ValueError(f"clarity for {name!r} out of range: {value}")

    clarity = sum(clarities[dim] * weight for dim, weight in weights.items())
    score = 1.0 - clarity

    # Floors are checked independently of the weighted total.
    blocking = tuple(
        dim for dim in weights if clarities[dim] < FLOORS[dim]
    )
    ready = score <= AMBIGUITY_THRESHOLD and not blocking
    return AmbiguityVerdict(score=score, clarity=clarity, ready=ready, blocking_dimensions=blocking)


# --------------------------------------------------------------------------
# Gate 2: ontology similarity (core/lineage.py :: OntologyDelta.compute)
# --------------------------------------------------------------------------

CONVERGENCE_THRESHOLD = 0.95
MAX_GENERATIONS = 30
STAGNATION_WINDOW = 3
MIN_GENERATIONS = 2


@dataclass(frozen=True)
class OntologyField:
    name: str
    field_type: str
    description: str = ""


@dataclass(frozen=True)
class OntologyDelta:
    added: tuple[str, ...]
    removed: tuple[str, ...]
    modified: tuple[str, ...]
    similarity: float


def compute_delta(
    old: list[OntologyField], new: list[OntologyField]
) -> OntologyDelta:
    """Similarity = 0.5*name + 0.3*type + 0.2*exact.

    Every score divides by the union of field names, so an added field dilutes
    similarity even when nothing else changed - that is what makes the gate
    react to schema growth instead of only to renames.
    """
    old_by_name = {f.name: f for f in old}
    new_by_name = {f.name: f for f in new}
    old_names, new_names = set(old_by_name), set(new_by_name)

    added = tuple(sorted(new_names - old_names))
    removed = tuple(sorted(old_names - new_names))
    common = old_names & new_names
    all_names = old_names | new_names

    modified = tuple(
        sorted(
            name
            for name in common
            if old_by_name[name].field_type != new_by_name[name].field_type
            or old_by_name[name].description != new_by_name[name].description
        )
    )

    if not all_names:
        # Two empty schemas are trivially identical.
        return OntologyDelta(added, removed, modified, 1.0)

    total = len(all_names)
    name_score = len(common) / total
    type_score = (
        sum(1 for n in common if old_by_name[n].field_type == new_by_name[n].field_type) / total
    )
    exact_score = (
        sum(
            1
            for n in common
            if old_by_name[n].field_type == new_by_name[n].field_type
            and old_by_name[n].description == new_by_name[n].description
        )
        / total
    )

    similarity = 0.5 * name_score + 0.3 * type_score + 0.2 * exact_score
    return OntologyDelta(added, removed, modified, similarity)


class Action(StrEnum):
    CONTINUE = "continue"
    CONVERGED = "converged"
    CAPPED = "capped"


def decide_next_generation(similarities: list[float], generation: int) -> Action:
    """Any one termination signal stops the loop.

    Convergence is withheld until MIN_GENERATIONS have completed, so a single
    lucky generation cannot declare stability.
    """
    if generation >= MAX_GENERATIONS:
        return Action.CAPPED
    if len(similarities) < MIN_GENERATIONS - 1 or not similarities:
        return Action.CONTINUE

    window = similarities[-STAGNATION_WINDOW:]
    if len(window) == STAGNATION_WINDOW and all(s >= CONVERGENCE_THRESHOLD for s in window):
        return Action.CONVERGED  # stagnation: stable across the whole window
    if similarities[-1] >= CONVERGENCE_THRESHOLD:
        return Action.CONVERGED  # ontology stability
    return Action.CONTINUE


# --------------------------------------------------------------------------
# Stagnation detection (resilience/stagnation.py) - the loop's escape hatch
# --------------------------------------------------------------------------

SPINNING_THRESHOLD = 3
OSCILLATION_CYCLES = 2
NO_DRIFT_EPSILON = 0.01
NO_DRIFT_ITERATIONS = 3

PERSONA_FOR_PATTERN = {
    "spinning": "hacker",  # same wall repeatedly -> find another way in
    "oscillation": "architect",  # flip-flopping -> the structure is wrong
    "no_drift": "researcher",  # moving without progress -> missing evidence
}


@dataclass
class ExecutionHistory:
    output_hashes: list[str] = field(default_factory=list)
    drift_scores: list[float] = field(default_factory=list)


def detect_stagnation(history: ExecutionHistory) -> str | None:
    """Return the stagnation pattern name, or None when progress looks real."""
    hashes = history.output_hashes
    if len(hashes) >= SPINNING_THRESHOLD and len(set(hashes[-SPINNING_THRESHOLD:])) == 1:
        return "spinning"

    # A→B→A→B needs 2 full cycles = 4 samples before it is a pattern.
    need = OSCILLATION_CYCLES * 2
    if len(hashes) >= need:
        tail = hashes[-need:]
        if len(set(tail)) == 2 and tail[0::2].count(tail[0]) == len(tail[0::2]) and tail[
            1::2
        ].count(tail[1]) == len(tail[1::2]):
            return "oscillation"

    drifts = history.drift_scores
    if len(drifts) >= NO_DRIFT_ITERATIONS:
        recent = drifts[-NO_DRIFT_ITERATIONS:]
        if max(recent) - min(recent) < NO_DRIFT_EPSILON:
            return "no_drift"
    return None


# --------------------------------------------------------------------------
# Verification
# --------------------------------------------------------------------------


def _expect(actual, expected, label: str) -> None:
    if isinstance(expected, float):
        ok = abs(actual - expected) < 1e-9
    else:
        ok = actual == expected
    if not ok:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")
    print(f"  ok  {label}")


def _check() -> None:
    print("Gate 1 - ambiguity <= 0.2")

    # The README's worked example: 0.9/0.8/0.7 -> clarity 0.81, ambiguity 0.19.
    readme = score_ambiguity({"goal": 0.9, "constraint": 0.8, "success": 0.7})
    _expect(round(readme.clarity, 10), 0.81, "README example clarity = 0.81")
    _expect(round(readme.score, 10), 0.19, "README example ambiguity = 0.19")
    _expect(readme.ready, True, "0.19 passes the gate")

    # Weights must sum to 1.0 or the score is not a probability-like quantity.
    _expect(round(sum(GREENFIELD_WEIGHTS.values()), 10), 1.0, "greenfield weights sum to 1.0")
    _expect(round(sum(BROWNFIELD_WEIGHTS.values()), 10), 1.0, "brownfield weights sum to 1.0")

    # Boundary: exactly 0.2 is allowed (<=, not <).
    boundary = score_ambiguity({"goal": 0.8, "constraint": 0.8, "success": 0.8})
    _expect(round(boundary.score, 10), 0.2, "0.8 across the board = exactly 0.2")
    _expect(boundary.ready, True, "the boundary itself passes")

    # A vague ask is blocked.
    vague = score_ambiguity({"goal": 0.3, "constraint": 0.2, "success": 0.2})
    _expect(vague.ready, False, "'build me something' is blocked")

    # The floor case: total passes, one dimension is still blind.
    lopsided = score_ambiguity({"goal": 1.0, "constraint": 1.0, "success": 0.55})
    _expect(round(lopsided.score, 10), 0.135, "lopsided total = 0.135, under threshold")
    _expect(lopsided.ready, False, "but the success floor still blocks it")
    _expect(lopsided.blocking_dimensions, ("success",), "blocking dimension is named")

    # Brownfield costs a dimension: identical clarity scores, worse ambiguity,
    # because unexamined existing code is itself a form of unclarity.
    green = score_ambiguity({"goal": 0.9, "constraint": 0.9, "success": 0.9})
    brown = score_ambiguity(
        {"goal": 0.9, "constraint": 0.9, "success": 0.9, "context": 0.2}, brownfield=True
    )
    _expect(green.ready, True, "greenfield at 0.9 is ready")
    _expect(brown.ready, False, "same scores + unknown codebase is not")

    try:
        score_ambiguity({"goal": 0.9, "constraint": 0.9, "success": 0.9}, brownfield=True)
    except ValueError as exc:
        _expect("context" in str(exc), True, "brownfield demands the context dimension")
    else:
        raise AssertionError("brownfield without context should raise")

    print("Gate 2 - similarity >= 0.95")

    gen1 = [
        OntologyField("task", "string", "unit of work"),
        OntologyField("priority", "int", "1-5"),
        OntologyField("status", "enum", "open|done"),
    ]
    # Identical schemas: every component scores 1.0.
    _expect(compute_delta(gen1, gen1).similarity, 1.0, "identical schema = 1.00")

    # One added field on a 3-field schema: 3 of 4 names shared -> 0.75 across
    # all three components. This is the README's 0.78-ish CONTINUE case.
    gen2 = [*gen1, OntologyField("due_date", "date", "deadline")]
    delta12 = compute_delta(gen1, gen2)
    _expect(round(delta12.similarity, 10), 0.75, "one added field = 0.75")
    _expect(delta12.added, ("due_date",), "the added field is reported")
    _expect(delta12.similarity < CONVERGENCE_THRESHOLD, True, "0.75 keeps evolving")

    # Same names and types, reworded description: name+type carry, exact drops.
    reworded = [
        OntologyField("task", "string", "a single actionable unit"),
        OntologyField("priority", "int", "1-5"),
        OntologyField("status", "enum", "open|done"),
    ]
    delta_desc = compute_delta(gen1, reworded)
    # 3/3 names, 3/3 types, 2/3 exact -> 0.5 + 0.3 + 0.2*(2/3) = 0.9333.
    # Note how close to the gate a pure wording change lands: rewriting one
    # description alone is enough to hold the loop open for another generation.
    _expect(round(delta_desc.similarity, 10), round(0.8 + 0.2 * 2 / 3, 10), "reworded description = 0.9333")
    _expect(delta_desc.modified, ("task",), "the reworded field is flagged")
    _expect(delta_desc.similarity < CONVERGENCE_THRESHOLD, True, "wording churn still blocks")

    # Type change on one field: the name still matches, but type and exact
    # both lose it -> 0.5 + 0.3*(2/3) + 0.2*(2/3) = 0.8333. A retype costs
    # more than a reword, which is the ordering you want.
    retyped = [
        OntologyField("task", "string", "unit of work"),
        OntologyField("priority", "enum", "1-5"),
        OntologyField("status", "enum", "open|done"),
    ]
    _expect(
        round(compute_delta(gen1, retyped).similarity, 10),
        round(0.5 + 0.5 * 2 / 3, 10),
        "retyped = 0.8333",
    )

    # Empty-vs-empty is the degenerate identity case.
    _expect(compute_delta([], []).similarity, 1.0, "two empty schemas = 1.00")
    _expect(compute_delta([], gen1).similarity, 0.0, "empty -> populated = 0.00")

    print("Loop termination")
    _expect(decide_next_generation([], 1), Action.CONTINUE, "gen 1 always continues")
    _expect(decide_next_generation([0.75], 2), Action.CONTINUE, "0.75 continues")
    _expect(decide_next_generation([0.75, 1.0], 3), Action.CONVERGED, "1.00 converges")
    _expect(
        decide_next_generation([0.96, 0.97, 0.99], 4),
        Action.CONVERGED,
        "a stable window converges",
    )
    _expect(
        decide_next_generation([0.5] * 40, MAX_GENERATIONS),
        Action.CAPPED,
        "30 generations is a hard cap",
    )

    print("Stagnation detection")
    _expect(
        detect_stagnation(ExecutionHistory(output_hashes=["a", "a", "a"])),
        "spinning",
        "3 identical outputs = spinning",
    )
    _expect(
        detect_stagnation(ExecutionHistory(output_hashes=["a", "b", "a", "b"])),
        "oscillation",
        "A-B-A-B = oscillation",
    )
    _expect(
        detect_stagnation(ExecutionHistory(drift_scores=[0.40, 0.402, 0.401])),
        "no_drift",
        "flat drift = no_drift",
    )
    _expect(
        detect_stagnation(ExecutionHistory(output_hashes=["a", "b", "c"], drift_scores=[0.1, 0.4, 0.7])),
        None,
        "real movement is not stagnation",
    )
    _expect(PERSONA_FOR_PATTERN["spinning"], "hacker", "spinning routes to the hacker")
    _expect(PERSONA_FOR_PATTERN["oscillation"], "architect", "oscillation routes to the architect")


if __name__ == "__main__":
    _check()
    print("OK")
