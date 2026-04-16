import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const statements = [
  "ALTER TABLE `orders` MODIFY COLUMN `userId` int NOT NULL DEFAULT 0",
  "ALTER TABLE `orders` ADD COLUMN `orderNo` varchar(64) NOT NULL DEFAULT ''",
  "ALTER TABLE `orders` ADD COLUMN `customerName` varchar(64)",
  "ALTER TABLE `orders` ADD COLUMN `customerGender` varchar(8)",
  "ALTER TABLE `orders` ADD COLUMN `calendarType` varchar(16)",
  "ALTER TABLE `orders` ADD COLUMN `birthDate` varchar(32)",
  "ALTER TABLE `orders` ADD COLUMN `birthHour` varchar(16)",
  "ALTER TABLE `orders` ADD COLUMN `lunarDateStr` varchar(64)",
  "UPDATE `orders` SET `orderNo` = CONCAT('ORD', LPAD(id, 10, '0')) WHERE `orderNo` = ''",
];

async function run() {
  const conn = await mysql.createConnection(DATABASE_URL);
  for (const sql of statements) {
    try {
      await conn.execute(sql);
      console.log(`OK: ${sql.substring(0, 60)}...`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`SKIP (already exists): ${sql.substring(0, 60)}...`);
      } else {
        console.error(`FAIL: ${sql.substring(0, 60)}...`, err.message);
      }
    }
  }
  await conn.end();
  console.log('Migration complete!');
}

run().catch(console.error);
