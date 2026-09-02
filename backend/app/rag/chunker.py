from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.app.rag.document_loader import (
    load_knowledge_documents,
)


# =========================================================
# CHUNKING CONFIGURATION
# =========================================================

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


# =========================================================
# TEXT SPLITTER
# =========================================================

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=[
        "\n\n",
        "\n",
        ". ",
        " ",
        "",
    ],
)


# =========================================================
# BUILD KNOWLEDGE CHUNKS
# =========================================================

def build_knowledge_chunks() -> list[dict]:
    """
    Load knowledge-base documents and split them into
    searchable chunks.

    Each chunk contains:

        - chunk_id
        - document_id
        - source
        - category
        - content
        - metadata
    """

    documents = load_knowledge_documents()

    chunks = []

    for document in documents:

        document_id = document["document_id"]
        source = document["source"]
        category = document["category"]
        content = document["content"]

        split_chunks = text_splitter.split_text(
            content
        )

        for index, chunk_content in enumerate(
            split_chunks
        ):

            chunk_content = chunk_content.strip()

            if not chunk_content:
                continue

            chunk_id = (
                f"{document_id}::chunk_{index}"
            )

            chunks.append(
                {
                    "chunk_id": chunk_id,

                    "document_id": document_id,

                    "source": source,

                    "category": category,

                    "content": chunk_content,

                    "metadata": {
                        "chunk_id": chunk_id,
                        "document_id": document_id,
                        "source": source,
                        "category": category,
                        "chunk_index": index,
                    },
                }
            )

    return chunks