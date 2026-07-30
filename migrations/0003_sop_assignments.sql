CREATE TABLE `sop_assignments` (
  `id` text PRIMARY KEY NOT NULL,
  `sop_title` text NOT NULL,
  `sop_number` text NOT NULL,
  `revision_date` text NOT NULL,
  `assigned_by_user_id` integer,
  `assigned_at` text DEFAULT 'CURRENT_TIMESTAMP',
  FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint

CREATE TABLE `user_sop_assignments` (
  `id` text PRIMARY KEY NOT NULL,
  `sop_assignment_id` text NOT NULL,
  `user_id` integer NOT NULL,
  `assigned_at` text DEFAULT 'CURRENT_TIMESTAMP',
  `completed_at` text,
  FOREIGN KEY (`sop_assignment_id`) REFERENCES `sop_assignments`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint

CREATE UNIQUE INDEX `user_sop_assignments_assignment_user_unique` ON `user_sop_assignments` (`sop_assignment_id`, `user_id`);