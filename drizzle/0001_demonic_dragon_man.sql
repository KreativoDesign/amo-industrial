CREATE TABLE IF NOT EXISTS `brands` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `logoUrl` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `brands_id` PRIMARY KEY(`id`),
  CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `imageUrl` text,
  `parentId` int,
  `sortOrder` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `categories_id` PRIMARY KEY(`id`),
  CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `products` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  `sku` varchar(255),
  `description` text,
  `shortDescription` text,
  `categoryId` int,
  `brandId` int,
  `imageUrl` text,
  `galleryImages` text,
  `unit` varchar(100),
  `price` varchar(50),
  `priceMin` varchar(50),
  `priceMax` varchar(50),
  `inStock` boolean NOT NULL DEFAULT 1,
  `published` boolean NOT NULL DEFAULT 1,
  `featured` boolean NOT NULL DEFAULT 0,
  `tags` text,
  `attributes` text,
  `sortOrder` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `products_id` PRIMARY KEY(`id`),
  CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `quote_items` (
  `id` int AUTO_INCREMENT NOT NULL,
  `quoteRequestId` int NOT NULL,
  `productId` int,
  `productName` varchar(500) NOT NULL,
  `productSku` varchar(255),
  `quantity` int NOT NULL,
  `unit` varchar(100),
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `quote_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `quote_requests` (
  `id` int AUTO_INCREMENT NOT NULL,
  `referenceNumber` varchar(50) NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `contactPerson` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `notes` text,
  `status` enum('pending','reviewing','quoted','accepted','declined') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`),
  CONSTRAINT `quote_requests_referenceNumber_unique` UNIQUE(`referenceNumber`)
);
