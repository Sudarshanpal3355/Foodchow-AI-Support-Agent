from fastapi import APIRouter, HTTPException

from backend.app.services.order_service import (
    get_customer_orders,
    get_order,
    get_order_status,
    get_outlet_orders,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.get("/{order_id}")
def order_details(order_id: str):
    order = get_order(order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail=f"Order {order_id} not found.",
        )

    return {
        "success": True,
        "data": order,
    }


@router.get("/{order_id}/status")
def order_status(order_id: str):
    order = get_order_status(order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail=f"Order {order_id} not found.",
        )

    return {
        "success": True,
        "data": order,
    }


@router.get("/customer/{customer_id}")
def customer_orders(customer_id: str):
    orders = get_customer_orders(customer_id)

    return {
        "success": True,
        "count": len(orders),
        "data": orders,
    }


@router.get("/outlet/{outlet_id}")
def outlet_orders(outlet_id: str):
    orders = get_outlet_orders(outlet_id)

    return {
        "success": True,
        "count": len(orders),
        "data": orders,
    }