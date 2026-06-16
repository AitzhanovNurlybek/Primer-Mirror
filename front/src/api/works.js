import { API_BASE_URL } from '../config'

export async function fetchWorks() {
  const response = await fetch(`${API_BASE_URL}/api/works`)
  if (!response.ok) {
    throw new Error(`Failed to load works: ${response.status}`)
  }
  return response.json()
}

export async function createWork(token, payload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/works`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to create work: ${response.status}`)
  }
  return response.json()
}

export async function deleteWork(token, id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/works/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete work: ${response.status}`)
  }
}
