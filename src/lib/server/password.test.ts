import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password helpers', () => {
	it('hashes and verifies a password', async () => {
		const plain = 'VerySecure123!';
		const hash = await hashPassword(plain);

		expect(hash).toBeTypeOf('string');
		expect(hash.length).toBeGreaterThan(20);
		await expect(verifyPassword(hash, plain)).resolves.toBe(true);
	});

	it('rejects invalid password for hash', async () => {
		const hash = await hashPassword('VerySecure123!');
		await expect(verifyPassword(hash, 'wrong-password')).resolves.toBe(false);
	});
});
