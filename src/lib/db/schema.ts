import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  personalEmail: text('personal_email').notNull(),
  phone: text('phone').notNull(),
  role: text('role').notNull().default('probationary'),
  workEmail: text('work_email'),
  fitTestDate: text('fit_test_date'),
  maskSize: text('mask_size'),
  tshirtSize: text('tshirt_size'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const onboardingItems = sqliteTable('onboarding_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  order: integer('order').default(0),
});

export const userOnboardingStatus = sqliteTable('user_onboarding_status', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  itemId: integer('item_id')
    .notNull()
    .references(() => onboardingItems.id),
  completed: integer('completed').default(0),
  completedAt: text('completed_at'),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  onboarding: many(userOnboardingStatus),
}));
