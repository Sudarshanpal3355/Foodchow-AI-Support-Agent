from functools import lru_cache


# =========================================================
# RERANKER CONFIGURATION
# =========================================================

RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


# =========================================================
# LOAD RERANKER MODEL
# =========================================================

@lru_cache(maxsize=1)
def _get_reranker():
    from sentence_transformers import CrossEncoder

    return CrossEncoder(RERANKER_MODEL)


# =========================================================
# RERANK DOCUMENTS
# =========================================================

def rerank_documents(
    query: str,
    documents: list[dict],
    top_k: int = 3,
) -> list[dict]:
    """
    Rerank retrieved documents using a CrossEncoder.

    The CrossEncoder evaluates the query and each document
    together and produces a relevance score.
    """

    if not query.strip():
        return []

    if not documents:
        return []

    pairs = []

    for document in documents:

        content = document.get(
            "content",
            "",
        )

        if not content:
            continue

        pairs.append(
            (
                query,
                content,
            )
        )

    if not pairs:
        return []

    scores = _get_reranker().predict(
        pairs
    )

    reranked = []

    score_index = 0

    for document in documents:

        content = document.get(
            "content",
            "",
        )

        if not content:
            continue

        result = dict(document)

        result["rerank_score"] = float(
            scores[score_index]
        )

        reranked.append(
            result
        )

        score_index += 1

    reranked.sort(
        key=lambda item: item.get(
            "rerank_score",
            0.0,
        ),
        reverse=True,
    )

    return reranked[:top_k]
