# =========================================================
# RAG CITATIONS
# =========================================================


def build_citation(
    document: dict,
) -> dict:
    """
    Build a safe citation from a retrieved RAG document.

    Only source-related information is exposed.
    Internal implementation details are not included.
    """

    if not isinstance(document, dict):
        return {}

    return {
        "document_id": document.get(
            "document_id"
        ),

        "source": document.get(
            "source"
        ),

        "category": document.get(
            "category"
        ),

        "score": document.get(
            "score"
        ),

        "rerank_score": document.get(
            "rerank_score"
        ),
    }


# =========================================================
# BUILD MULTIPLE CITATIONS
# =========================================================


def build_citations(
    documents: list[dict],
) -> list[dict]:
    """
    Build citations for a list of retrieved
    and optionally reranked documents.
    """

    if not documents:
        return []

    citations = []

    seen = set()

    for document in documents:

        citation = build_citation(
            document
        )

        if not citation:
            continue

        document_id = citation.get(
            "document_id"
        )

        # -------------------------------------------------
        # Avoid duplicate citations
        # -------------------------------------------------

        if document_id in seen:
            continue

        seen.add(
            document_id
        )

        citations.append(
            citation
        )

    return citations


# =========================================================
# FORMAT CITATION FOR CUSTOMER-SAFE OUTPUT
# =========================================================


def format_citation(
    citation: dict,
) -> str:
    """
    Convert a citation into a simple readable
    source reference.
    """

    if not isinstance(
        citation,
        dict,
    ):
        return ""

    source = citation.get(
        "source"
    )

    if not source:
        return ""

    category = citation.get(
        "category"
    )

    if category:
        return (
            f"Source: {source} "
            f"(Category: {category})"
        )

    return f"Source: {source}"


# =========================================================
# FORMAT MULTIPLE CITATIONS
# =========================================================


def format_citations(
    citations: list[dict],
) -> list[str]:
    """
    Format multiple citations into readable
    source references.
    """

    if not citations:
        return []

    formatted = []

    for citation in citations:

        formatted_citation = (
            format_citation(
                citation
            )
        )

        if formatted_citation:
            formatted.append(
                formatted_citation
            )

    return formatted