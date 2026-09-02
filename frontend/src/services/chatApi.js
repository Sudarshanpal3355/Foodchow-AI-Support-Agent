import api from './api'

// =========================================================
// SEND CHAT MESSAGE
// =========================================================

export async function sendChatMessage(
  message,
  conversationId = null,
  customerId = null,
) {
  const payload = {
    message,
  }

  // Continue an existing conversation
  if (conversationId) {
    payload.conversation_id = conversationId
  }

  // Optional customer ID
  if (customerId) {
    payload.customer_id = customerId
  }

  const response = await api.post('/chat', payload)

  return response.data
}

// =========================================================
// GET CONVERSATIONS
// =========================================================

export async function getConversations() {
  const response = await api.get('/api/conversations')

  return response.data
}

// =========================================================
// GET SINGLE CONVERSATION
// =========================================================

export async function getConversation(conversationId) {
  const response = await api.get(
    `/api/conversations/${conversationId}`,
  )

  return response.data
}