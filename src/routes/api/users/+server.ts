import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';

export async function POST({ request }) {
	const body = await request.json();

	const db = await getDB();

	const result = await db
		.insert(users)
		.values({
			firstName: body.firstName,
			lastName: body.lastName,
			phone: body.phone,
			personalEmail: body.personalEmail,
			role: body.role ?? 'probationary',
			address: body.address ?? null,
			workEmail: body.workEmail ?? null,
			maskSize: body.maskSize ?? null,
			fitTestDate: body.fitTestDate ?? null,
			tshirtSize: body.tshirtSize ?? null
		})
		.returning({ id: users.id });

	return json({ id: result[0].id });
}
