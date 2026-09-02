from backend.app.agent.state import AgentState


def evaluate_confidence(state: AgentState) -> AgentState:
    """
    Evaluate whether the agent has enough confidence
    to continue automatically or should escalate.

    An escalation that has already been triggered is preserved.
    """

    confidence = state.get("confidence")

    if confidence is None:
        confidence = 0.0
        state["confidence"] = confidence

    # Minimum confidence required for automatic handling.
    threshold = 0.70

    # Preserve an escalation that has already been triggered.
    if state.get("requires_escalation", False):
        state["requires_escalation"] = True

    elif confidence < threshold:
        state["requires_escalation"] = True

    else:
        state["requires_escalation"] = False

    return state