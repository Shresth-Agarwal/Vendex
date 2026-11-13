from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import router
import logging
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Vendex")

# Enable CORS for Spring Boot requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def home():
    logger.info("Health check request received")
    return {"message": "Welcome to Vendex", "status": "running"}

@app.get("/health")
def health():
    """Health check endpoint for Spring Boot integration"""
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "service": "Vendex FastAPI",
        "endpoints": {
            "roster": "/api/assign-staff",
            "sourcing": "/api/sourcing/recommend"
        }
    }

if __name__ == "__main__":
    logger.info("Starting Vendex FastAPI server...")
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )