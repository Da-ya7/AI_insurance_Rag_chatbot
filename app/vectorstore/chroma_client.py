import chromadb
from app.config import settings
from app.services.embedding_service import embed_texts, embed_query

_client = None
_collection = None

COLLECTION_NAME = "insurance_docs"


def get_collection():
    global _client, _collection
    if _client is None:
        _client = chromadb.PersistentClient(path=settings.vector_db_path)
    if _collection is None:
        _collection = _client.get_or_create_collection(name=COLLECTION_NAME)
    return _collection


def add_chunks(records: list[dict]):
    """records: [{id, text, metadata}]"""
    if not records:
        return
    collection = get_collection()
    embeddings = embed_texts([r["text"] for r in records])
    collection.add(
        ids=[r["id"] for r in records],
        documents=[r["text"] for r in records],
        metadatas=[r["metadata"] for r in records],
        embeddings=embeddings,
    )


def similarity_search(query: str, top_k: int = None, plan: str = None) -> list[dict]:
    top_k = top_k or settings.top_k
    collection = get_collection()
    query_embedding = embed_query(query)

    where_filter = {"plan": plan} if plan else None
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter,
    )

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]

    if not docs and where_filter:
        # plan filter guessed wrong -> retry unfiltered instead of starving retrieval
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
        )
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        dists = results.get("distances", [[]])[0]

    return [{"text": d, "metadata": m, "distance": dist} for d, m, dist in zip(docs, metas, dists)]

def list_plans() -> list[str]:
    """All distinct plan names currently indexed, for matching against questions."""
    collection = get_collection()
    all_meta = collection.get(include=["metadatas"])["metadatas"]
    plans = {m.get("plan") for m in all_meta if m.get("plan") and m["plan"] != "unknown"}
    return sorted(plans)