import { getDbPool } from "../db.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMIN_DASHBOARD_PATH = path.resolve(__dirname, "..", "admin-dashboard.html");
const DEFAULT_DEV_ADMIN_USER = "admin";
const DEFAULT_DEV_ADMIN_PASSWORD = "admin";

function getAdminAuthConfig() {
  const configuredUser = process.env.ADMIN_USER;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (configuredUser && configuredPassword) {
    return {
      user: configuredUser,
      password: configuredPassword,
      isDefaultDevCredentials: false,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      user: DEFAULT_DEV_ADMIN_USER,
      password: DEFAULT_DEV_ADMIN_PASSWORD,
      isDefaultDevCredentials: true,
    };
  }

  return null;
}

function decodeBasicAuthHeader(authHeader) {
  if (typeof authHeader !== "string" || !authHeader.startsWith("Basic ")) {
    return null;
  }

  try {
    const encoded = authHeader.slice("Basic ".length);
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return null;
    return {
      user: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function requireAdminAuth(req, res, next) {
  const authConfig = getAdminAuthConfig();

  if (!authConfig) {
    return res.status(503).json({
      error: "Las credenciales de administrador no estan configuradas. Configure ADMIN_USER y ADMIN_PASSWORD.",
    });
  }

  const credentials = decodeBasicAuthHeader(req.headers.authorization);
  const isAuthorized =
    credentials &&
    credentials.user === authConfig.user &&
    credentials.password === authConfig.password;

  if (!isAuthorized) {
    res.setHeader("WWW-Authenticate", 'Basic realm="DietaApp Admin"');
    return res.status(401).send("Authentication required");
  }

  return next();
}

export function registerAdminRoutes(app) {
  app.get("/admin", requireAdminAuth, (_req, res) => {
    res.sendFile(ADMIN_DASHBOARD_PATH);
  });

  app.get("/admin/api/overview", requireAdminAuth, async (_req, res, next) => {
    try {
      const db = getDbPool();

      const [columnRows] = await db.query(
        `SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
      );

      const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));
      const hasDietCalories = columns.has("diet_calories");
      const hasNoticesAccepted = columns.has("notices_accepted");
      const hasTrackingConsent = columns.has("tracking_consent");

      const summarySql = `SELECT
          COUNT(*) AS total_users,
          ${hasTrackingConsent ? "SUM(CASE WHEN tracking_consent = 1 THEN 1 ELSE 0 END)" : "0"} AS consented_users,
          ${hasNoticesAccepted ? "SUM(CASE WHEN notices_accepted = 1 THEN 1 ELSE 0 END)" : "0"} AS notices_accepted_users,
          ROUND(AVG(age), 1) AS avg_age,
          ROUND(AVG(weight_kg), 1) AS avg_weight_kg,
          ROUND(AVG(height_cm), 1) AS avg_height_cm
         FROM users`;

      const [summaryRows] = await db.query(summarySql);

      const [genderRows] = await db.query(
        `SELECT COALESCE(gender, 'unknown') AS gender, COUNT(*) AS total
         FROM users
         GROUP BY COALESCE(gender, 'unknown')
         ORDER BY total DESC`,
      );

      const [dietRows] = hasDietCalories
        ? await db.query(
          `SELECT diet_calories, COUNT(*) AS total
           FROM users
           WHERE diet_calories IS NOT NULL
           GROUP BY diet_calories
           ORDER BY diet_calories ASC`,
        )
        : [[]];

      const recentSql = `SELECT
          alias,
          country,
          age,
          gender,
          ${hasDietCalories ? "diet_calories" : "NULL AS diet_calories"},
          ${hasNoticesAccepted ? "notices_accepted" : "NULL AS notices_accepted"},
          ${hasTrackingConsent ? "tracking_consent" : "NULL AS tracking_consent"},
          created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 25`;

      const [recentRows] = await db.query(recentSql);

      const summary = summaryRows?.[0] || {};

      return res.json({
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers: Number(summary.total_users || 0),
          consentedUsers: Number(summary.consented_users || 0),
          noticesAcceptedUsers: Number(summary.notices_accepted_users || 0),
          avgAge: summary.avg_age,
          avgWeightKg: summary.avg_weight_kg,
          avgHeightCm: summary.avg_height_cm,
        },
        breakdowns: {
          gender: genderRows.map((row) => ({
            label: row.gender,
            total: Number(row.total || 0),
          })),
          diet: dietRows.map((row) => ({
            label: `${row.diet_calories} kcal`,
            total: Number(row.total || 0),
          })),
        },
        recentUsers: recentRows.map((row) => ({
          alias: row.alias,
          country: row.country,
          age: row.age,
          gender: row.gender,
          dietCalories: row.diet_calories,
          noticesAccepted: Boolean(row.notices_accepted),
          trackingConsent: Boolean(row.tracking_consent),
          createdAt: row.created_at,
        })),
      });
    } catch (error) {
      return next(error);
    }
  });
}
