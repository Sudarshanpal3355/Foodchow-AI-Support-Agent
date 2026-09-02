from pathlib import Path


# =========================================================
# KNOWLEDGE BASE PATH
# =========================================================

KNOWLEDGE_BASE_PATH = (
    Path(__file__).resolve().parents[3] / "knowledge_base"
)


# =========================================================
# LOAD MARKDOWN DOCUMENTS
# =========================================================

def load_knowledge_documents() -> list[dict]:
    """
    Load all Markdown documents from the knowledge base.

    Each document contains:
        - document_id
        - source
        - category
        - content
    """

    documents = []

    if not KNOWLEDGE_BASE_PATH.exists():
        raise FileNotFoundError(
            f"Knowledge base not found: {KNOWLEDGE_BASE_PATH}"
        )

    for file_path in KNOWLEDGE_BASE_PATH.rglob("*.md"):

        # -------------------------------------------------
        # Ignore empty documents for now
        # -------------------------------------------------

        content = file_path.read_text(
            encoding="utf-8"
        ).strip()

        if not content:
            continue

        relative_path = file_path.relative_to(
            KNOWLEDGE_BASE_PATH
        )

        category = file_path.parent.name

        document_id = str(
            relative_path
        ).replace("\\", "/")

        documents.append(
            {
                "document_id": document_id,
                "source": str(relative_path).replace(
                    "\\",
                    "/",
                ),
                "category": category,
                "content": content,
            }
        )

    return documents