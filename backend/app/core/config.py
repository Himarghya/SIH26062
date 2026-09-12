import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "POLARIS — Integrated Polar Expedition Logistics & Asset Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "polaris-super-secret-key-ncpor-moes-2026-extreme-polar")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for polar stations
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./polaris.db")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    class Config:
        case_sensitive = True

settings = Settings()
