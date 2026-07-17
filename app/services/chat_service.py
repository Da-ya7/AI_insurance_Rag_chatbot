import json
from sqlalchemy.orm import Session
from app.vectorstore.chroma_client import similarity_search, list_plans
from app.prompts.prompt_builder import build_prompt
from app.services.llm_service import generate_answer
from app.services.validation_service import validate_response
from app.database.models import ChatHistory
from app.schemas.chat import SourceChunk


def get_recent_history(db: Session, user_id: int, limit: int = 4) -> list[dict]:
    """Last N turns for this user, oldest first, for follow-up context."""
    rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    rows.reverse()
    return [{"question": r.question, "answer": r.answer} for r in rows]


def detect_plan(text: str, plans: list[str]) -> str | None:
    text_lower = text.lower()
    for plan in plans:
        if plan.lower() in text_lower:
            return plan
    return None


def handle_chat(db: Session, user_id: int, question: str) -> dict:
    history = get_recent_history(db, user_id)
    plans = list_plans()

    search_query = f"{history[-1]['question']} {question}" if history else question
    plan = detect_plan(search_query, plans)

    chunks = similarity_search(search_query, plan=plan)
    prompt = build_prompt(question, chunks, history)
    raw_answer = generate_answer(prompt)
    final_answer = validate_response(raw_answer, chunks)

    sources = [
        SourceChunk(
            source=c["metadata"].get("source", "unknown"),
            page=c["metadata"].get("page"),
            text=c["text"][:200],
        )
        for c in chunks
    ]

    record = ChatHistory(
        user_id=user_id,
        question=question,
        answer=final_answer,
        retrieved_chunks=json.dumps([s.model_dump() for s in sources]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"answer": final_answer, "sources": sources, "chat_id": record.id}