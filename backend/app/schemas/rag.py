from pydantic import BaseModel


class RetrievedDocument(BaseModel):
    document_id: str
    source: str
    content: str
    score: float
    metadata: dict = {}


class RAGResponse(BaseModel):
    query: str
    documents: list[RetrievedDocument]