export const APP_ROLES = ['probationary', 'volunteer', 'employee', 'administrator'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(role: string): role is AppRole {
	return APP_ROLES.includes(role as AppRole);
}

export function isAdministrator(role: string | null | undefined): boolean {
	return role === 'administrator' || role === 'admin';
}

export function canViewChecklists(role: string | null | undefined): boolean {
	return role === 'administrator' || role === 'admin' || role === 'employee' || role === 'volunteer';
}
