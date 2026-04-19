const STORAGE_KEY = 'dieta.preferences'

export function loadPreferences(defaults) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { ...defaults }
    }
    return { ...defaults, ...JSON.parse(stored) }
  } catch {
    return { ...defaults }
  }
}

export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Ignore write errors to avoid blocking UI.
  }
}
