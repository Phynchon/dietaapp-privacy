import "dotenv/config";
import mysql from "mysql2/promise";

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (!found) return fallback;
  return found.slice(prefix.length);
}

function isTruthy(value) {
  if (value == null) return false;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

async function main() {
  const aliasPrefix = getArg("aliasPrefix", process.env.LOAD_TEST_ALIAS_PREFIX);
  const dryRun = isTruthy(getArg("dryRun", process.env.LOAD_TEST_DRY_RUN ?? "true"));

  if (!aliasPrefix) {
    throw new Error("aliasPrefix is required. Example: --aliasPrefix=loadtest_20260501");
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const aliasPattern = `${aliasPrefix}%`;

  try {
    const [users] = await connection.query(
      "SELECT id FROM users WHERE alias LIKE ?",
      [aliasPattern],
    );

    const userIds = users.map((row) => row.id);
    if (!userIds.length) {
      console.log(JSON.stringify({ aliasPrefix, dryRun, users: 0, programs: 0, checkins: 0 }));
      return;
    }

    const [programs] = await connection.query(
      `SELECT id FROM program_cycles WHERE user_id IN (${userIds.map(() => "?").join(",")})`,
      userIds,
    );
    const programIds = programs.map((row) => row.id);

    let checkinsCount = 0;
    if (programIds.length) {
      const [checkinsRows] = await connection.query(
        `SELECT COUNT(*) AS total FROM daily_checkins WHERE program_id IN (${programIds.map(() => "?").join(",")})`,
        programIds,
      );
      checkinsCount = Number(checkinsRows[0]?.total ?? 0);
    }

    const summary = {
      aliasPrefix,
      dryRun,
      users: userIds.length,
      programs: programIds.length,
      checkins: checkinsCount,
    };

    if (dryRun) {
      console.log(JSON.stringify(summary));
      return;
    }

    await connection.beginTransaction();

    if (programIds.length) {
      await connection.query(
        `DELETE FROM daily_checkins WHERE program_id IN (${programIds.map(() => "?").join(",")})`,
        programIds,
      );

      await connection.query(
        `DELETE FROM program_cycles WHERE id IN (${programIds.map(() => "?").join(",")})`,
        programIds,
      );
    }

    await connection.query(
      `DELETE FROM users WHERE id IN (${userIds.map(() => "?").join(",")})`,
      userIds,
    );

    await connection.commit();
    console.log(JSON.stringify(summary));
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
