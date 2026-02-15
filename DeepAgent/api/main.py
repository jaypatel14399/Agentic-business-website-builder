"""FastAPI main application."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import jobs, websites, discovery
from api.websocket_manager import websocket_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Multi-Agent Business Website Generator API",
    description="API for generating business websites using AI agents",
    version="1.0.0"
)

# Configure CORS
# Allow common development origins
# Note: allow_origins=["*"] cannot be used with allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5174",  # Alternative Vite port
        "http://127.0.0.1:5174",
        "http://localhost:8080",  # Alternative dev server
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(jobs.router)
app.include_router(websites.router)
app.include_router(discovery.router)


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status.
    """
    return {
        "status": "healthy",
        "service": "Multi-Agent Business Website Generator API"
    }


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    logger.info("FastAPI application starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("FastAPI application shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
