CREATE TABLE `user_attachments` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` integer NOT NULL,
  `file_name` text NOT NULL,
  `mime_type` text NOT NULL,
  `file_size` integer NOT NULL,
  `file_data` blob NOT NULL,
  `uploaded_at` text DEFAULT 'CURRENT_TIMESTAMP',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint

CREATE UNIQUE INDEX `user_attachments_user_unique` ON `user_attachments` (`user_id`);
