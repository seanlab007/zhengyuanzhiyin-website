// Migration script to add new columns to orders table
// Run the SQL statements via webdev_execute_sql
const statements = [
  "ALTER TABLE `orders` MODIFY COLUMN `userId` int NOT NULL DEFAULT 0;",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `orderNo` varchar(64) NOT NULL DEFAULT '';",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customerName` varchar(64);",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customerGender` varchar(8);",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `calendarType` varchar(16);",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `birthDate` varchar(32);",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `birthHour` varchar(16);",
  "ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `lunarDateStr` varchar(64);",
  // Backfill existing orders with orderNo
  "UPDATE `orders` SET `orderNo` = CONCAT('ORD', LPAD(id, 10, '0')) WHERE `orderNo` = '';",
];

console.log("Run these SQL statements:");
statements.forEach((s, i) => console.log(`${i + 1}. ${s}`));
