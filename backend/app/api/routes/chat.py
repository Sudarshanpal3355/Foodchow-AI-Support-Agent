from fastapi import APIRouter

from backend.app.agent.orchestrator import (
    run_support_agent,
)

from backend.app.services.support_service import (
    create_conversation,
    get_conversation,
    add_message_to_conversation,
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


# =========================================================
# CONTEXT HELPER
# =========================================================

def build_conversation_context(
    conversation: dict | None,
) -> str:
    """
    Build safe conversation context for the AI agent.

    Only previous customer and assistant messages are included.
    """

    if not conversation:
        return ""

    messages = conversation.get(
        "messages",
        [],
    )

    if not isinstance(messages, list):
        return ""

    recent_messages = messages[-10:]

    context_lines = []

    for message_item in recent_messages:

        if not isinstance(
            message_item,
            dict,
        ):
            continue

        role = message_item.get("role")

        content = message_item.get("content")

        if not content:
            continue

        if role == "user":

            context_lines.append(
                f"Customer: {content}"
            )

        elif role == "assistant":

            context_lines.append(
                f"FoodChow AI: {content}"
            )

    if not context_lines:
        return ""

    return "\n".join(context_lines)


# =========================================================
# CHAT ENDPOINT
# =========================================================

@router.post("")
def chat(
    message: dict,
):
    """
    Process a customer support message.

    The client should send the conversation_id returned by
    the previous request when continuing a conversation.

    Example:

        First request:
        {
            "message": "What is the status of my order?"
        }

        Response:
        {
            "conversation_id": "CONV-123"
        }

        Follow-up:
        {
            "message": "ORD-1001",
            "conversation_id": "CONV-123"
        }
    """

    # =====================================================
    # GET INPUT
    # =====================================================

    user_message = str(
        message.get(
            "message",
            "",
        )
    ).strip()

    customer_id = message.get(
        "customer_id"
    )

    conversation_id = message.get(
        "conversation_id"
    )

    # =====================================================
    # VALIDATION
    # =====================================================

    if not user_message:

        return {
            "success": False,
            "message": "Message cannot be empty.",
        }

    try:

        # =================================================
        # CREATE OR LOAD CONVERSATION
        # =================================================

        if not conversation_id:

            conversation = create_conversation(
                customer_id=customer_id,
            )

            conversation_id = conversation[
                "conversation_id"
            ]

        else:

            conversation = get_conversation(
                conversation_id
            )

            if conversation is None:

                return {
                    "success": False,
                    "message": (
                        f"Conversation "
                        f"{conversation_id} "
                        f"not found."
                    ),
                }

        # =================================================
        # BUILD PREVIOUS CONTEXT
        # =================================================

        conversation_context = (
            build_conversation_context(
                conversation
            )
        )

        # =================================================
        # SAVE CURRENT CUSTOMER MESSAGE
        # =================================================

        add_message_to_conversation(
            conversation_id=conversation_id,
            role="user",
            content=user_message,
        )

        # =================================================
        # RUN SUPPORT AGENT
        # =================================================

        state = run_support_agent(
            user_message=user_message,
            conversation_context=conversation_context,
        )

        # =================================================
        # RESPONSE
        # =================================================

        response = state.get(
            "response"
        )

        if not response:

            response = (
                "We received your request, "
                "but could not generate a response."
            )

        # =================================================
        # METADATA
        # =================================================

        intent = state.get(
            "intent"
        )

        confidence = state.get(
            "confidence"
        )

        requires_escalation = bool(
            state.get(
                "requires_escalation",
                False,
            )
        )

        # =================================================
        # SAFE ACTIVITY
        # =================================================

        activity = state.get(
            "activity",
            [],
        )

        if not isinstance(
            activity,
            list,
        ):
            activity = []

        # =================================================
        # TOOLS USED
        # =================================================

        tools_used = []

        for event in activity:

            if not isinstance(
                event,
                dict,
            ):
                continue

            if event.get(
                "step"
            ) != "tool_execution":

                continue

            tool_name = event.get(
                "name"
            )

            if (
                tool_name
                and tool_name not in tools_used
            ):

                tools_used.append(
                    tool_name
                )

        # =================================================
        # FALLBACK TOOL EXTRACTION
        # =================================================

        if not tools_used:

            for result in state.get(
                "tool_results",
                [],
            ):

                if not isinstance(
                    result,
                    dict,
                ):
                    continue

                tool_name = result.get(
                    "tool"
                )

                if (
                    tool_name
                    and tool_name not in tools_used
                ):

                    tools_used.append(
                        tool_name
                    )

        # =================================================
        # FIND TICKET ID
        # =================================================

        ticket_id = None

        for result in state.get(
            "tool_results",
            [],
        ):

            if not isinstance(
                result,
                dict,
            ):
                continue

            if not result.get(
                "success"
            ):
                continue

            data = result.get(
                "data",
                {},
            )

            if not isinstance(
                data,
                dict,
            ):
                continue

            if data.get(
                "ticket_id"
            ):

                ticket_id = data[
                    "ticket_id"
                ]

                break

        # =================================================
        # SAVE AI RESPONSE
        # =================================================

        add_message_to_conversation(
            conversation_id=conversation_id,
            role="assistant",
            content=response,
            intent=intent,
            confidence=confidence,
            requires_escalation=(
                requires_escalation
            ),
            ticket_id=ticket_id,
            tools_used=tools_used,
            activity=activity,
        )

        # =================================================
        # FINAL API RESPONSE
        # =================================================

        return {
            "success": True,

            "data": {

                "conversation_id":
                    conversation_id,

                "user_message":
                    user_message,

                "response":
                    response,

                "intent":
                    intent,

                "confidence":
                    confidence,

                "entities":
                    state.get(
                        "entities",
                        {},
                    ),

                "requires_escalation":
                    requires_escalation,

                "ticket_id":
                    ticket_id,

                "tools_used":
                    tools_used,

                "activity":
                    activity,
            },
        }

    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as exc:

        return {
            "success": False,

            "message": (
                "Unable to process "
                "the support request."
            ),

            "error": str(exc),
        }