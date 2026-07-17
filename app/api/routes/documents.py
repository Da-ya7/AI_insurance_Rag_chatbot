import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Document
from app.services.pdf_loader import process_pdf
from app.vectorstore.chroma_client import add_chunks

router = APIRouter()

UPLOAD_DIR = "data/insurance_pdfs"


@router.post("/upload-document")
def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    records = process_pdf(save_path, file.filename)
    add_chunks(records)

    pages = len({r["metadata"]["page"] for r in records}) if records else 0
    doc = Document(filename=file.filename, total_pages=pages, total_chunks=len(records))
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {"filename": file.filename, "pages": pages, "chunks_indexed": len(records)}
