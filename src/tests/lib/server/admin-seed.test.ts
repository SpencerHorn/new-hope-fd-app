import { describe, expect, it, vi } from 'vitest';

import { ensureAdminUser } from '../../../lib/server/adminSeed';

function makeDbMock(authUser: any, profileUser: any) {
	const getMock = vi
		.fn()
		.mockResolvedValueOnce(authUser)
		.mockResolvedValueOnce(profileUser);

	const selectMock = vi.fn(() => ({
		from: vi.fn(() => ({
			where: vi.fn(() => ({
				get: getMock
			}))
		}))
	}));

	const insertRunMock = vi.fn();
	const insertValuesMock = vi.fn(() => ({ run: insertRunMock }));
	const insertMock = vi.fn(() => ({ values: insertValuesMock }));

	const updateRunMock = vi.fn();
	const updateWhereMock = vi.fn(() => ({ run: updateRunMock }));
	const updateSetMock = vi.fn(() => ({ where: updateWhereMock }));
	const updateMock = vi.fn(() => ({ set: updateSetMock }));

	return {
		db: {
			select: selectMock,
			insert: insertMock,
			update: updateMock
		},
		mocks: {
			getMock,
			insertMock,
			insertValuesMock,
			insertRunMock,
			updateMock,
			updateSetMock,
			updateWhereMock,
			updateRunMock
		}
	};
}

describe('ensureAdminUser', () => {
	it('creates auth user and profile when both are missing', async () => {
		const { db, mocks } = makeDbMock(undefined, undefined);
		const hashPassword = vi.fn(async () => 'hashed-pw');
		const log = vi.fn();

		const result = await ensureAdminUser({ db, hashPassword, log });

		expect(hashPassword).toHaveBeenCalledWith('ChangeMeNow!123');
		expect(mocks.insertMock).toHaveBeenCalledTimes(2);
		expect(mocks.insertValuesMock).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				email: 'admin@newhopefd.org',
				password_hash: 'hashed-pw'
			})
		);
		expect(mocks.insertValuesMock).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				personalEmail: 'admin@newhopefd.org',
				role: 'administrator'
			})
		);
		expect(result).toEqual({
			createdAuthUser: true,
			createdProfile: true,
			syncedProfileRole: false
		});
		expect(log).toHaveBeenCalled();
	});

	it('skips auth creation and syncs existing profile role', async () => {
		const { db, mocks } = makeDbMock({ id: 1 }, { id: 99 });
		const hashPassword = vi.fn(async () => 'hashed-pw');
		const result = await ensureAdminUser({ db, hashPassword, log: vi.fn() });

		expect(hashPassword).not.toHaveBeenCalled();
		expect(mocks.insertMock).not.toHaveBeenCalled();
		expect(mocks.updateMock).toHaveBeenCalledTimes(1);
		expect(mocks.updateSetMock).toHaveBeenCalledWith({ role: 'administrator' });
		expect(result).toEqual({
			createdAuthUser: false,
			createdProfile: false,
			syncedProfileRole: true
		});
	});

	it('creates profile when auth exists but profile is missing', async () => {
		const { db, mocks } = makeDbMock({ id: 1 }, undefined);
		const hashPassword = vi.fn(async () => 'hashed-pw');
		const result = await ensureAdminUser({ db, hashPassword, log: vi.fn() });

		expect(hashPassword).not.toHaveBeenCalled();
		expect(mocks.insertMock).toHaveBeenCalledTimes(1);
		expect(mocks.insertValuesMock).toHaveBeenCalledWith(
			expect.objectContaining({
				firstName: 'System',
				lastName: 'Administrator',
				role: 'administrator'
			})
		);
		expect(result).toEqual({
			createdAuthUser: false,
			createdProfile: true,
			syncedProfileRole: false
		});
	});

	it('supports mutation objects without run()', async () => {
		const getMock = vi
			.fn()
			.mockResolvedValueOnce(undefined)
			.mockResolvedValueOnce(undefined);

		const db = {
			select: () => ({ from: () => ({ where: () => ({ get: getMock }) }) }),
			insert: () => ({ values: () => Promise.resolve() }),
			update: () => ({ set: () => ({ where: () => Promise.resolve() }) })
		};

		const hashPassword = vi.fn(async () => 'hashed-pw');
		const result = await ensureAdminUser({ db, hashPassword, log: vi.fn() });

		expect(result).toEqual({
			createdAuthUser: true,
			createdProfile: true,
			syncedProfileRole: false
		});
	});
});
