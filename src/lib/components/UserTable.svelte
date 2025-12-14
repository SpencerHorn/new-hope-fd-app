<script lang="ts">
	import { goto } from '$app/navigation';

	export let users: any[] = [];

	// Form state
	let firstName = '';
	let lastName = '';
	let phone = '';
	let personalEmail = '';
	let roleFilter = 'all';
	let showMore = false;
	let address = '';
	let workEmail = '';
	let maskSize = '';
	let fitTestDate = '';
	let tshirtSize = '';

	// Validation error
	let formError = '';

	// Table controls
	let sortDir: 'asc' | 'desc' = 'asc';
	let tableRoleFilter = 'all';

	/* -------------------------
	   Helpers
	------------------------- */
	function normalizeName(value: string): string {
		return value
			.trim()
			.toLowerCase()
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatPhone(raw: string): string | null {
		const digits = raw.replace(/\D/g, '');
		if (digits.length !== 10) return null;
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	}

	function emailExists(email: string): boolean {
		return users.some((u) => u.personalEmail?.toLowerCase() === email.toLowerCase());
	}

	function phoneExists(formattedPhone: string): boolean {
		return users.some((u) => u.phone === formattedPhone);
	}

	/* -------------------------
	   Add user submit
	------------------------- */
	function handleAddSubmit(e: SubmitEvent) {
		formError = '';

		const formatted = formatPhone(phone);
		if (!formatted) {
			formError = 'Phone number must contain exactly 10 digits.';
			e.preventDefault();
			return;
		}

		if (phoneExists(formatted)) {
			formError = 'A user with this phone number already exists.';
			e.preventDefault();
			return;
		}

		if (emailExists(personalEmail)) {
			formError = 'A user with this email address already exists.';
			e.preventDefault();
			return;
		}

		// ✅ Normalize before save
		firstName = normalizeName(firstName);
		lastName = normalizeName(lastName);
		phone = formatted;
	}

	/* -------------------------
	   ✅ RESTORED: Client-side search
	------------------------- */
	$: filteredUsers = users
		.filter((u) => {
			if (tableRoleFilter !== 'all' && u.role !== tableRoleFilter) return false;

			if (firstName && !u.firstName?.toLowerCase().includes(firstName.toLowerCase()))
				return false;

			if (lastName && !u.lastName?.toLowerCase().includes(lastName.toLowerCase()))
				return false;

			if (personalEmail && !u.personalEmail?.toLowerCase().includes(personalEmail.toLowerCase()))
				return false;

			if (phone && !u.phone?.includes(phone.replace(/\D/g, ''))) return false;

			return true;
		})
		.sort((a, b) => {
			const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
			const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
			return sortDir === 'asc'
				? nameA.localeCompare(nameB)
				: nameB.localeCompare(nameA);
		});

	async function updateRole(id: number, role: string) {
		await fetch(`/api/users/${id}/role`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role })
		});
	}

	async function deleteUser(id: number) {
		if (!confirm('Delete this user?')) return;
		await fetch(`/api/users/${id}`, { method: 'DELETE' });
		location.reload();
	}
</script>

<!-- ================= FORM ================= -->
<section class="card">
	<h1>User Management</h1>

	<form method="POST" action="?/create" class="user-form" on:submit={handleAddSubmit}>
		<div class="form-grid">
			<input name="firstName" placeholder="First name" bind:value={firstName} />
			<input name="lastName" placeholder="Last name" bind:value={lastName} />
			<input name="phone" placeholder="Phone" bind:value={phone} />
			<input name="personalEmail" placeholder="Personal email" bind:value={personalEmail} />

			<select name="role">
				<option value="probationary">Probationary</option>
				<option value="volunteer">Volunteer</option>
				<option value="employee">Employee</option>
			</select>
		</div>

		{#if showMore}
			<div class="form-grid">
				<input name="address" placeholder="Address" bind:value={address} />
				<input name="workEmail" placeholder="Work email" bind:value={workEmail} />
				<input name="maskSize" placeholder="Mask size" bind:value={maskSize} />
				<input name="fitTestDate" type="date" bind:value={fitTestDate} />
				<input name="tshirtSize" placeholder="T-shirt size" bind:value={tshirtSize} />
			</div>
		{/if}

		{#if formError}
			<p style="color:#dc2626">{formError}</p>
		{/if}

		<div class="actions-row">
			<button class="primary" type="submit">Add User</button>
		</div>

		<button type="button" class="link" on:click={() => (showMore = !showMore)}>
			{showMore ? 'Less fields' : 'More fields'}
		</button>
	</form>
</section>

<!-- ================= TABLE ================= -->
<section class="card">
	<div class="table-header">
		<h2>Users</h2>

		<div class="table-controls">
			<select bind:value={tableRoleFilter}>
				<option value="all">All roles</option>
				<option value="probationary">Probationary</option>
				<option value="volunteer">Volunteer</option>
				<option value="employee">Employee</option>
			</select>

			<button class="sort-btn" on:click={() => (sortDir = sortDir === 'asc' ? 'desc' : 'asc')}>
				Sort {sortDir === 'asc' ? '▲' : '▼'}
			</button>
		</div>
	</div>

	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Phone</th>
				<th>Email</th>
				<th>Role</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#if filteredUsers.length === 0}
				<tr><td colspan="5">No users found</td></tr>
			{:else}
				{#each filteredUsers as u}
					<tr>
						<td><a href={`/users/${u.id}`}>{u.lastName}, {u.firstName}</a></td>
						<td>{u.phone}</td>
						<td>{u.personalEmail}</td>
						<td>
							<select
								class="role-pill"
								value={u.role}
								on:change={(e) =>
									updateRole(u.id, (e.target as HTMLSelectElement).value)
								}
							>
								<option value="probationary">Probationary</option>
								<option value="volunteer">Volunteer</option>
								<option value="employee">Employee</option>
							</select>
						</td>
						<td>
							<button class="delete" on:click={() => deleteUser(u.id)}>✕</button>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</section>

<style>
	/* ---------- Layout ---------- */
	.card {
		background: white;
		border-radius: 18px;
		padding: 24px;
		margin-bottom: 28px;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
		max-width: 100%;
		overflow-x: hidden;
	}

	h1,
	h2 {
		margin-bottom: 16px;
	}

	/* ---------- Form ---------- */
	.user-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
		width: 100%;
	}

	input,
	select {
		padding: 12px 14px;
		border-radius: 12px;
		border: 1px solid #d1d5db;
		font-size: 15px;
		width: 100%;
		box-sizing: border-box;
	}

	.actions-row {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	button.primary {
		background: #111827;
		color: white;
		border: none;
		border-radius: 14px;
		padding: 12px 20px;
		font-size: 15px;
		cursor: pointer;
	}

	button.secondary {
		background: #f3f4f6;
		border-radius: 14px;
		border: 1px solid #d1d5db;
		padding: 12px;
		cursor: pointer;
	}

	button.link {
		background: none;
		border: none;
		color: #2563eb;
		font-size: 14px;
		cursor: pointer;
		align-self: flex-start;
	}

	/* ---------- Table ---------- */
	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		gap: 12px;
		flex-wrap: wrap;
	}

	.table-controls {
		display: flex;
		gap: 10px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 14px 10px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
		white-space: nowrap;
	}

	.role-pill {
		background: #fde68a;
		border-radius: 999px;
		padding: 6px 12px;
		font-weight: 600;
		border: none;
	}

	.sort-btn {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 10px;
		padding: 8px 12px;
		cursor: pointer;
	}

	.delete {
		background: none;
		border: none;
		color: red;
		font-size: 18px;
		cursor: pointer;
	}
</style>
