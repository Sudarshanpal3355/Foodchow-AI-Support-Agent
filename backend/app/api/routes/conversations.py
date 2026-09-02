from fastapi import APIRouter, HTTPException

from backend.app.services.support_service import (
    get_conversations,
    get_conversation,
)


router = APIRouter(
    prefix="/api/conversations",
    tags=["Conversations"],
)


# =========================================================
# GET ALL CONVERSATIONS
# =========================================================

@router.get("")
async def list_conversations():

    conversations = get_conversations()

    return {
        "success": True,
        "count": len(conversations),
        "data": conversations,
    }


# =========================================================
# GET SINGLE CONVERSATION
# =========================================================

@router.get("/{conversation_id}")
async def conversation_details(
    conversation_id: str,
):

    conversation = get_conversation(
        conversation_id
    )

    if conversation is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Conversation "
                f"{conversation_id} not found."
            ),
        )

    return {
        "success": True,
        "data": conversation,
    }