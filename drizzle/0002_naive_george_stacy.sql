CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`reorderThreshold` int NOT NULL DEFAULT 10,
	`reorderQuantity` int NOT NULL DEFAULT 50,
	`lastRestockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_productId_unique` UNIQUE(`productId`)
);
--> statement-breakpoint
CREATE TABLE `inventory_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`action` enum('added','removed','adjusted','reordered') NOT NULL,
	`quantityChanged` int NOT NULL,
	`previousQuantity` int NOT NULL,
	`newQuantity` int NOT NULL,
	`reason` text,
	`adminId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `sku` varchar(255);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `name` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `slug` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `galleryImages` text;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `price` varchar(50);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `priceMin` varchar(50);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `priceMax` varchar(50);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `unit` varchar(100);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `attributes` text;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `tags` text;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `inStock` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `featured` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `published` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `quote_items` MODIFY COLUMN `productName` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_items` MODIFY COLUMN `productSku` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_items` MODIFY COLUMN `quantity` int NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_items` MODIFY COLUMN `unit` varchar(100);--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `referenceNumber` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `phone` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `metaTitle`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `metaDescription`;--> statement-breakpoint
ALTER TABLE `quote_requests` DROP COLUMN `adminNotes`;