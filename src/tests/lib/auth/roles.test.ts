import { describe, expect, it } from 'vitest';

import { canViewChecklists, isAdministrator } from '../../../lib/auth/roles';

describe('role helpers', () => {
	it('treats admin and administrator as admin roles', () => {
		expect(isAdministrator('admin')).toBe(true);
		expect(isAdministrator('administrator')).toBe(true);
		expect(isAdministrator('employee')).toBe(false);
	});

	it('allows checklist visibility for admin, administrator, employee, volunteer', () => {
		expect(canViewChecklists('admin')).toBe(true);
		expect(canViewChecklists('administrator')).toBe(true);
		expect(canViewChecklists('employee')).toBe(true);
		expect(canViewChecklists('volunteer')).toBe(true);
		expect(canViewChecklists('probationary')).toBe(false);
	});
});
