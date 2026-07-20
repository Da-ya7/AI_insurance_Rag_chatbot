from app.vectorstore.chroma_client import similarity_search, get_collection

print("=== all FAQ chunks currently in store ===")
c = get_collection()
r = c.get(where={"source": "Insurance_Basics_FAQ.pdf"}, include=["documents", "metadatas"])
for doc, meta in zip(r["documents"], r["metadatas"]):
    print(f"--- page {meta['page']} ---")
    print(doc[:200])
    print()

print("=== similarity_search results for 'what is term insurance?' ===")
chunks = similarity_search("what is term insurance?", top_k=10)
for ch in chunks:
    print(ch["metadata"]["source"], "| page", ch["metadata"]["page"], "| dist", round(ch["distance"], 3))
    print(ch["text"][:150])
    print()