from app.vectorstore.chroma_client import get_collection

c = get_collection()
r = c.get(where={"source": "Insurance_Basics_FAQ.pdf"}, include=["documents", "metadatas"])

for doc, meta in zip(r["documents"], r["metadatas"]):
    print(f"--- page {meta['page']} ---")
    print(doc[:300])
    print()