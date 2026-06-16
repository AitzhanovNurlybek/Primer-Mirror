import { API_BASE_URL } from '../config'

export async function submitLead(payload) {
  const response = await fetch(`${API_BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to submit lead: ${response.status}`)
  }
  return response.json()
}

export async function fetchLeads(token) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`Failed to load leads: ${response.status}`)
  }
  return response.json()
}

export async function updateLeadStatus(token, id, status) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update lead: ${response.status}`)
  }
  return response.json()
}

export async function deleteLead(token, id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete lead: ${response.status}`)
  }
}
