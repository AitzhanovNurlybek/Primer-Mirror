import { API_BASE_URL } from '../config'

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new Error('Неверный логин или пароль')
  }
  return response.json()
}

export async function fetchPricing(token) {
  const response = await fetch(`${API_BASE_URL}/api/admin/pricing`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`Failed to load pricing: ${response.status}`)
  }
  return response.json()
}

export async function updatePricing(token, values) {
  const response = await fetch(`${API_BASE_URL}/api/admin/pricing`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    throw new Error(`Failed to update pricing: ${response.status}`)
  }
  return response.json()
}
