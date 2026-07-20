from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ChatRequest(BaseModel):
    user_id: int
    question: str = Field(..., min_length=1, max_length=2000)


class SourceChunk(BaseModel):
    source: str
    page: Optional[int] = None
    text: str


class ChatResponse(BaseModel):
    chat_id: int
    answer: str
    sources: list[SourceChunk]


class ChatHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    chat_id: int
    rating: str = Field(..., pattern="^(up|down)$")
    comment: Optional[str] = None
