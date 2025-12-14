<script lang="ts">
	import { goto } from '$app/navigation';

	/* ---------- props from server ---------- */
	export let users: any[] = [];

	/* ---------- form state ---------- */
	let showMore = false;

	let firstName = '';
	let lastName = '';
	let phone = '';
	let personalEmail = '';
	let role = '';

	let address = '';
	let workEmail = '';
	let maskSize = '';
	let fitTestDate = '';
	let tshirtSize = '';

	/* ---------- table state (MUST be let, not derived) ---------- */
	let tableRoleFilter = 'all';
	let sortAsc = true;

	/* ---------- actions ---------- */
	function submitSearch() {
		const params = new URLSearchParams({
			firstName,
			lastName,
			phone,
			personalEmail,
			role
		});
		goto(`/users?${params.toString()}`);
	}

	async function addUser() {
		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName,
				lastName,
				phone,
				personalEmail,
				role: role || 'probationary',
				address,
				workEmail,
				maskSize,
				fitTestDate,
				tshirtSize
			})
		});

		if (!res.ok) {
			alert('Failed to create user');
			return;
		}

		const { id } = await res.json();
		goto(`/users/${id}`);
	}

	async function updateRole(id: number, newRole: string) {
		await fetch(`/api/users/${id}/role`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: newRole })
		});
	}

	async function deleteUser(id: number) {
		if (!confirm('Delete this user?')) return;

		await fetch(`/api/users/delete/${id}`, { method: 'POST' });
		location.reload();
	}

	/* ---------- derived table rows ---------- */
	$: filteredUsers = users
		.filter((u) =>
			tableRoleFilter === 'all' ? true : u.role === tableRoleFilter
		)
		.sort((a, b) =>
			sortAsc
				? a.lastName.localeCompare(b.lastName)
				: b.lastName.localeCompare(a.lastName)
		);
</script>

<section class="card">
	<h1>User Management</h1>

	<form class="form" on:submit|preventDefault={submitSearch}>
		<div class="grid">
			<input placeholder="First name" bind:value={firstName} />
			<input placeholder="Last name" bind:value={lastName} />
			<input placeholder="Phone" bind:value={phone} />
			<input placeholder="Personal email" bind:value={personalEmail} />
			<select bind:value={role}>
				<option value="">All roles</option>
				<option value="probationary">Probationary</option>
				<option value="volunteer">Volunteer</option>
				<option value="employee">Employee</option>
			</select>
		</div>

		<button type="button" class="link" on:click={() => (showMore = !showMore)}>
			{showMore ? 'Less fields' : 'More fields'}
		</button>

		{#if showMore}
			<div class="grid">
				<input placeholder="Address" bind:value={address} />
				<input placeholder="Work email" bind:value={workEmail} />
				<input placeholder="Mask size" bind:value={maskSize} />
				<input placeholder="Fit test date (YYYY-MM-DD)" bind:value={fitTestDate} />
				<input placeholder="T-shirt size" bind:value={tshirtSize} />
			</div>
		{/if}

		<div class="actions">
			<button type="submit">Search</button>
			<button type="button" class="primary" on:click={addUser}>Add User</button>
		</div>
	</form>
</section>

<section class="card">
	<div class="table-controls">
		<h2>Users</h2>
		<div>
			<select bind:value={tableRoleFilter}>
				<option value="all">All roles</option>
				<option value="probationary">Probationary</option>
				<option value="volunteer">Volunteer</option>
				<option value="employee">Employee</option>
			</select>
			<button on:click={() => (sortAsc = !sortAsc)}>
				Sort {sortAsc ? '▲' : '▼'}
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
			{#each filteredUsers as u}
				<tr>
					<td>
						<a href={`/users/${u.id}`}>{u.lastName}, {u.firstName}</a>
					</td>
					<td>{u.phone}</td>
					<td>{u.personalEmail}</td>
					<td>
						<select
							class="role-pill"
							value={u.role}
							on:change={(e) => updateRole(u.id, e.target.value)}
						>
							<option value="probationary">Probationary</option>
							<option value="volunteer">Volunteer</option>
							<option value="employee">Employee</option>
						</select>
					</td>
					<td>
						<button class="danger" on:click={() => deleteUser(u.id)}>✕</button>
					</td>
				</tr>
			{/each}

			{#if filteredUsers.length === 0}
				<tr>
					<td colspan="5">No users found</td>
				</tr>
			{/if}
		</tbody>
	</table>
</section>

<style>
	.card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 32px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	@media (max-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	input,
	select {
		padding: 10px;
		border-radius: 10px;
		border: 1px solid #d1d5db;
		width: 100%;
	}

	.actions {
		margin-top: 16px;
		display: flex;
		gap: 12px;
	}

	button.primary {
		background: #0f172a;
		color: white;
		border-radius: 999px;
		padding: 10px 18px;
	}

	.table-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 12px;
		border-bottom: 1px solid #e5e7eb;
	}

	.role-pill {
		background: #fde68a;
		border-radius: 999px;
		padding: 6px 12px;
	}

	.danger {
		color: red;
		border: none;
		background: none;
		font-size: 18px;
		cursor: pointer;
	}

	.link {
		background: none;
		border: none;
		color: #2563eb;
		cursor: pointer;
		margin-top: 8px;
	}
</style>
