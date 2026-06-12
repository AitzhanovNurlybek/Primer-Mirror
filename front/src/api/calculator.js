import { API_BASE_URL } from '../config'

export async function estimatePrice(payload) {
  const response = await fetch(`${API_BASE_URL}/api/calculator/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to calculate price: ${response.status}`)
  }
  return response.json()
}
