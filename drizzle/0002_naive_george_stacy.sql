CREATE TABLE IF NOT EXISTS `inventory` (
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
CREATE TABLE IF NOT EXISTS `inventory_history` (
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
