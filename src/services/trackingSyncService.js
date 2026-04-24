import {
  getBackendBaseUrl,
  getRequestTimeoutMs,
  hasBackendConfigured,
} from "./backendConfig";

async function sendJson(path, method, payload) {
  if (!hasBackendConfigured()) {
    return { status: "queued-local", remote: false };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs());

  try {
    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Sync error: ${response.status}`);
    }

    return { status: "sent", remote: true };
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncProgramStartToBackend({ user, program }) {
  await sendJson("/users", "POST", user);
  await sendJson("/programs", "POST", {
    id: program.id,
    userId: program.userId,
    dietLevel: program.dietLevel,
    caloriesTarget: program.caloriesTarget,
    startDateIso: program.startDateIso,
    startDatetime: program.startDatetime,
    plannedDays: program.plannedDays,
    status: program.status,
  });
  return { status: "sent", remote: true };
}

export async function syncUserProfileToBackend(user) {
  return sendJson("/users", "POST", user);
}

export async function syncDailyCheckinToBackend(record) {
  return sendJson(`/programs/${record.programId}/daily-checkins`, "POST", {
    id: record.id,
    dayNumber: record.dayNumber,
    trackingDateIso: record.trackingDateIso,
    milestones: record.milestones,
    totalCalories: record.totalCalories,
    caloriesTarget: record.caloriesTarget,
    caloriesSaved: record.caloriesSaved,
    caloriesExtra: record.caloriesExtra,
    notes: record.notes,
    recordedAt: record.recordedAt,
  });
}
