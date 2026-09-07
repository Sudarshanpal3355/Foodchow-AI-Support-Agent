from pathlib import Path
from functools import lru_cache

from backend.app.rag.embeddings import (
    embed_documents,
)


# =========================================================
# CHROMA CONFIGURATION
# =========================================================

PROJECT_ROOT = (
    Path(__file__).resolve().parents[3]
)

CHROMA_PATH = (
    PROJECT_ROOT / "data" / "chroma"
)

COLLECTION_NAME = "foodchow_knowledge"


# =========================================================
# CHROMA CLIENT
# =========================================================

@lru_cache(maxsize=1)
def _get_client():
    import chromadb

    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(CHROMA_PATH))


# =========================================================
# GET COLLECTION
# =========================================================

def get_knowledge_collection():
    """
    Get or create the FoodChow knowledge collection.
    """

    return _get_client().get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={
            "description": (
                "FoodChow AI Support Agent knowledge base"
            )
        },
    )


# =========================================================
# INDEX KNOWLEDGE BASE
# =========================================================

def index_knowledge_base() -> dict:
    """
    Build chunks, generate embeddings and store them
    in ChromaDB.
    """

    from backend.app.rag.chunker import build_knowledge_chunks

    chunks = build_knowledge_chunks()

    if not chunks:
        return {
            "success": True,
            "count": 0,
            "message": (
                "No knowledge chunks found."
            ),
        }

    collection = get_knowledge_collection()

    texts = [
        chunk["content"]
        for chunk in chunks
    ]

    embeddings = embed_documents(
        texts
    )

    ids = [
        chunk["chunk_id"]
        for chunk in chunks
    ]

    metadatas = [
        chunk["metadata"]
        for chunk in chunks
    ]

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    return {
        "success": True,
        "count": len(chunks),
        "collection": COLLECTION_NAME,
        "message": (
            "Knowledge base indexed successfully."
        ),
    }


# =========================================================
# COLLECTION INFORMATION
# =========================================================

def get_collection_count() -> int:
    """
    Return the number of indexed knowledge chunks.
    """

    collection = get_knowledge_collection()

    return collection.count()


# =========================================================
# CLEAR COLLECTION
# =========================================================

def clear_knowledge_collection() -> None:
    """
    Delete and recreate the knowledge collection.

    Useful when rebuilding the knowledge index.
    """

    try:
        _get_client().delete_collection(
            name=COLLECTION_NAME
        )

    except Exception:
        pass

    _get_client.cache_clear()
    get_knowledge_collection()
