import { getDB } from '../src/lib/db/client';
import { ensureAdminUser } from '../src/lib/server/adminSeed';
import { Argon2id } from 'oslo/password';

async function main() {
	const db = await getDB();

	await ensureAdminUser({
		db,
		hashPassword: (password) => new Argon2id().hash(password)
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
