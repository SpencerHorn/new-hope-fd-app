CREATE TABLE `sop_documents` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `sop_title` text NOT NULL,
  `sop_number` text NOT NULL,
  `revision_date` text NOT NULL,
  `form_data` text NOT NULL,
  `created_by_user_id` integer,
  `created_at` text DEFAULT 'CURRENT_TIMESTAMP',
  `updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint

CREATE UNIQUE INDEX `sop_documents_name_unique` ON `sop_documents` (`name`);

--> statement-breakpoint

ALTER TABLE `sop_assignments` ADD COLUMN `sop_document_id` text REFERENCES `sop_documents`(`id`);