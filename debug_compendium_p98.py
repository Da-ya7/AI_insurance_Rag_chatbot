from app.vectorstore.chroma_client import get_collection

c = get_collection()
r = c.get(where={"source": "Sample_Insurance_Policy_Compendium.pdf"}, include=["documents", "metadatas"])

for doc, meta in zip(r["documents"], r["metadatas"]):
    if meta["page"] in (97, 98, 99):
        print(f"--- page {meta['page']} | plan={meta.get('plan')} ---")
        print(doc[:500])
        print()