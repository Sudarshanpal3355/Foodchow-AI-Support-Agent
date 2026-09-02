# =========================================================
# AGENT RAG INTEGRATION
# =========================================================

from backend.app.agent.state import AgentState
from backend.app.rag.pipeline import run_rag


# =========================================================
# KNOWLEDGE-BASED INTENTS
# =========================================================

RAG_INTENTS = {
    "general_support",
    "printer_issue",
    "kds_issue",
    "menu_issue",
    "restaurant_issue",
    "outlet_issue",
    "account_issue",
    "online_ordering_issue",
    "payment_issue",
    "refund_issue",
}


# =========================================================
# CONFIGURATION
# =========================================================

MAX_CONTEXT_MESSAGES = 6


# =========================================================
# BUILD CONVERSATION-AWARE RAG QUERY
# =========================================================

def _build_rag_query(
    state: AgentState,
) -> str:
    """
    Build a focused semantic-search query.

    The query uses:

        1. Previous customer messages
        2. Current customer message
        3. Detected intent
        4. Relevant entities

    This prevents short follow-up messages such as:

        OUT001
        MENU001
        PRN001

    from being sent to RAG by themselves.
    """

    user_message = state.get(
        "user_message",
        "",
    ).strip()

    conversation_context = state.get(
        "conversation_context",
        "",
    ).strip()

    intent = state.get(
        "intent",
        "",
    )

    entities = state.get(
        "entities",
        {},
    )

    # =====================================================
    # COLLECT PREVIOUS CUSTOMER MESSAGES
    # =====================================================

    previous_customer_messages = []

    if conversation_context:

        for line in conversation_context.splitlines():

            line = line.strip()

            if not line:
                continue

            if line.lower().startswith(
                "customer:"
            ):

                content = line[
                    len("Customer:"):
                ].strip()

                if content:
                    previous_customer_messages.append(
                        content
                    )

    # =====================================================
    # REMOVE DUPLICATE CURRENT MESSAGE
    # =====================================================

    normalized_current = " ".join(
        user_message.lower().split()
    )

    filtered_previous_messages = []

    for previous_message in previous_customer_messages:

        normalized_previous = " ".join(
            previous_message.lower().split()
        )

        if (
            normalized_previous
            and normalized_previous != normalized_current
        ):
            filtered_previous_messages.append(
                previous_message
            )

    # =====================================================
    # KEEP ONLY RECENT CUSTOMER MESSAGES
    # =====================================================

    filtered_previous_messages = (
        filtered_previous_messages[
            -MAX_CONTEXT_MESSAGES:
        ]
    )

    # =====================================================
    # BUILD QUERY PARTS
    # =====================================================

    query_parts = []

    # -----------------------------------------------------
    # Previous customer problem
    # -----------------------------------------------------

    if filtered_previous_messages:

        query_parts.append(
            "Previous customer issue: "
            + " ".join(
                filtered_previous_messages
            )
        )

    # -----------------------------------------------------
    # Current customer message
    # -----------------------------------------------------

    if user_message:

        query_parts.append(
            "Current customer message: "
            + user_message
        )

    # -----------------------------------------------------
    # Intent
    # -----------------------------------------------------

    if intent:

        query_parts.append(
            "Support intent: "
            + str(intent)
        )

    # -----------------------------------------------------
    # Relevant entities
    # -----------------------------------------------------

    if isinstance(
        entities,
        dict,
    ):

        entity_parts = []

        for key, value in entities.items():

            if value is None:
                continue

            value = str(value).strip()

            if not value:
                continue

            entity_parts.append(
                f"{key}: {value}"
            )

        if entity_parts:

            query_parts.append(
                "Relevant identifiers: "
                + ", ".join(entity_parts)
            )

    # =====================================================
    # FALLBACK
    # =====================================================

    if not query_parts:

        return user_message

    # =====================================================
    # FINAL QUERY
    # =====================================================

    return "\n".join(
        query_parts
    )


# =========================================================
# RUN RAG FOR AGENT
# =========================================================

def run_agent_rag(
    state: AgentState,
) -> AgentState:
    """
    Run the unified RAG pipeline when the customer's
    issue may require knowledge-base information.

    RAG is conversation-aware.

    Short follow-up messages such as:

        OUT001
        MENU001
        PRN001

    are combined with the previous customer issue,
    intent and relevant identifiers before semantic
    retrieval.
    """

    intent = state.get(
        "intent"
    )

    # =====================================================
    # INITIALIZE RAG STATE
    # =====================================================

    state["rag_documents"] = []

    state["rag_citations"] = []

    state["rag_formatted_citations"] = []

    state["rag_used"] = False

    # =====================================================
    # VALIDATE INTENT
    # =====================================================

    if intent not in RAG_INTENTS:

        return state

    # =====================================================
    # BUILD RAG QUERY
    # =====================================================

    rag_query = _build_rag_query(
        state
    )

    if not rag_query.strip():

        return state

    # =====================================================
    # EXECUTE RAG PIPELINE
    # =====================================================

    result = run_rag(
        query=rag_query,
        retrieval_top_k=5,
        rerank_top_k=3,
    )

    # =====================================================
    # HANDLE RAG FAILURE
    # =====================================================

    if not result.get(
        "success"
    ):

        return state

    # =====================================================
    # GET RESULTS
    # =====================================================

    documents = result.get(
        "documents",
        [],
    )

    citations = result.get(
        "citations",
        [],
    )

    formatted_citations = result.get(
        "formatted_citations",
        [],
    )

    # =====================================================
    # STORE RESULTS
    # =====================================================

    if documents:

        state["rag_documents"] = documents

        state["rag_citations"] = citations

        state[
            "rag_formatted_citations"
        ] = formatted_citations

        state["rag_used"] = True

    return state