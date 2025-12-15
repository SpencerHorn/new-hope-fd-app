CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_users_email_unique` ON `auth_users` (`email`);--> statement-breakpoint
CREATE TABLE `checklist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_id` text NOT NULL,
	`item_number` integer NOT NULL,
	`task_name` text NOT NULL,
	`due_date` text,
	`notes` text,
	FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checklists_name_unique` ON `checklists` (`name`);--> statement-breakpoint
CREATE TABLE `invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`used` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `onboarding_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `user_checklist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_checklist_id` text NOT NULL,
	`checklist_item_id` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`date_completed` text,
	`completed_by` text,
	`notes` text,
	FOREIGN KEY (`user_checklist_id`) REFERENCES `user_checklists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`checklist_item_id`) REFERENCES `checklist_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`user_phone` text NOT NULL,
	`assigned_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
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
	`address` text,
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
