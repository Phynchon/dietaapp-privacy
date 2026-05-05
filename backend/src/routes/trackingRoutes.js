import { getDbPool } from "../db.js";

function parseDateTime(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toMysqlDateTime(value) {
  const parsed = parseDateTime(value);
  if (!parsed) return null;
  return parsed.toISOString().slice(0, 19).replace("T", " ");
}

function toMysqlDate(value) {
  const parsed = parseDateTime(value);
  if (!parsed) return null;
  return parsed.toISOString().slice(0, 10);
}

function normalizeUserPlan(value) {
  return value === "premium" ? "premium" : "free";
}

let userPlanColumnsReady = false;

async function ensureUserPlanColumns(db) {
  if (userPlanColumnsReady) return;

  try {
    await db.query(
      `ALTER TABLE users
       ADD COLUMN user_plan ENUM('free','premium') NOT NULL DEFAULT 'free'`,
    );
  } catch (error) {
    if (error?.code !== "ER_DUP_FIELDNAME") {
      return;
    }
  }

  try {
    await db.query(
      `ALTER TABLE users
       ADD COLUMN plan_updated_at DATETIME NULL`,
    );
  } catch (error) {
    if (error?.code !== "ER_DUP_FIELDNAME") {
      return;
    }
  }

  userPlanColumnsReady = true;
}

export function registerTrackingRoutes(app) {
  app.post("/consults", async (req, res, next) => {
    try {
      const db = getDbPool();
      const {
        text,
        language = "es",
        dietCalories = null,
        menuLabel = null,
        createdAt,
      } = req.body || {};

      const normalizedText = typeof text === "string" ? text.trim() : "";
      if (!normalizedText) {
        return res.status(400).json({ error: "text is required" });
      }

      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `consult_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      await db.query(
        `INSERT INTO consult_messages (
          id, language, diet_calories, menu_label, message_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          language,
          dietCalories,
          menuLabel,
          normalizedText,
          toMysqlDateTime(createdAt || new Date().toISOString()),
        ],
      );

      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/users", async (req, res, next) => {
    try {
      const db = getDbPool();
      const {
        id,
        alias = null,
        country = null,
        age = null,
        gender = null,
        heightCm = null,
        weightKg = null,
        imc = null,
        dietCalories = null,
        noticesAccepted = null,
        trackingConsent = null,
        userPlan = "free",
        startDatetime,
        currentDatetime,
      } = req.body || {};

      if (!id || !startDatetime || !currentDatetime) {
        return res.status(400).json({ error: "id, startDatetime and currentDatetime are required" });
      }

      try {
        await db.query(
          `INSERT INTO users (
            id, alias, country, age, gender, height_cm, weight_kg, imc,
            diet_calories, notices_accepted, tracking_consent,
            user_plan, plan_updated_at,
            start_datetime, current_datetime
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            alias = VALUES(alias),
            country = VALUES(country),
            age = VALUES(age),
            gender = VALUES(gender),
            height_cm = VALUES(height_cm),
            weight_kg = VALUES(weight_kg),
            imc = VALUES(imc),
            diet_calories = VALUES(diet_calories),
            notices_accepted = VALUES(notices_accepted),
            tracking_consent = VALUES(tracking_consent),
            user_plan = VALUES(user_plan),
            plan_updated_at = VALUES(plan_updated_at),
            start_datetime = VALUES(start_datetime),
            current_datetime = VALUES(current_datetime),
            updated_at = CURRENT_TIMESTAMP`,
          [
            id,
            alias,
            country,
            age,
            gender,
            heightCm,
            weightKg,
            imc,
            dietCalories,
            noticesAccepted == null ? null : (noticesAccepted ? 1 : 0),
            trackingConsent == null ? null : (trackingConsent ? 1 : 0),
            normalizeUserPlan(userPlan),
            toMysqlDateTime(new Date().toISOString()),
            toMysqlDateTime(startDatetime),
            toMysqlDateTime(currentDatetime),
          ],
        );
      } catch (error) {
        if (error?.code !== "ER_BAD_FIELD_ERROR") {
          throw error;
        }

        await db.query(
          `INSERT INTO users (
            id, alias, country, age, gender, height_cm, weight_kg, imc, start_datetime, current_datetime
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            alias = VALUES(alias),
            country = VALUES(country),
            age = VALUES(age),
            gender = VALUES(gender),
            height_cm = VALUES(height_cm),
            weight_kg = VALUES(weight_kg),
            imc = VALUES(imc),
            start_datetime = VALUES(start_datetime),
            current_datetime = VALUES(current_datetime),
            updated_at = CURRENT_TIMESTAMP`,
          [
            id,
            alias,
            country,
            age,
            gender,
            heightCm,
            weightKg,
            imc,
            toMysqlDateTime(startDatetime),
            toMysqlDateTime(currentDatetime),
          ],
        );
      }

      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/programs", async (req, res, next) => {
    try {
      const db = getDbPool();
      const {
        id,
        userId,
        dietLevel,
        caloriesTarget,
        startDateIso,
        startDatetime,
        plannedDays = 56,
        status = "pending_start",
      } = req.body || {};

      if (!id || !userId || !dietLevel || !caloriesTarget || !startDateIso || !startDatetime) {
        return res.status(400).json({
          error: "id, userId, dietLevel, caloriesTarget, startDateIso and startDatetime are required",
        });
      }

      await db.query(
        `INSERT INTO program_cycles (
          id, user_id, diet_level, calories_target, start_date, start_datetime, planned_days, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          diet_level = VALUES(diet_level),
          calories_target = VALUES(calories_target),
          start_date = VALUES(start_date),
          start_datetime = VALUES(start_datetime),
          planned_days = VALUES(planned_days),
          status = VALUES(status),
          updated_at = CURRENT_TIMESTAMP`,
        [
          id,
          userId,
          dietLevel,
          caloriesTarget,
          toMysqlDate(startDateIso),
          toMysqlDateTime(startDatetime),
          plannedDays,
          status,
        ],
      );

      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/users/:id/plan", async (req, res, next) => {
    try {
      const db = getDbPool();
      const { id } = req.params;

      await ensureUserPlanColumns(db);

      let rows;
      try {
        [rows] = await db.query(
          `SELECT id, user_plan, plan_updated_at
           FROM users
           WHERE id = ?
           LIMIT 1`,
          [id],
        );
      } catch (error) {
        if (error?.code !== "ER_BAD_FIELD_ERROR") {
          throw error;
        }
        [rows] = await db.query(
          `SELECT id
           FROM users
           WHERE id = ?
           LIMIT 1`,
          [id],
        );
      }

      const user = rows?.[0];
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        id: user.id,
        plan: normalizeUserPlan(user.user_plan),
        planUpdatedAt: user.plan_updated_at || null,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.put("/users/:id/plan", async (req, res, next) => {
    try {
      const db = getDbPool();
      const { id } = req.params;
      const { plan } = req.body || {};

      if (!plan) {
        return res.status(400).json({ error: "plan is required" });
      }

      await ensureUserPlanColumns(db);

      let result;
      try {
        [result] = await db.query(
          `UPDATE users
           SET user_plan = ?,
               plan_updated_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [normalizeUserPlan(plan), id],
        );
      } catch (error) {
        if (error?.code !== "ER_BAD_FIELD_ERROR") {
          throw error;
        }
        return res.status(409).json({
          error: "Schema does not support user_plan yet",
        });
      }

      if (!result?.affectedRows) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ ok: true, id, plan: normalizeUserPlan(plan) });
    } catch (error) {
      return next(error);
    }
  });

  app.patch("/programs/:id", async (req, res, next) => {
    try {
      const db = getDbPool();
      const { id } = req.params;
      const { status } = req.body || {};

      if (!status) {
        return res.status(400).json({ error: "status is required" });
      }

      await db.query(
        `UPDATE program_cycles
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, id],
      );

      return res.json({ ok: true, id, status });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/programs/:id/daily-checkins", async (req, res, next) => {
    try {
      const db = getDbPool();
      const { id: programId } = req.params;
      const {
        id,
        dayNumber,
        trackingDateIso,
        milestones,
        totalCalories,
        caloriesTarget,
        caloriesSaved,
        caloriesExtra,
        notes = null,
        recordedAt,
      } = req.body || {};

      if (!id || !dayNumber || !trackingDateIso || !milestones || !recordedAt) {
        return res.status(400).json({
          error: "id, dayNumber, trackingDateIso, milestones and recordedAt are required",
        });
      }

      await db.query(
        `INSERT INTO daily_checkins (
          id, program_id, day_number, tracking_date,
          breakfast_done, lunch_done, meal_done, snack_done, dinner_done,
          total_calories, calories_target, calories_saved, calories_extra,
          notes, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          breakfast_done = VALUES(breakfast_done),
          lunch_done = VALUES(lunch_done),
          meal_done = VALUES(meal_done),
          snack_done = VALUES(snack_done),
          dinner_done = VALUES(dinner_done),
          total_calories = VALUES(total_calories),
          calories_target = VALUES(calories_target),
          calories_saved = VALUES(calories_saved),
          calories_extra = VALUES(calories_extra),
          notes = VALUES(notes),
          recorded_at = VALUES(recorded_at),
          updated_at = CURRENT_TIMESTAMP`,
        [
          id,
          programId,
          dayNumber,
          toMysqlDate(trackingDateIso),
          milestones.breakfast ? 1 : 0,
          milestones.lunch ? 1 : 0,
          milestones.meal ? 1 : 0,
          milestones.snack ? 1 : 0,
          milestones.dinner ? 1 : 0,
          totalCalories || 0,
          caloriesTarget || 0,
          caloriesSaved || 0,
          caloriesExtra || 0,
          notes,
          toMysqlDateTime(recordedAt),
        ],
      );

      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/programs/:id/timeline", async (req, res, next) => {
    try {
      const db = getDbPool();
      const { id } = req.params;

      const [[program]] = await db.query(
        `SELECT * FROM program_cycles WHERE id = ? LIMIT 1`,
        [id],
      );

      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }

      const [checkins] = await db.query(
        `SELECT * FROM daily_checkins WHERE program_id = ? ORDER BY day_number ASC`,
        [id],
      );

      return res.json({ program, checkins });
    } catch (error) {
      return next(error);
    }
  });
}
