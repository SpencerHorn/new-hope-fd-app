import crypto from 'crypto';
import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	address: text('address'),
	personalEmail: text('personal_email').notNull(),
	phone: text('phone').notNull(),
	role: text('role').notNull().default('probationary'),
	workEmail: text('work_email'),
	fitTestDate: text('fit_test_date'),
	maskSize: text('mask_size'),
	tshirtSize: text('tshirt_size'),
	createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updated_at').default('CURRENT_TIMESTAMP')
});

export const onboardingItems = sqliteTable('onboarding_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	order: integer('order').default(0)
});

export const userOnboardingStatus = sqliteTable('user_onboarding_status', {
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	itemId: integer('item_id')
		.notNull()
		.references(() => onboardingItems.id),
	completed: integer('completed').default(0),
	completedAt: text('completed_at')
});

/* --------------------------------------------------------------------------
	Checklists
	- checklists: template/definition
	- checklist_items: items inside a checklist template
	- user_checklists: assignment of a checklist to a user
	- user_checklist_items: per-user completion state per item
----------------------------------------------------------------------------*/

export const checklists = sqliteTable(
	'checklists',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').default('CURRENT_TIMESTAMP')
	},
	(t) => ({
		nameUnique: uniqueIndex('checklists_name_unique').on(t.name)
	})
);

export const checklistItems = sqliteTable('checklist_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	checklistId: text('checklist_id')
		.notNull()
		.references(() => checklists.id, { onDelete: 'cascade' }),
	itemNumber: integer('item_number').notNull(),
	taskName: text('task_name').notNull(),
	// Optional future-proof fields
	dueDate: text('due_date'),
	notes: text('notes')
});

export const userChecklists = sqliteTable('user_checklists', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	checklistId: text('checklist_id')
		.notNull()
		.references(() => checklists.id, { onDelete: 'cascade' }),
	// Primary linkage should be stable user id
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	// Also store phone for convenience/reporting (do not FK unless phone is UNIQUE)
	userPhone: text('user_phone').notNull(),
	assignedAt: text('assigned_at').default('CURRENT_TIMESTAMP')
});

export const userChecklistItems = sqliteTable('user_checklist_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userChecklistId: text('user_checklist_id')
		.notNull()
		.references(() => userChecklists.id, { onDelete: 'cascade' }),
	checklistItemId: text('checklist_item_id')
		.notNull()
		.references(() => checklistItems.id, { onDelete: 'cascade' }),
	completed: integer('completed').notNull().default(0),
	dateCompleted: text('date_completed'),
	// Optional future-proof fields
	completedBy: text('completed_by'),
	notes: text('notes')
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
	onboarding: many(userOnboardingStatus),
	checklists: many(userChecklists)
}));

export const checklistRelations = relations(checklists, ({ many }) => ({
	items: many(checklistItems),
	assignments: many(userChecklists)
}));

export const checklistItemRelations = relations(checklistItems, ({ one, many }) => ({
	checklist: one(checklists, {
		fields: [checklistItems.checklistId],
		references: [checklists.id]
	}),
	userItems: many(userChecklistItems)
}));

export const userChecklistRelations = relations(userChecklists, ({ one, many }) => ({
	user: one(users, {
		fields: [userChecklists.userId],
		references: [users.id]
	}),
	checklist: one(checklists, {
		fields: [userChecklists.checklistId],
		references: [checklists.id]
	}),
	items: many(userChecklistItems)
}));

export const userChecklistItemRelations = relations(userChecklistItems, ({ one }) => ({
	assignment: one(userChecklists, {
		fields: [userChecklistItems.userChecklistId],
		references: [userChecklists.id]
	}),
	templateItem: one(checklistItems, {
		fields: [userChecklistItems.checklistItemId],
		references: [checklistItems.id]
	})
}));

export const authUsers = sqliteTable('auth_users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	password_hash: text('password_hash').notNull()
});

export const authSessions = sqliteTable('auth_sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => authUsers.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

export const invites = sqliteTable('invites', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	token: text('token').notNull(),
	createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
	used: integer('used').default(0) // 0 = not used, 1 = used
});
