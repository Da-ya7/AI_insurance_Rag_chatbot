from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import ChatHistory
from app.schemas.chat import ChatHistoryItem

router = APIRouter()


@router.get("/chat-history/{user_id}", response_model=list[ChatHistoryItem])
def chat_history(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.created_at.desc())
        .all()
    )
    return rows


@router.get("/health")
def health():
    return {"status": "ok"}
