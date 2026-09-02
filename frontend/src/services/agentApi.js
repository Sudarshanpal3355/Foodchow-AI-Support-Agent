import api from './api'

export async function getAgentStatus() {
  const response = await api.get('/api/agent/status')

  return response.data
}