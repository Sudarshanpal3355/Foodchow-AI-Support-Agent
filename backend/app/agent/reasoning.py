from typing import Any

from backend.app.agent.state import AgentState


def analyze_reasoning(state: AgentState) -> AgentState:
    """
    Analyze the available information and determine
    what the agent knows about the customer's issue.
    """

    intent = state.get("intent")
    entities = state.get("entities", {})
    tool_results = state.get("tool_results", [])

    reasoning_parts: list[str] = []

    if intent:
        reasoning_parts.append(
            f"Detected support intent: {intent}."
        )

    if entities:
        reasoning_parts.append(
            f"Identified entities: {entities}."
        )

    if tool_results:
        reasoning_parts.append(
            f"Tool results available: {len(tool_results)}."
        )
    else:
        reasoning_parts.append(
            "No tool results are currently available."
        )

    reasoning = " ".join(reasoning_parts)

    state["reasoning"] = reasoning

    return state