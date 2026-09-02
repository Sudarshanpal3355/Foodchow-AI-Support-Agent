from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api import api_router
from backend.app.auth.router import router as auth_router
from backend.app.auth.service import seed_demo_users
from backend.app.core.config import settings
from backend.app.core.logging import setup_logging
from backend.app.database.mongodb import (
    connect_to_mongodb,
    close_mongodb_connection,
)
from backend.app.admin.router import router as admin_router


setup_logging()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s", settings.APP_NAME)

    # Connect to MongoDB
    connect_to_mongodb()

    # Create demo accounts if they do not already exist
    seed_demo_users()

    logger.info("Application startup complete.")

    yield

    # Close MongoDB connection
    close_mongodb_connection()

    logger.info("Application shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Agentic AI Customer Support System for FoodChow",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

# Existing application routes
app.include_router(api_router)

# Authentication routes
app.include_router(auth_router)

# Admin routes
app.include_router(admin_router)