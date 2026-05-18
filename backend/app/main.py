"""
============================================================
FastAPI Application Entry Point
============================================================
Configures the FastAPI app with CORS middleware, mounts
the API routes, and provides a health-check endpoint.

Run with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
============================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

# ── Application Instance ─────────────────────────────────────
app = FastAPI(
    title="Language Translation Tool",
    description=(
        "A production-ready translation API powered by deep-translator. "
        "Supports 100+ languages via Google Translate, with text-to-speech "
        "capabilities on the frontend via the Web Speech API."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────
# Allow the React frontend (running on localhost:5173 by default)
# to communicate with this backend without CORS issues.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],          # Allow all headers
)

# ── Mount Routes ──────────────────────────────────────────────
app.include_router(router)


# ── Health Check Endpoint ─────────────────────────────────────
@app.get("/", tags=["Health"])
async def health_check() -> dict:
    """
    Simple health-check endpoint to verify the API is running.
    Useful for container orchestration and monitoring.
    """
    return {
        "status": "healthy",
        "service": "Language Translation Tool API",
        "version": "1.0.0",
    }