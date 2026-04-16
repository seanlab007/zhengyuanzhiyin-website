CREATE TABLE `kuaishou_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`callback` varchar(256) NOT NULL,
	`adid` varchar(128),
	`channel` varchar(64) NOT NULL DEFAULT 'kuaishou',
	`params` text,
	`orderId` int,
	`status` enum('pending','converted','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kuaishou_tracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `kuaishou_tracking_callback_unique` UNIQUE(`callback`)
);
