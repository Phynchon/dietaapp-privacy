const DEFAULT_TIMEOUT_MS = 8000

export function getBackendBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL
  return typeof value === 'string' ? value.trim().replace(/\/$/, '') : ''
}

export function hasBackendConfigured() {
  return Boolean(getBackendBaseUrl())
}

export function getRequestTimeoutMs() {
  const raw = Number(import.meta.env.VITE_API_TIMEOUT_MS)
  if (!raw || Number.isNaN(raw) || raw < 1000) {
    return DEFAULT_TIMEOUT_MS
  }
  return raw
}
