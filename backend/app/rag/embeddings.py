from functools import lru_cache


# =========================================================
# EMBEDDING CONFIGURATION
# =========================================================

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"


# =========================================================
# LOAD EMBEDDING MODEL
# =========================================================

@lru_cache(maxsize=1)
def _get_embedding_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(EMBEDDING_MODEL_NAME)


# =========================================================
# EMBED DOCUMENTS
# =========================================================

def embed_documents(
    texts: list[str],
) -> list[list[float]]:
    """
    Convert knowledge-base documents/chunks into
    numerical embedding vectors.
    """

    if not texts:
        return []

    embeddings = _get_embedding_model().encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embeddings.tolist()


# =========================================================
# EMBED QUERY
# =========================================================

def embed_query(
    query: str,
) -> list[float]:
    """
    Convert a customer query into an embedding vector.
    """

    if not query or not query.strip():
        return []

    embedding = _get_embedding_model().encode(
        query,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embedding.tolist()


# =========================================================
# EMBEDDING DIMENSION
# =========================================================

def get_embedding_dimension() -> int:
    """
    Return the dimensionality of the embedding model.
    """

    return _get_embedding_model().get_embedding_dimension()
