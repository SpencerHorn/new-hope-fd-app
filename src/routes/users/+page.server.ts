import type { PageServerLoad, Actions } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { isAdministrator, isAppRole } from '$lib/auth/roles';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';
import { fail } from '@sveltejs/kit';
import { and, eq, isNull, like } from 'drizzle-orm';
import {
	findExistingUserByEmailOrPhone,
	formatPhone,
	normalizePersonalEmail
} from '$lib/server/user-conflicts';

export const load: PageServerLoad = async ({ url, locals }) => {
	const db = await getDB();
	const isAdmin = isAdministrator(locals.appUser?.role);

	const firstName = url.searchParams.get('firstName') ?? '';
	const lastName = url.searchParams.get('lastName') ?? '';
	const phone = url.searchParams.get('phone') ?? '';
	const personalEmail = url.searchParams.get('personalEmail') ?? '';
	const roleFilter = url.searchParams.get('role') ?? '';
	const isProbationary = locals.appUser?.role === 'probationary';
	const currentUserId = locals.appUser?.id;

	const conditions = [isNull(users.deletedAt)];

	if (isProbationary) {
		if (!currentUserId) {
			return {
				users: [],
				canManageRoles: false,
				canDeleteUsers: false,
				canManageUsers: false,
				canManageDeletedUsers: false
			};
		}
		conditions.push(eq(users.id, currentUserId));
	}

	if (firstName) conditions.push(like(users.firstName, `%${firstName}%`));
	if (lastName) conditions.push(like(users.lastName, `%${lastName}%`));
	if (phone) conditions.push(like(users.phone, `%${phone}%`));
	if (personalEmail) conditions.push(like(users.personalEmail, `%${personalEmail}%`));
	if (roleFilter) conditions.push(like(users.role, roleFilter));

	const query =
		conditions.length > 0
			? db.select().from(users).where(and(...conditions))
			: db.select().from(users);

	const results = (await query.all()).filter((user) => user.personalEmail !== DEFAULT_ADMIN_EMAIL);

	return {
		users: results,
		canManageRoles: isAdmin,
		canDeleteUsers: isAdmin,
		canManageUsers: isAdmin,
		canManageDeletedUsers: isAdmin
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!isAdministrator(locals.appUser?.role)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();

		const firstName = String(form.get('firstName') ?? '');
		const lastName = String(form.get('lastName') ?? '');
		const phone = String(form.get('phone') ?? '');
		const personalEmail = normalizePersonalEmail(String(form.get('personalEmail') ?? ''));
		const requestedRole = String(form.get('role') ?? 'probationary');
		const canManageRoles = isAdministrator(locals.appUser?.role);
		const role = canManageRoles && isAppRole(requestedRole) ? requestedRole : 'probationary';

		if (!firstName || !lastName || !personalEmail) {
			return fail(400, { error: 'Missing required fields' });
		}

		const formattedPhone = formatPhone(phone);
		if (!formattedPhone) {
			return fail(400, { error: 'Phone number must contain exactly 10 digits.' });
		}

		const db = await getDB();
		const existingProfile = await findExistingUserByEmailOrPhone(db, personalEmail, formattedPhone);
		if (existingProfile) {
			return fail(400, { error: 'A user with that email or phone already exists.' });
		}

		await db.insert(users).values({
			firstName,
			lastName,
			phone: formattedPhone,
			personalEmail,
			role
		});

		return { success: true };
	}
};
