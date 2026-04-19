export function registerServiceWorker() {
  const isNativeApp = Boolean(window?.Capacitor?.isNativePlatform?.())

  const cleanupServiceWorkers = () => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister())
    })

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key))
      })
    }
  }

  // No registrar service worker en desarrollo para evitar problemas de cache
  if (import.meta.env.DEV || isNativeApp) {
    // Desregistrar cualquier service worker existente para evitar contenido desactualizado
    cleanupServiceWorkers()
    return
  }

  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration can fail; ignore to keep UX clean.
    })
  })
}
