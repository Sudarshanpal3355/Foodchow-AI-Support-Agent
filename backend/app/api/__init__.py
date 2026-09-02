from fastapi import APIRouter

from backend.app.api.routes.agent import router as agent_router
from backend.app.api.routes.chat import router as chat_router
from backend.app.api.routes.conversations import router as conversations_router
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.knowledge import router as knowledge_router
from backend.app.api.routes.orders import router as orders_router
from backend.app.api.routes.restaurants import router as restaurants_router
from backend.app.api.routes.tickets import router as tickets_router
from backend.app.api.routes.payments import router as payments_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(chat_router)
api_router.include_router(conversations_router)
api_router.include_router(tickets_router)
api_router.include_router(orders_router)
api_router.include_router(restaurants_router)
api_router.include_router(knowledge_router)
api_router.include_router(agent_router)
api_router.include_router(payments_router)