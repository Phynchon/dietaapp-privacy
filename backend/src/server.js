import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { pingDb } from "./db.js";
import { registerAdminRoutes } from "./routes/adminRoutes.js";
import { registerTrackingRoutes } from "./routes/trackingRoutes.js";

const envByMode = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envByMode });
dotenv.config({ path: ".env" });

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:4173,http://localhost,https://localhost,capacitor://localhost")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await pingDb();
    res.json({ ok: true, db: "up" });
  } catch (error) {
    res.status(500).json({ ok: false, db: "down", error: String(error?.message || error) });
  }
});

registerTrackingRoutes(app);
registerAdminRoutes(app);

app.use((err, _req, res, _next) => {
  const message = err?.message || "Unexpected server error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  const hasConfiguredAdminAuth = Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
  const usingDevDefaults = !hasConfiguredAdminAuth && process.env.NODE_ENV !== "production";
  // eslint-disable-next-line no-console
  console.log(`DietaApp backend running on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`Admin auth configured: ${hasConfiguredAdminAuth || usingDevDefaults}`);
  if (usingDevDefaults) {
    // eslint-disable-next-line no-console
    console.log("Admin auth defaults (dev only): user=admin password=admin");
  }
});
