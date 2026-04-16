ALTER TABLE `orders` MODIFY COLUMN `userId` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `orderNo` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerName` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `customerGender` varchar(8);--> statement-breakpoint
ALTER TABLE `orders` ADD `calendarType` varchar(16);--> statement-breakpoint
ALTER TABLE `orders` ADD `birthDate` varchar(32);--> statement-breakpoint
ALTER TABLE `orders` ADD `birthHour` varchar(16);--> statement-breakpoint
ALTER TABLE `orders` ADD `lunarDateStr` varchar(64);