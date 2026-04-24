import mysql from "mysql2/promise";

let pool;

function getRequiredEnv(name, fallback = "") {
  const value = process.env[name];
  return typeof value === "string" && value.length ? value : fallback;
}

export function getDbPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: getRequiredEnv("MYSQL_HOST", "127.0.0.1"),
    port: Number(getRequiredEnv("MYSQL_PORT", "3306")),
    user: getRequiredEnv("MYSQL_USER", "root"),
    password: getRequiredEnv("MYSQL_PASSWORD", ""),
    database: getRequiredEnv("MYSQL_DATABASE", "dietaapp"),
    waitForConnections: true,
    connectionLimit: Number(getRequiredEnv("MYSQL_CONNECTION_LIMIT", "10")),
    namedPlaceholders: true,
  });

  return pool;
}

export async function pingDb() {
  const db = getDbPool();
  await db.query("SELECT 1");
}
