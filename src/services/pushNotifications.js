export async function initializePushNotifications() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return { status: 'unavailable' }
  }

  if (Notification.permission === 'granted') {
    return { status: 'ready' }
  }

  if (Notification.permission === 'denied') {
    return { status: 'denied' }
  }

  return { status: 'prompt' }
}

export async function requestPushPermission() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return { status: 'unavailable' }
  }

  const permission = await Notification.requestPermission()
  if (permission === 'granted') return { status: 'ready' }
  if (permission === 'denied') return { status: 'denied' }
  return { status: 'prompt' }
}
