from app.vectorstore.chroma_client import get_collection

collection = get_collection()
results = collection.get(
    where={"source": "Sample_Insurance_Policy_Compendium.pdf"},
    include=["documents", "metadatas"],
)

print(f"Total chunks from compendium: {len(results['ids'])}\n")
for doc, meta in zip(results["documents"], results["metadatas"]):
    if meta["page"] in (5, 6, 7, 8):
        print(f"--- page {meta['page']} ---")
        print(doc)
        print(f"[chunk length: {len(doc)} chars]")
        print()