import { eq } from 'drizzle-orm';
import { authUsers, users } from '$lib/db/schema';

export const DEFAULT_ADMIN_EMAIL = 'admin@newhopefd.org';
export const DEFAULT_ADMIN_PASSWORD = 'ChangeMeNow!123';

type Logger = (...args: unknown[]) => void;

export type EnsureAdminUserOptions = {
	db: any;
	hashPassword: (password: string) => Promise<string>;
	log?: Logger;
	email?: string;
	password?: string;
};

export type EnsureAdminUserResult = {
	createdAuthUser: boolean;
	createdProfile: boolean;
	syncedProfileRole: boolean;
};

async function executeMutation(mutation: any): Promise<void> {
	if (mutation && typeof mutation.run === 'function') {
		mutation.run();
		return;
	}
	await mutation;
}

export async function ensureAdminUser(options: EnsureAdminUserOptions): Promise<EnsureAdminUserResult> {
	const {
		db,
		hashPassword,
		log = console.log,
		email = DEFAULT_ADMIN_EMAIL,
		password = DEFAULT_ADMIN_PASSWORD
	} = options;

	const existingAuthUser = await db.select().from(authUsers).where(eq(authUsers.email, email)).get();
	let createdAuthUser = false;

	if (!existingAuthUser) {
		log('Seeding admin auth user...');
		const passwordHash = await hashPassword(password);
		await executeMutation(
			db.insert(authUsers).values({
				email,
				password_hash: passwordHash
			})
		);
		createdAuthUser = true;
		log('Seeded admin auth user:');
		log('Email:', email);
		log('Password:', password);
	} else {
		log('Admin auth user exists — skipping auth seed');
	}

	const existingProfile = await db.select().from(users).where(eq(users.personalEmail, email)).get();
	let createdProfile = false;
	let syncedProfileRole = false;

	if (existingProfile) {
		await executeMutation(
			db.update(users).set({ role: 'administrator' }).where(eq(users.id, existingProfile.id))
		);
		syncedProfileRole = true;
		log('Admin profile role synchronized to administrator.');
	} else {
		await executeMutation(
			db.insert(users).values({
				firstName: 'System',
				lastName: 'Administrator',
				personalEmail: email,
				phone: '(000) 000-0000',
				role: 'administrator'
			})
		);
		createdProfile = true;
		log('Admin profile created with administrator role.');
	}

	return {
		createdAuthUser,
		createdProfile,
		syncedProfileRole
	};
}
