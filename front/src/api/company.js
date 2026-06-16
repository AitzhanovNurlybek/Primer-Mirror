import { API_BASE_URL } from '../config'

export async function fetchCompanyInfo() {
  const response = await fetch(`${API_BASE_URL}/api/company`)
  if (!response.ok) {
    throw new Error(`Failed to load company info: ${response.status}`)
  }
  return response.json()
}

export async function updateCompanyInfo(token, values) {
  const response = await fetch(`${API_BASE_URL}/api/admin/company`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    throw new Error(`Failed to update company info: ${response.status}`)
  }
  return response.json()
}
