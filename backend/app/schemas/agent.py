from pydantic import BaseModel


class AgentStatusResponse(BaseModel):
    agent: str
    status: str


class AgentExecutionResponse(BaseModel):
    conversation_id: str
    intent: str | None = None
    root_cause: str | None = None
    confidence: float | None = None
    response: str
    escalated: bool = False