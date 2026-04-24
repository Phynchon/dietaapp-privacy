import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await connection.query(
    "SELECT id, alias, country, age, created_at FROM users WHERE alias = ? ORDER BY created_at DESC LIMIT 1",
    ['test_alias_e2e'],
  );

  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

main().catch((error) => {
  console.error(error?.code || error?.message || error);
  process.exit(1);
});
