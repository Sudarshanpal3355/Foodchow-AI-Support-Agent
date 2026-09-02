import api from './api'


export async function getTickets() {

  const response =
    await api.get('/tickets')

  return response.data
}


export async function getTicket(
  ticketId,
) {

  const response =
    await api.get(
      `/tickets/${ticketId}`,
    )

  return response.data
}


export async function updateTicket(
  ticketId,
  updateData,
) {

  const response =
    await api.patch(
      `/tickets/${ticketId}`,
      updateData,
    )

  return response.data
}