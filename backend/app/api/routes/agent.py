from fastapi import APIRouter

from backend.app.database.mongodb import mongodb
from backend.app.services.support_service import (
    get_conversations,
)


router = APIRouter(
    prefix="/api/agent",
    tags=["Agent"],
)


# =========================================================
# AGENT STATUS
# =========================================================

@router.get("/status")
async def agent_status():

    return {
        "agent": "FoodChow AI Support Agent",
        "status": "foundation_ready",
    }


# =========================================================
# AGENT ACTIVITY
# =========================================================

@router.get("/activity")
async def agent_activity():

    """
    Get recent safe operational activity
    performed by the FoodChow AI support agent.

    This endpoint exposes operational metadata only.

    It does NOT expose:
        - hidden chain-of-thought
        - internal reasoning text
        - prompts
        - model internals
    """

    if mongodb.database is None:

        return {
            "success": False,
            "message": "MongoDB is not connected.",
            "data": [],
        }


    conversations = get_conversations()

    activities = []


    # =====================================================
    # EXTRACT ASSISTANT ACTIVITY
    # =====================================================

    for conversation in conversations:

        conversation_id = conversation.get(
            "conversation_id"
        )

        customer_id = conversation.get(
            "customer_id"
        )

        messages = conversation.get(
            "messages",
            [],
        )


        if not isinstance(
            messages,
            list,
        ):

            continue


        for message in messages:

            if not isinstance(
                message,
                dict,
            ):

                continue


            # -------------------------------------------------
            # Only assistant messages contain agent metadata
            # -------------------------------------------------

            if message.get("role") != "assistant":

                continue


            activity = message.get(
                "activity",
                [],
            )


            tools_used = message.get(
                "tools_used",
                [],
            )


            # -------------------------------------------------
            # Create activity record
            # -------------------------------------------------

            activities.append({

                "conversation_id":
                    conversation_id,

                "customer_id":
                    customer_id,

                "message_id":
                    message.get(
                        "message_id"
                    ),

                "timestamp":
                    message.get(
                        "timestamp"
                    ),

                "intent":
                    message.get(
                        "intent"
                    ),

                "confidence":
                    message.get(
                        "confidence"
                    ),

                "requires_escalation":
                    message.get(
                        "requires_escalation",
                        False,
                    ),

                "ticket_id":
                    message.get(
                        "ticket_id"
                    ),

                "tools_used":
                    tools_used,

                "activity":
                    activity,

            })


    # =====================================================
    # SORT NEWEST FIRST
    # =====================================================

    activities.sort(
        key=lambda item:
            item.get(
                "timestamp"
            ) or "",
        reverse=True,
    )


    # =====================================================
    # RETURN
    # =====================================================

    return {

        "success": True,

        "count":
            len(activities),

        "data":
            activities,

    }