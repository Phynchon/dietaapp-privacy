import { getBackendBaseUrl, getRequestTimeoutMs, hasBackendConfigured } from './backendConfig'

export async function submitConsultToBackend(payload) {
  if (!hasBackendConfigured()) {
    return { status: 'queued-local', remote: false }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs())

  try {
    const response = await fetch(`${getBackendBaseUrl()}/consults`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Backend consult error: ${response.status}`)
    }

    return { status: 'sent', remote: true }
  } finally {
    clearTimeout(timeout)
  }
}
