CREATE TABLE `onboarding_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `user_onboarding_status` (
	`user_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`completed` integer DEFAULT 0,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `onboarding_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`personal_email` text NOT NULL,
	`phone` text NOT NULL,
	`role` text DEFAULT 'probationary' NOT NULL,
	`work_email` text,
	`fit_test_date` text,
	`mask_size` text,
	`tshirt_size` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
