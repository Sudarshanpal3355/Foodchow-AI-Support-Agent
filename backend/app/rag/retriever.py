from backend.app.rag.embeddings import (
    embed_query,
)

from backend.app.rag.vector_store import (
    get_knowledge_collection,
)


# =========================================================
# RETRIEVER CONFIGURATION
# =========================================================

DEFAULT_TOP_K = 5


# =========================================================
# RETRIEVE KNOWLEDGE
# =========================================================

def retrieve_documents(
    query: str,
    top_k: int = DEFAULT_TOP_K,
) -> list[dict]:
    """
    Retrieve the most relevant knowledge-base chunks
    for a customer query using ChromaDB similarity search.
    """

    if not query or not query.strip():
        return []

    collection = get_knowledge_collection()

    if collection.count() == 0:
        return []

    query_embedding = embed_query(
        query
    )

    if not query_embedding:
        return []

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=min(
            top_k,
            collection.count(),
        ),
        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )

    documents = (
        results.get(
            "documents",
            [[]],
        )[0]
    )

    metadatas = (
        results.get(
            "metadatas",
            [[]],
        )[0]
    )

    distances = (
        results.get(
            "distances",
            [[]],
        )[0]
    )

    retrieved = []

    for index, content in enumerate(
        documents
    ):

        metadata = (
            metadatas[index]
            if index < len(metadatas)
            else {}
        )

        distance = (
            distances[index]
            if index < len(distances)
            else None
        )

        # Chroma returns distance.
        # Convert it into a simple relevance score.
        score = (
            1.0 / (1.0 + distance)
            if distance is not None
            else 0.0
        )

        chunk_id = (
            metadata.get(
                "chunk_id"
            )
            or metadata.get(
                "document_id",
                f"chunk_{index}",
            )
        )

        retrieved.append(
            {
                "document_id": metadata.get(
                "document_id",
                chunk_id,
                ),

                "source": metadata.get(
                    "source",
                    "",
                ),

                "category": metadata.get(
                    "category",
                    "",
                ),

                "content": content,

                "score": score,

                "metadata": metadata,
            }
        )

    return retrieved
