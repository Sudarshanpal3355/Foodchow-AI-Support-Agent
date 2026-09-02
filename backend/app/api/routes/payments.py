from fastapi import APIRouter, HTTPException

from backend.app.services.payment_service import (
    get_payment_by_order,
    get_payment_status,
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


@router.get("/{order_id}")
def payment_details(order_id: str):
    payment = get_payment_by_order(order_id)

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail=f"Payment for order {order_id} not found.",
        )

    return {
        "success": True,
        "data": payment,
    }


@router.get("/{order_id}/status")
def payment_status(order_id: str):
    payment = get_payment_status(order_id)

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail=f"Payment for order {order_id} not found.",
        )

    return {
        "success": True,
        "data": payment,
    }