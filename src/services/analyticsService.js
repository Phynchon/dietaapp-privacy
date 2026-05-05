import {
  getBackendBaseUrl,
  getRequestTimeoutMs,
  hasBackendConfigured,
} from "./backendConfig";

const EVENTS_STORAGE_KEY = "dieta.analyticsEvents";
const MAX_STORED_EVENTS = 500;

function buildId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : ((random & 0x3) | 0x8);
    return value.toString(16);
  });
}

function readStoredEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events.slice(-MAX_STORED_EVENTS)));
  } catch {
    // ignore storage errors
  }
}

async function sendEventToBackend(eventRecord) {
  if (!hasBackendConfigured()) {
    return { status: "queued-local", remote: false };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs());

  try {
    const response = await fetch(`${getBackendBaseUrl()}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventRecord),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { status: "queued-local", remote: false };
    }

    return { status: "sent", remote: true };
  } catch {
    return { status: "queued-local", remote: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function trackAnalyticsEvent(eventName, payload = {}) {
  const record = {
    id: buildId(),
    eventName,
    payload,
    createdAt: new Date().toISOString(),
  };

  const result = await sendEventToBackend(record);
  const stored = readStoredEvents();
  writeStoredEvents([...stored, { ...record, remoteStatus: result.status }]);

  return result;
}

export function getStoredAnalyticsEvents() {
  return readStoredEvents();
}
