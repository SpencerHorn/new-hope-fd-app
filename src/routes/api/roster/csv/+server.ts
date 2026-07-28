import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { inArray } from 'drizzle-orm';

type UserRow = typeof users.$inferSelect;

type CsvField = Exclude<keyof UserRow, 'id'>;

type CsvRequestBody = {
	groups: {
		probationary?: boolean;
		volunteer?: boolean;
		employee?: boolean;
	};
	fields: string[];
};

const CSV_FIELDS: CsvField[] = [
	'firstName',
	'lastName',
	'address',
	'personalEmail',
	'phone',
	'role',
	'workEmail',
	'fitTestDate',
	'maskSize',
	'tshirtSize',
	'createdAt',
	'updatedAt'
];

function isCsvField(field: string): field is CsvField {
	return CSV_FIELDS.includes(field as CsvField);
}

export async function POST({ request }) {
	const { groups, fields } = (await request.json()) as CsvRequestBody;

	const db = await getDB();

	// Determine selected roles
	const rolesToInclude: string[] = [];
	if (groups.probationary) rolesToInclude.push('probationary');
	if (groups.volunteer) rolesToInclude.push('volunteer');
	if (groups.employee) rolesToInclude.push('employee');

	// Fetch matching users
	const rows = await db.select().from(users).where(inArray(users.role, rolesToInclude)).all();

	// Always force lastName + firstName to appear first
	const requestedFields = fields.filter(isCsvField);

	const finalFields: CsvField[] = [
		'lastName',
		'firstName',
		...requestedFields.filter((f) => !['lastName', 'firstName'].includes(f))
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
				return String(val);
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
