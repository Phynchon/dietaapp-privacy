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
      let details = "";
      try {
        details = await response.text();
      } catch {
        details = "";
      }
      throw new Error(`Sync error: ${response.status}${details ? ` - ${details}` : ""}`);
    }

    return { status: "sent", remote: true };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(path, method = "GET") {
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
      signal: controller.signal,
    });

    if (!response.ok) {
      let details = "";
      try {
        details = await response.text();
      } catch {
        details = "";
      }
      throw new Error(`Sync error: ${response.status}${details ? ` - ${details}` : ""}`);
    }

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { status: "sent", remote: true, data };
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncProgramStartToBackend({ user, program }) {
  const userSync = await sendJson("/users", "POST", user);
  const programSync = await sendJson("/programs", "POST", {
    id: program.id,
    userId: program.userId,
    dietLevel: program.dietLevel,
    caloriesTarget: program.caloriesTarget,
    startDateIso: program.startDateIso,
    startDatetime: program.startDatetime,
    plannedDays: program.plannedDays,
    status: program.status,
  });

  const remote = userSync.remote && programSync.remote;
  return {
    status: remote ? "sent" : "queued-local",
    remote,
  };
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

export async function fetchUserPlanFromBackend(userId) {
  if (!userId) {
    return { status: "queued-local", remote: false, plan: null };
  }

  const result = await fetchJson(`/users/${userId}/plan`, "GET");
  return {
    status: result.status,
    remote: result.remote,
    plan: result?.data?.plan === "premium" ? "premium" : "free",
    planUpdatedAt: result?.data?.planUpdatedAt ?? null,
  };
}

export async function syncUserPlanToBackend({ userId, plan }) {
  if (!userId) {
    return { status: "queued-local", remote: false };
  }

  return sendJson(`/users/${userId}/plan`, "PUT", {
    plan: plan === "premium" ? "premium" : "free",
  });
}
