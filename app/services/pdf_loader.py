import re
import fitz  # PyMuPDF
from app.config import settings


def extract_text_by_page(pdf_path: str) -> list[dict]:
    """Returns [{page: int, text: str}, ...]"""
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        pages.append({"page": i + 1, "text": page.get_text()})
    doc.close()
    return pages


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\S\n]{2,}", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> list[str]:
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

def process_pdf(pdf_path: str, filename: str) -> list[dict]:
    """Full pipeline: extract -> clean -> chunk. Tags each chunk with the plan
    section it belongs to (based on numbered headers like '2. Family Floater
    Health Plan'), so retrieval can be scoped to one plan at a time."""
    pages = extract_text_by_page(pdf_path)
    records = []
    chunk_id = 0
    current_plan = None
    header_pattern = re.compile(r"\b\d{1,2}\.\s+([A-Z][A-Za-z /&\-]{4,60}(?:Plan|Policy|Insurance|Cover))\b")

    for p in pages:
        raw = p["text"]
        match = header_pattern.search(raw)
        if match:
            current_plan = match.group(1).strip()

        cleaned = clean_text(raw)
        if not cleaned:
            continue
        for chunk in chunk_text(cleaned):
            records.append({
                "id": f"{filename}_p{p['page']}_c{chunk_id}",
                "text": chunk,
                "metadata": {
                    "source": filename,
                    "page": p["page"],
                    "plan": current_plan or "unknown",
                },
            })
            chunk_id += 1
    return records