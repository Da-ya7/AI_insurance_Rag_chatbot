from app.vectorstore.chroma_client import get_collection

c = get_collection()
existing = c.get(where={"source": "Insurance_Basics_FAQ.pdf"}, include=[])
ids = existing["ids"]

if ids:
    c.delete(ids=ids)
    print(f"Deleted {len(ids)} old chunks for Insurance_Basics_FAQ.pdf")
else:
    print("No existing chunks found for that filename.")