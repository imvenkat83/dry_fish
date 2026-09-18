ALTER TABLE `orders` DROP COLUMN `razorpay_order_id`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `razorpay_payment_id`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `razorpay_signature`;--> statement-breakpoint
ALTER TABLE `orders` ADD `phonepe_order_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `phonepe_payment_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_gateway` text DEFAULT 'phonepe';