from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Feedback
from app.schemas.chat import FeedbackRequest

router = APIRouter()


@router.post("/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    fb = Feedback(chat_id=req.chat_id, rating=req.rating, comment=req.comment)
    db.add(fb)
    db.commit()
    return {"status": "recorded"}
