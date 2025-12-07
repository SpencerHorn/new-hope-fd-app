import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { inArray } from 'drizzle-orm';

export async function POST({ request }) {
	const { groups, fields } = await request.json();

	const db = await getDB();

	// Determine selected roles
	const rolesToInclude: string[] = [];
	if (groups.probationary) rolesToInclude.push('probationary');
	if (groups.volunteer) rolesToInclude.push('volunteer');
	if (groups.employee) rolesToInclude.push('employee');

	// Fetch matching users
	const rows = await db.select().from(users).where(inArray(users.role, rolesToInclude)).all();

	// Always force lastName + firstName to appear first
	const finalFields = [
		'lastName',
		'firstName',
		...fields.filter((f) => !['lastName', 'firstName'].includes(f))
	];

	const header = finalFields.join(',');

	const csvRows = rows.map((u) =>
		finalFields
			.map((f) => {
				let val = u[f] ?? '';
				// Escape commas & quotes
				if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
					val = `"${val.replace(/"/g, '""')}"`;
				}
				return val;
			})
			.join(',')
	);

	const csv = [header, ...csvRows].join('\n');

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': 'attachment; filename=roster.csv'
		}
	});
}
