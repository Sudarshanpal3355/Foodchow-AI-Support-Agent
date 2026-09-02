# =========================================================
# FOODCHOW UNIFIED RAG PIPELINE
# =========================================================

from backend.app.rag.retriever import (
    retrieve_documents,
)

from backend.app.rag.reranker import (
    rerank_documents,
)

from backend.app.rag.citations import (
    build_citations,
    format_citations,
)


# =========================================================
# CONFIGURATION
# =========================================================

DEFAULT_RETRIEVAL_TOP_K = 5
DEFAULT_RERANK_TOP_K = 3

# ---------------------------------------------------------
# Minimum CrossEncoder relevance score.
#
# Documents below this score are treated as irrelevant.
#
# This prevents unrelated questions such as:
#
#     "What is the capital of France?"
#
# from receiving unrelated FoodChow knowledge.
# ---------------------------------------------------------

RERANK_RELEVANCE_THRESHOLD = 0.0


# =========================================================
# RUN RAG PIPELINE
# =========================================================

def run_rag(
    query: str,
    retrieval_top_k: int = DEFAULT_RETRIEVAL_TOP_K,
    rerank_top_k: int = DEFAULT_RERANK_TOP_K,
) -> dict:
    """
    Execute the complete FoodChow RAG pipeline.

    Pipeline:

        Query
          ↓
        Retrieval
          ↓
        Reranking
          ↓
        Relevance filtering
          ↓
        Citations
          ↓
        Final RAG result

    RAG provides procedural and support knowledge.

    Only sufficiently relevant documents are returned.
    """

    # =====================================================
    # VALIDATE QUERY
    # =====================================================

    if not query or not query.strip():

        return {
            "success": False,
            "query": query,
            "documents": [],
            "citations": [],
            "formatted_citations": [],
            "message": "Query cannot be empty.",
        }

    query = query.strip()

    # =====================================================
    # STEP 1 — RETRIEVE
    # =====================================================

    retrieved_documents = retrieve_documents(
        query=query,
        top_k=retrieval_top_k,
    )

    # -----------------------------------------------------
    # No documents retrieved
    # -----------------------------------------------------

    if not retrieved_documents:

        return {
            "success": True,
            "query": query,
            "documents": [],
            "citations": [],
            "formatted_citations": [],
            "message": "No relevant knowledge found.",
        }

    # =====================================================
    # STEP 2 — RERANK
    # =====================================================

    reranked_documents = rerank_documents(
        query=query,
        documents=retrieved_documents,
        top_k=rerank_top_k,
    )

    # -----------------------------------------------------
    # No documents after reranking
    # -----------------------------------------------------

    if not reranked_documents:

        return {
            "success": True,
            "query": query,
            "documents": [],
            "citations": [],
            "formatted_citations": [],
            "message": "No relevant knowledge found.",
        }

    # =====================================================
    # STEP 3 — RELEVANCE FILTER
    # =====================================================
    #
    # The CrossEncoder produces a rerank_score.
    #
    # Only documents meeting the threshold are accepted.
    #
    # Example:
    #
    #     7.72  → accepted
    #     4.21  → accepted
    #     0.50  → accepted
    #    -0.37  → rejected
    #    -5.17  → rejected
    #   -11.20  → rejected
    #
    # This is especially important for out-of-domain
    # questions.
    # =====================================================

    relevant_documents = []

    for document in reranked_documents:

        score = document.get(
            "rerank_score"
        )

        # -------------------------------------------------
        # Ignore documents without a valid score.
        # -------------------------------------------------

        if score is None:

            continue

        try:

            score = float(score)

        except (
            TypeError,
            ValueError,
        ):

            continue

        # -------------------------------------------------
        # Apply relevance threshold.
        # -------------------------------------------------

        if score >= RERANK_RELEVANCE_THRESHOLD:

            relevant_documents.append(
                document
            )

    # =====================================================
    # STEP 4 — NO SUFFICIENTLY RELEVANT KNOWLEDGE
    # =====================================================

    if not relevant_documents:

        return {
            "success": True,
            "query": query,
            "documents": [],
            "citations": [],
            "formatted_citations": [],
            "message": (
                "No sufficiently relevant knowledge found."
            ),
        }

    # =====================================================
    # STEP 5 — BUILD CITATIONS
    # =====================================================

    citations = build_citations(
        relevant_documents
    )

    # =====================================================
    # STEP 6 — FORMAT CITATIONS
    # =====================================================

    formatted_citations = format_citations(
        citations
    )

    # =====================================================
    # STEP 7 — RETURN FINAL RAG RESULT
    # =====================================================

    return {
        "success": True,
        "query": query,
        "documents": relevant_documents,
        "citations": citations,
        "formatted_citations": formatted_citations,
        "message": (
            "RAG pipeline completed successfully."
        ),
    }