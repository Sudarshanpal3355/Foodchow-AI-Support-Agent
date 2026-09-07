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
    mark_mongodb_unavailable,
)
from backend.app.admin.router import router as admin_router


# ============================================================
# LOGGING
# ============================================================

setup_logging()

logger = logging.getLogger(__name__)


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle.

    IMPORTANT:
    Do not load Hugging Face / SentenceTransformer models here.
    Loading large AI models during startup can exceed Render's
    512 MB memory limit.
    """

    logger.info("Starting %s", settings.APP_NAME)

    try:
        connect_to_mongodb()
        if settings.MONGODB_URI:
            logger.info("MongoDB connection established.")
            seed_demo_users()
            logger.info("Demo users initialized.")
        else:
            logger.warning("MONGODB_URI is not configured; database-backed features are unavailable.")
    except Exception as exc:
        mark_mongodb_unavailable()
        logger.exception("MongoDB startup failed; continuing so /health remains available: %s", exc)

    # --------------------------------------------------------
    # Application is now running
    # --------------------------------------------------------
    yield

    # --------------------------------------------------------
    # Shutdown
    # --------------------------------------------------------
    try:
        close_mongodb_connection()
        logger.info("MongoDB connection closed.")
    except Exception as exc:
        logger.exception(
            "Error while closing MongoDB connection: %s",
            exc,
        )

    logger.info("Application shutdown complete.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

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
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health_check():
    """
    Lightweight endpoint used by Render to verify
    that the backend is running.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
    }


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
async def root():
    return {
        "message": f"{settings.APP_NAME} API is running",
        "status": "ok",
    }


# ============================================================
# API ROUTES
# ============================================================

# Main application routes
app.include_router(api_router)

# Authentication routes
app.include_router(auth_router)

# Admin routes
app.include_router(admin_router)