import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "City-Wide AI Vehicle Tracking & Traffic Analytics"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "civic-ops-super-secret-key-2026-sih"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # PostgreSQL via Neon or fallback SQLite for local development
    DATABASE_URL: str = "sqlite:///./traffic_analytics.db"
    
    _BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    EVIDENCE_DIR: str = os.path.join(_BASE_DIR, "static", "evidence")
    FEEDS_DIR: str = os.path.join(_BASE_DIR, "static", "feeds")
    
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()
