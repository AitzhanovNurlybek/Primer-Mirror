import { API_BASE_URL } from '../config'

export async function fetchCompanyInfo() {
  const response = await fetch(`${API_BASE_URL}/api/company`)
  if (!response.ok) {
    throw new Error(`Failed to load company info: ${response.status}`)
  }
  return response.json()
}
