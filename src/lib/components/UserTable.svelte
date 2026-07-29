<script lang="ts">
	import UserChecklistModal from '$lib/components/UserChecklistModal.svelte';

	export let users: any[] = [];
	export let canManageRoles = false;
	export let canDeleteUsers = false;
	export let canManageUsers = false;
	export let canManageDeletedUsers = false;

	let showChecklistModal = false;
	let selectedUser: any = null;
	let userChecklists: any[] = [];

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

	async function openChecklistModal(user: any) {
		selectedUser = user;
		showChecklistModal = true;

		const res = await fetch(`/api/users/${user.id}/checklists`);
		userChecklists = await res.json();
	}

	function printRosterFromTools() {
		window.open('/tools/NHFD_Roster.html?autoprint=1', '_blank', 'noopener,noreferrer');
	}

	function printTrainingFromTools() {
		window.open('/tools/NHFD_Training.html?autoprint=1', '_blank', 'noopener,noreferrer');
	}
</script>

<!-- ================= FORM ================= -->
<section class="card">
	{#if canManageDeletedUsers}
		<div class="deleted-link-row">
			<a class="deleted-link" href="/users/deleted">View Deleted Users</a>
		</div>
	{/if}

	<h1>User Management</h1>

	{#if canManageUsers}
		<form method="POST" action="?/create" class="user-form" on:submit={handleAddSubmit}>
			<div class="form-grid">
				<input name="firstName" placeholder="First name" bind:value={firstName} />
				<input name="lastName" placeholder="Last name" bind:value={lastName} />
				<input name="phone" placeholder="Phone" bind:value={phone} />
				<input name="personalEmail" placeholder="Personal email" bind:value={personalEmail} />

				{#if canManageRoles}
					<select name="role">
						<option value="probationary">Probationary</option>
						<option value="volunteer">Volunteer</option>
						<option value="employee">Employee</option>
						<option value="administrator">Administrator</option>
					</select>
				{:else}
					<input value="Probationary" disabled />
					<input type="hidden" name="role" value="probationary" />
				{/if}
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
	{:else}
		<p class="muted-note">Only administrators can add users.</p>
	{/if}
</section>

<!-- ================= TABLE ================= -->
<section class="card">
	<div class="table-header">
		<h2>Users</h2>

		<div class="print-actions">
			<button class="print-roster" on:click={printRosterFromTools}>Print Roster</button>
			<button class="print-roster" on:click={printTrainingFromTools}>Print Training Sheet</button>
		</div>
	</div>

	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th class="row-number">#</th>
					<th>Name</th>
					<th>Phone</th>
					<th>Email</th>
					<th>Role</th>
					<th>Checklists</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each filteredUsers as u, index}
					<tr>
						<td class="row-number">{index + 1}</td>
						<td>
							<a class="user-link" href={`/users/${u.id}`}>
								{u.lastName}, {u.firstName}
							</a>
						</td>
						<td>{u.phone}</td>
						<td>{u.personalEmail}</td>
						<td>
							{#if canManageRoles}
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
									<option value="administrator">Administrator</option>
								</select>
							{:else}
								<span class="role-badge">{u.role}</span>
							{/if}
						</td>
						<td>
							<button class="link" on:click={() => openChecklistModal(u)}>
								View
							</button>
						</td>
						<td>
							{#if canDeleteUsers}
								<button class="delete" on:click={() => deleteUser(u.id)}>✕</button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
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

	.deleted-link-row {
		display: flex;
		justify-content: flex-start;
		margin-bottom: 12px;
	}

	.deleted-link {
		text-decoration: none;
		font-weight: 600;
		color: #1d4ed8;
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

	button.link {
		background: none;
		border: none;
		color: #2563eb;
		font-size: 14px;
		cursor: pointer;
		align-self: flex-start;
	}

	.muted-note {
		color: #6b7280;
		font-size: 14px;
		margin: 0;
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

	.print-actions {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
	}

	.table-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 760px;
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
		min-width: 128px;
	}

	.role-badge {
		display: inline-block;
		background: #f3f4f6;
		border-radius: 999px;
		padding: 6px 12px;
		font-weight: 600;
		text-transform: capitalize;
	}

	.delete {
		background: none;
		border: none;
		color: red;
		font-size: 18px;
		cursor: pointer;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.row-number {
		width: 42px;
		text-align: center;
		color: #4b5563;
		font-weight: 600;
	}

.print-roster {
	background: none;
	border: none;
	color: #2563eb;
	font-weight: 600;
	cursor: pointer;
	padding: 0;
}

.print-roster:hover {
	text-decoration: underline;
}

.user-link {
	color: #2563eb;
	cursor: pointer;
	text-decoration: none;
	font-weight: 500;
}

.user-link:hover {
	text-decoration: underline;
}

	@media (max-width: 960px) {
		.card {
			padding: 16px;
			border-radius: 14px;
			margin-bottom: 18px;
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		input,
		select {
			font-size: 16px;
		}

		.print-roster {
			font-size: 15px;
		}
	}

	@media (max-width: 640px) {
		h1,
		h2 {
			margin-bottom: 10px;
		}

		.actions-row {
			width: 100%;
		}

		button.primary {
			width: 100%;
			text-align: center;
		}

		.table-header {
			align-items: flex-start;
			gap: 4px;
		}

		th,
		td {
			padding: 12px 8px;
		}
	}

</style>

{#if showChecklistModal}
	<UserChecklistModal
		userId={selectedUser.id}
		checklists={userChecklists}
		on:close={() => (showChecklistModal = false)}
	/>
{/if}