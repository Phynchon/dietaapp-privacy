import dotenv from "dotenv";
import mysql from "mysql2/promise";

const envByMode = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envByMode });
dotenv.config({ path: ".env" });

async function safeExec(connection, sql) {
  try {
    await connection.query(sql);
    return "applied";
  } catch (error) {
    if (error?.code === "ER_DUP_FIELDNAME") {
      return "already-exists";
    }
    throw error;
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const userPlan = await safeExec(
      connection,
      "ALTER TABLE users ADD COLUMN user_plan ENUM('free','premium') NOT NULL DEFAULT 'free'",
    );
    const planUpdatedAt = await safeExec(
      connection,
      "ALTER TABLE users ADD COLUMN plan_updated_at DATETIME NULL",
    );

    const [rows] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'users'
         AND COLUMN_NAME IN ('user_plan', 'plan_updated_at')
       ORDER BY COLUMN_NAME`,
      [process.env.MYSQL_DATABASE],
    );

    console.log(
      JSON.stringify({
        userPlan,
        planUpdatedAt,
        columns: rows.map((row) => row.COLUMN_NAME),
      }),
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error?.code || error?.message || error);
  process.exit(1);
});
