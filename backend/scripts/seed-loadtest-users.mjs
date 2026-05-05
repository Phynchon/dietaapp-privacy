import "dotenv/config";
import { randomUUID } from "crypto";

const DEFAULT_BASE_URL = "https://api.lalecturainfinita.es";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_STRESS_COUNT = 200;
const DEFAULT_STRESS_CONCURRENCY = 20;
const DIETS = [1400, 1600, 1800, 2000];
const COUNTRIES = [
  "Espana",
  "Portugal",
  "Francia",
  "Italia",
  "Alemania",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
];

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (!found) return fallback;
  return found.slice(prefix.length);
}

function asPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function asNonNegativeInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function asBoolean(value, fallback = false) {
  if (value == null) return fallback;
  const normalized = String(value).toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function isoWithStartOfDayOffset(daysAgo) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function postJson(baseUrl, path, payload, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      let details = "";
      try {
        details = await response.text();
      } catch {
        details = "";
      }
      throw new Error(`POST ${path} failed: ${response.status}${details ? ` ${details}` : ""}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function summarizeLatencies(samples) {
  if (!samples.length) {
    return {
      count: 0,
      minMs: null,
      avgMs: null,
      p50Ms: null,
      p95Ms: null,
      p99Ms: null,
      maxMs: null,
    };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const pick = (p) => {
    const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[Math.max(0, idx)];
  };
  const avg = sorted.reduce((acc, n) => acc + n, 0) / sorted.length;

  return {
    count: sorted.length,
    minMs: sorted[0],
    avgMs: Number(avg.toFixed(2)),
    p50Ms: pick(50),
    p95Ms: pick(95),
    p99Ms: pick(99),
    maxMs: sorted[sorted.length - 1],
  };
}

function createMetrics() {
  return {
    startedAt: Date.now(),
    finishedAt: null,
    elapsedMs: 0,
    endpointCalls: {
      users: { ok: 0, fail: 0, latenciesMs: [] },
      programs: { ok: 0, fail: 0, latenciesMs: [] },
      checkins: { ok: 0, fail: 0, latenciesMs: [] },
    },
    usersOk: 0,
    usersFail: 0,
    totalCheckinsRequested: 0,
    totalCheckinsOk: 0,
    totalCheckinsFail: 0,
    failures: [],
  };
}

function pushFailure(metrics, failure) {
  if (metrics.failures.length < 25) {
    metrics.failures.push(failure);
  }
}

async function measuredPost(endpointKey, path, payload, config, metrics) {
  const started = Date.now();
  try {
    await postJson(config.baseUrl, path, payload, config.timeoutMs);
    metrics.endpointCalls[endpointKey].ok += 1;
  } catch (error) {
    metrics.endpointCalls[endpointKey].fail += 1;
    pushFailure(metrics, {
      endpoint: endpointKey,
      path,
      message: String(error?.message || error),
    });
    throw error;
  } finally {
    metrics.endpointCalls[endpointKey].latenciesMs.push(Date.now() - started);
  }
}

async function createOneUser(index, config, metrics) {
  const nowIso = new Date().toISOString();
  const userId = randomUUID();
  const programId = randomUUID();
  const alias = `${config.aliasPrefix}_${String(index + 1).padStart(3, "0")}`;
  const age = randomInt(22, 69);
  const gender = Math.random() < 0.5 ? "female" : "male";
  const dietLevel = randomFrom(DIETS);
  const heightCm = randomInt(150, 190);
  const weightKg = randomInt(55, 105);
  const imc = Number((weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(2));
  const startDateIso = isoWithStartOfDayOffset(randomInt(0, 7));

  await measuredPost(
    "users",
    "/users",
    {
      id: userId,
      alias,
      country: randomFrom(COUNTRIES),
      age,
      gender,
      heightCm,
      weightKg,
      imc,
      dietCalories: dietLevel,
      noticesAccepted: Math.random() < 0.85,
      trackingConsent: true,
      startDatetime: startDateIso,
      currentDatetime: nowIso,
    },
    config,
    metrics,
  );

  await measuredPost(
    "programs",
    "/programs",
    {
      id: programId,
      userId,
      dietLevel,
      caloriesTarget: dietLevel,
      startDateIso,
      startDatetime: startDateIso,
      plannedDays: 56,
      status: "active",
    },
    config,
    metrics,
  );

  const checkinsToCreate = randomInt(1, config.maxCheckins);
  metrics.totalCheckinsRequested += checkinsToCreate;
  for (let day = 1; day <= checkinsToCreate; day += 1) {
    const trackingDateIso = isoWithStartOfDayOffset(Math.max(0, checkinsToCreate - day));
    await measuredPost(
      "checkins",
      `/programs/${programId}/daily-checkins`,
      {
        id: randomUUID(),
        dayNumber: day,
        trackingDateIso,
        milestones: {
          breakfast: Math.random() < 0.85,
          lunch: Math.random() < 0.75,
          meal: Math.random() < 0.9,
          snack: Math.random() < 0.7,
          dinner: Math.random() < 0.85,
        },
        totalCalories: randomInt(Math.max(900, dietLevel - 350), dietLevel + 250),
        caloriesTarget: dietLevel,
        caloriesSaved: randomInt(0, 220),
        caloriesExtra: randomInt(0, 220),
        notes: "loadtest synthetic data",
        recordedAt: new Date().toISOString(),
      },
      config,
      metrics,
    );
    metrics.totalCheckinsOk += 1;
  }

  return { alias, userId, programId, checkinsToCreate };
}

async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const current = cursor;
      cursor += 1;
      try {
        results[current] = await tasks[current]();
      } catch (error) {
        results[current] = {
          ok: false,
          error: String(error?.message || error),
        };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const mode = getArg("mode", process.env.LOAD_TEST_MODE) || "loadtest";
  const defaultsByMode = mode === "stress"
    ? { count: DEFAULT_STRESS_COUNT, concurrency: DEFAULT_STRESS_CONCURRENCY }
    : { count: 50, concurrency: 5 };

  const count = asPositiveInt(getArg("count", process.env.LOAD_TEST_COUNT), defaultsByMode.count);
  const concurrency = asPositiveInt(getArg("concurrency", process.env.LOAD_TEST_CONCURRENCY), defaultsByMode.concurrency);
  const timeoutMs = asPositiveInt(getArg("timeoutMs", process.env.LOAD_TEST_TIMEOUT_MS), DEFAULT_TIMEOUT_MS);
  const maxCheckins = asPositiveInt(getArg("maxCheckins", process.env.LOAD_TEST_MAX_CHECKINS), 3);
  const maxFailures = asNonNegativeInt(getArg("maxFailures", process.env.LOAD_TEST_MAX_FAILURES), 20);
  const failFast = asBoolean(getArg("failFast", process.env.LOAD_TEST_FAIL_FAST), false);
  const aliasPrefix = getArg("aliasPrefix", process.env.LOAD_TEST_ALIAS_PREFIX) || `loadtest_${Date.now()}`;
  const baseUrl = (getArg("baseUrl", process.env.LOAD_TEST_BASE_URL) || DEFAULT_BASE_URL).replace(/\/$/, "");
  const metrics = createMetrics();

  console.log(`Starting ${mode} seed against ${baseUrl}`);
  console.log(`Users: ${count} | Concurrency: ${concurrency} | Max check-ins/user: ${maxCheckins} | Timeout: ${timeoutMs} ms`);
  console.log(`Alias prefix: ${aliasPrefix}`);

  const tasks = Array.from({ length: count }, (_, index) => async () => {
    if (failFast && metrics.usersFail >= maxFailures) {
      throw new Error(`Fail-fast triggered: usersFail=${metrics.usersFail}`);
    }

    try {
      const created = await createOneUser(index, {
        baseUrl,
        timeoutMs,
        maxCheckins,
        aliasPrefix,
      }, metrics);
      metrics.usersOk += 1;
      return { ok: true, ...created };
    } catch (error) {
      metrics.usersFail += 1;
      const checkinsFailDelta = Math.max(0, metrics.totalCheckinsRequested - metrics.totalCheckinsOk - metrics.totalCheckinsFail);
      metrics.totalCheckinsFail += checkinsFailDelta;
      pushFailure(metrics, {
        endpoint: "user_flow",
        path: "multi-step",
        message: String(error?.message || error),
      });
      return { ok: false, error: String(error?.message || error) };
    }
  });

  const created = await runPool(tasks, concurrency);
  metrics.finishedAt = Date.now();
  metrics.elapsedMs = metrics.finishedAt - metrics.startedAt;

  const successfulRows = created.filter((row) => row?.ok);
  const totalCheckins = successfulRows.reduce((acc, row) => acc + (row.checkinsToCreate ?? 0), 0);
  const endpointTotals = Object.entries(metrics.endpointCalls).reduce((acc, [key, value]) => {
    acc[key] = {
      ok: value.ok,
      fail: value.fail,
      latency: summarizeLatencies(value.latenciesMs),
    };
    return acc;
  }, {});
  const totalEndpointCalls = Object.values(metrics.endpointCalls).reduce((acc, value) => acc + value.ok + value.fail, 0);
  const rps = metrics.elapsedMs > 0 ? Number((totalEndpointCalls / (metrics.elapsedMs / 1000)).toFixed(2)) : null;

  console.log("Done.");
  console.log(`Created users: ${successfulRows.length}`);
  console.log(`Failed users: ${metrics.usersFail}`);
  console.log(`Created check-ins: ${totalCheckins}`);
  console.log(`Elapsed: ${metrics.elapsedMs} ms`);
  console.log(`Throughput: ${rps ?? "n/a"} req/s`);
  console.log(`First alias: ${successfulRows[0]?.alias ?? "n/a"}`);
  console.log(`Last alias: ${successfulRows[successfulRows.length - 1]?.alias ?? "n/a"}`);
  console.log("Metrics:");
  console.log(JSON.stringify({
    mode,
    aliasPrefix,
    elapsedMs: metrics.elapsedMs,
    rps,
    users: {
      requested: count,
      ok: metrics.usersOk,
      fail: metrics.usersFail,
    },
    checkins: {
      requested: metrics.totalCheckinsRequested,
      ok: metrics.totalCheckinsOk,
      fail: metrics.totalCheckinsFail,
    },
    endpoints: endpointTotals,
    failuresSample: metrics.failures,
  }));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
