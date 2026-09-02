from fastapi import APIRouter, HTTPException

from backend.app.services.support_service import (
    create_ticket,
    get_ticket,
    get_tickets,
    update_ticket,
)

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


@router.get("")
def all_tickets():
    tickets = get_tickets()

    return {
        "success": True,
        "count": len(tickets),
        "data": tickets,
    }


@router.get("/{ticket_id}")
def ticket_details(ticket_id: str):
    ticket = get_ticket(ticket_id)

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail=f"Ticket {ticket_id} not found.",
        )

    return {
        "success": True,
        "data": ticket,
    }


@router.post("")
def create_support_ticket(ticket_data: dict):
    ticket = create_ticket(ticket_data)

    return {
        "success": True,
        "message": "Support ticket created successfully.",
        "data": ticket,
    }


@router.patch("/{ticket_id}")
def update_support_ticket(
    ticket_id: str,
    update_data: dict,
):
    ticket = update_ticket(
        ticket_id,
        update_data,
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail=f"Ticket {ticket_id} not found.",
        )

    return {
        "success": True,
        "message": "Ticket updated successfully.",
        "data": ticket,
    }