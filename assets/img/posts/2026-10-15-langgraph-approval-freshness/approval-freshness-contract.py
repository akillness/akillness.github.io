"""Synthetic application-side approval freshness predicate; not a LangGraph runtime test."""
from datetime import datetime
from hashlib import sha256
import json


def action_digest(action):
    canonical = json.dumps(action, sort_keys=True, separators=(",", ":"))
    return sha256(canonical.encode("utf-8")).hexdigest()


def approval_is_current(state, approval, current_context, now):
    # Resolve current_context from authoritative application configuration for this
    # in-flight thread immediately before the effect; never copy it from checkpoint state.
    try:
        expires_at = datetime.fromisoformat(approval["expires_at"])
        return (
            approval["thread_id"] == state["thread_id"]
            and approval["action_sha256"] == action_digest(state["pending_action"])
            and approval["behavior_version"] == current_context["behavior_version"]
            and approval["policy_version"] == current_context["policy_version"]
            and approval["consumed_at"] is None
            and now < expires_at
        )
    except (KeyError, TypeError, ValueError):
        return False


state = {
    "thread_id": "thread-demo",
    "pending_action": {"operation": "refund", "amount": 25, "currency": "USD"},
    # These are the versions recorded in the checkpoint. The predicate does not
    # use them as current authorization; current_context is resolved separately.
    "checkpoint_behavior_version": "flow-v7",
    "checkpoint_policy_version": "policy-v4",
}
current_context = {
    # This example resolver still allows the old behavior for this in-flight thread.
    "behavior_version": "flow-v7",
    "policy_version": "policy-v4",
}
approval = {
    "thread_id": state["thread_id"],
    "action_sha256": action_digest(state["pending_action"]),
    "behavior_version": current_context["behavior_version"],
    "policy_version": current_context["policy_version"],
    "expires_at": "2026-10-15T11:00:00+09:00",
    "consumed_at": None,
}
now = datetime.fromisoformat("2026-10-15T10:30:00+09:00")

cases = [
    ("matching approval for explicitly allowed in-flight versions", state, approval, current_context, now, True),
    (
        "changed action payload",
        {**state, "pending_action": {**state["pending_action"], "amount": 30}},
        approval,
        current_context,
        now,
        False,
    ),
    (
        "authoritative behavior changed while checkpoint stayed unchanged",
        state,
        approval,
        {**current_context, "behavior_version": "flow-v8"},
        now,
        False,
    ),
    (
        "authoritative policy changed while checkpoint stayed unchanged",
        state,
        approval,
        {**current_context, "policy_version": "policy-v5"},
        now,
        False,
    ),
    ("different thread", {**state, "thread_id": "another-thread"}, approval, current_context, now, False),
    (
        "expired approval",
        state,
        approval,
        current_context,
        datetime.fromisoformat("2026-10-15T11:00:01+09:00"),
        False,
    ),
    (
        "exact expiry boundary is expired",
        state,
        approval,
        current_context,
        datetime.fromisoformat("2026-10-15T11:00:00+09:00"),
        False,
    ),
    ("already consumed approval", state, {**approval, "consumed_at": "2026-10-15T10:20:00+09:00"}, current_context, now, False),
    ("missing action digest", state, {k: v for k, v in approval.items() if k != "action_sha256"}, current_context, now, False),
    ("malformed expiry", state, {**approval, "expires_at": "not-a-date"}, current_context, now, False),
    ("missing authoritative policy context", state, approval, {"behavior_version": "flow-v7"}, now, False),
]

for name, test_state, test_approval, test_context, test_now, expected in cases:
    actual = approval_is_current(test_state, test_approval, test_context, test_now)
    assert actual is expected, f"{name}: expected {expected}, got {actual}"
    print(f"PASS {name}")
print(f"SUMMARY {len(cases)}/{len(cases)} synthetic cases passed")
