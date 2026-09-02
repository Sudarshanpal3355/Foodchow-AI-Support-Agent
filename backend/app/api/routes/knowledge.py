from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"],
)


KNOWLEDGE_BASE_PATH = (
    Path(__file__).resolve().parents[4] / "knowledge_base"
)


@router.get("")
def list_knowledge_files():
    """
    List all knowledge-base documents.
    """

    if not KNOWLEDGE_BASE_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Knowledge base directory not found.",
        )

    files = []

    for file_path in KNOWLEDGE_BASE_PATH.rglob("*.md"):
        files.append(
            {
                "name": file_path.name,
                "category": file_path.parent.name,
                "path": str(
                    file_path.relative_to(KNOWLEDGE_BASE_PATH)
                ),
            }
        )

    return {
        "success": True,
        "count": len(files),
        "data": files,
    }


@router.get("/{category}")
def get_knowledge_category(category: str):
    """
    Get knowledge documents for a category.
    """

    category_path = KNOWLEDGE_BASE_PATH / category

    if not category_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Knowledge category '{category}' not found.",
        )

    documents = []

    for file_path in category_path.glob("*.md"):
        documents.append(
            {
                "name": file_path.name,
                "category": category,
                "path": str(
                    file_path.relative_to(KNOWLEDGE_BASE_PATH)
                ),
            }
        )

    return {
        "success": True,
        "count": len(documents),
        "data": documents,
    }