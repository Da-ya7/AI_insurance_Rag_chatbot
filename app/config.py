from pydantic_settings import BaseSettings
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    gemini_api_key: str
    groq_api_key: str
    mysql_url: str
    vector_db_path: str = os.path.join(BASE_DIR, "vector_db")
    embedding_model: str = "all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
