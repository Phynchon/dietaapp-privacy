const TRACKING_KEY = "dieta.programTracking.v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const MEAL_KEYS = ["breakfast", "lunch", "meal", "snack", "dinner"];
const MEAL_SPLIT = {
  breakfast: 0.2,
  lunch: 0.1,
  meal: 0.35,
  snack: 0.1,
  dinner: 0.25,
};

function buildId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback UUID v4-like format to keep compatibility with MySQL CHAR(36).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : ((random & 0x3) | 0x8);
    return value.toString(16);
  });
}

function asDateOnlyIso(dateInput) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function getStartOfDayTimestamp(dateInput) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function loadState() {
  try {
    const raw = localStorage.getItem(TRACKING_KEY);
    if (!raw) {
      return { users: [], programs: [], dailyTracking: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      programs: Array.isArray(parsed.programs) ? parsed.programs : [],
      dailyTracking: Array.isArray(parsed.dailyTracking) ? parsed.dailyTracking : [],
    };
  } catch {
    return { users: [], programs: [], dailyTracking: [] };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(TRACKING_KEY, JSON.stringify(state));
  } catch {
    // Ignore write errors to keep UI responsive.
  }
}

function computeProgramDay(program, nowIso = new Date().toISOString()) {
  const nowTs = getStartOfDayTimestamp(nowIso);
  const startTs = getStartOfDayTimestamp(program.startDateIso);
  return Math.floor((nowTs - startTs) / DAY_MS) + 1;
}

export function createProgramStartRecord({
  profile,
  dietLevel,
  startDateIso,
  startDateTimeIso,
  plannedDays = 56,
}) {
  const nowIso = new Date().toISOString();
  const state = loadState();

  const userId = buildId();
  const programId = buildId();
  const normalizedStartDateIso = asDateOnlyIso(startDateIso);

  const user = {
    id: userId,
    alias: profile.alias || "",
    country: profile.country || "",
    age: profile.age ?? null,
    gender: profile.gender || "",
    heightCm: profile.heightCm ?? null,
    weightKg: profile.weightKg ?? null,
    imc: profile.imc ?? null,
    startDatetime: startDateTimeIso,
    currentDatetime: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const program = {
    id: programId,
    userId,
    dietLevel,
    caloriesTarget: dietLevel,
    startDateIso: normalizedStartDateIso,
    startDatetime: startDateTimeIso,
    plannedDays,
    status: getStartOfDayTimestamp(normalizedStartDateIso) > getStartOfDayTimestamp(nowIso)
      ? "pending_start"
      : "active",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  state.users.unshift(user);
  state.programs.unshift(program);
  saveState(state);

  return { user, program };
}

export function getLatestProgramSnapshot(nowIso = new Date().toISOString()) {
  const state = loadState();
  const [program] = state.programs;
  if (!program) return null;

  const user = state.users.find((item) => item.id === program.userId) ?? null;
  const dayIndex = computeProgramDay(program, nowIso);

  let status = program.status;
  if (dayIndex > program.plannedDays) {
    status = "completed";
  } else if (dayIndex >= 1) {
    status = "active";
  }

  const updatedProgram =
    status === program.status
      ? program
      : {
          ...program,
          status,
          updatedAt: nowIso,
        };

  if (updatedProgram !== program) {
    state.programs[0] = updatedProgram;
    saveState(state);
  }

  return {
    user,
    program: updatedProgram,
    dayIndex,
    daysRemaining: Math.max(0, updatedProgram.plannedDays - Math.max(0, dayIndex - 1)),
  };
}

export function getPendingMorningCheckin(nowIso = new Date().toISOString()) {
  const snapshot = getLatestProgramSnapshot(nowIso);
  if (!snapshot?.program) return null;

  const now = new Date(nowIso);
  const hour = now.getHours();
  if (hour > 13) return null;

  if (snapshot.dayIndex <= 1 || snapshot.dayIndex > snapshot.program.plannedDays + 1) {
    return null;
  }

  const state = loadState();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const trackingDateIso = asDateOnlyIso(yesterday);

  const existing = state.dailyTracking.find(
    (item) => item.programId === snapshot.program.id && item.trackingDateIso === trackingDateIso,
  );

  if (existing) {
    return null;
  }

  return {
    programId: snapshot.program.id,
    trackingDateIso,
    dayNumber: snapshot.dayIndex - 1,
    caloriesTarget: snapshot.program.caloriesTarget,
  };
}

export function saveMorningCheckin({
  programId,
  trackingDateIso,
  dayNumber,
  milestones,
  notes,
  caloriesTarget,
}) {
  const nowIso = new Date().toISOString();
  const state = loadState();

  const normalizedMilestones = {
    breakfast: Boolean(milestones.breakfast),
    lunch: Boolean(milestones.lunch),
    meal: Boolean(milestones.meal),
    snack: Boolean(milestones.snack),
    dinner: Boolean(milestones.dinner),
  };

  const totalCalories = MEAL_KEYS.reduce((sum, mealKey) => {
    if (!normalizedMilestones[mealKey]) return sum;
    const split = MEAL_SPLIT[mealKey] ?? 0;
    return sum + Math.round((caloriesTarget ?? 0) * split);
  }, 0);

  const safeTarget = Number(caloriesTarget) || 0;
  const caloriesSaved = Math.max(0, safeTarget - totalCalories);
  const caloriesExtra = Math.max(0, totalCalories - safeTarget);

  const record = {
    id: buildId(),
    programId,
    dayNumber,
    trackingDateIso,
    milestones: normalizedMilestones,
    totalCalories,
    caloriesTarget: safeTarget,
    caloriesSaved,
    caloriesExtra,
    notes: notes || "",
    recordedAt: nowIso,
    updatedAt: nowIso,
  };

  state.dailyTracking.unshift(record);

  if (state.programs[0]?.id === programId) {
    state.programs[0] = {
      ...state.programs[0],
      updatedAt: nowIso,
    };
  }

  if (state.users[0]) {
    state.users[0] = {
      ...state.users[0],
      currentDatetime: nowIso,
      updatedAt: nowIso,
    };
  }

  saveState(state);
  return record;
}

export function getLatestDailyTracking(programId) {
  const state = loadState();
  return state.dailyTracking.find((item) => item.programId === programId) ?? null;
}
