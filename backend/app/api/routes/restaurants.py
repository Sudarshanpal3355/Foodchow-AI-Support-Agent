from fastapi import APIRouter, HTTPException

from backend.app.services.restaurant_service import (
    get_all_outlets,
    get_all_restaurants,
    get_outlet,
    get_restaurant,
)

router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"],
)


@router.get("")
def restaurants():
    restaurants = get_all_restaurants()

    return {
        "success": True,
        "count": len(restaurants),
        "data": restaurants,
    }


@router.get("/{restaurant_id}")
def restaurant_details(restaurant_id: str):
    restaurant = get_restaurant(restaurant_id)

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail=f"Restaurant {restaurant_id} not found.",
        )

    return {
        "success": True,
        "data": restaurant,
    }


@router.get("/outlets/all")
def outlets():
    outlets = get_all_outlets()

    return {
        "success": True,
        "count": len(outlets),
        "data": outlets,
    }


@router.get("/outlets/{outlet_id}")
def outlet_details(outlet_id: str):
    outlet = get_outlet(outlet_id)

    if outlet is None:
        raise HTTPException(
            status_code=404,
            detail=f"Outlet {outlet_id} not found.",
        )

    return {
        "success": True,
        "data": outlet,
    }