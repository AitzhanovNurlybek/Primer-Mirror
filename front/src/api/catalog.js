import { API_BASE_URL } from '../config'

export async function fetchCatalog(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })
  const response = await fetch(`${API_BASE_URL}/api/catalog?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`Failed to load catalog: ${response.status}`)
  }
  return response.json()
}

export async function fetchCatalogBrands() {
  const response = await fetch(`${API_BASE_URL}/api/catalog/brands`)
  if (!response.ok) {
    throw new Error(`Failed to load brands: ${response.status}`)
  }
  return response.json()
}

export async function fetchCatalogStats({ width_cm, height_cm, tolerance = 10 }) {
  const query = new URLSearchParams({ width_cm, height_cm, tolerance })
  const response = await fetch(`${API_BASE_URL}/api/catalog/stats?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`Failed to load stats: ${response.status}`)
  }
  return response.json()
}

export async function importCatalog(token, rawItems) {
  const response = await fetch(`${API_BASE_URL}/api/admin/catalog/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rawItems),
  })
  if (!response.ok) {
    throw new Error(`Failed to import catalog: ${response.status}`)
  }
  return response.json()
}

export async function deleteCatalogItem(token, id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/catalog/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete catalog item: ${response.status}`)
  }
}
