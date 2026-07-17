from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    groq_api_key: str
    mysql_url: str
    vector_db_path: str = "./vector_db"
    embedding_model: str = "all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 4

    class Config:
        env_file = ".env"


settings = Settings()
