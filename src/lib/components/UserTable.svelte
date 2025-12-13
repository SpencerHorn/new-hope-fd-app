<script lang="ts">
	import { onMount } from 'svelte';

	type User = {
		id: number;
		firstName: string;
		lastName: string;
		phone: string;
		personalEmail: string;
		role: string;
	};

	let users: User[] = [];
	let loading = false;

	// Form fields
	let firstName = '';
	let lastName = '';
	let phone = '';
	let personalEmail = '';
	let roleFilter = 'all';
	let showMore = false;

	async function loadUsers() {
		loading = true;
		const params = new URLSearchParams();

		if (firstName) params.set('firstName', firstName);
		if (lastName) params.set('lastName', lastName);
		if (phone) params.set('phone', phone);
		if (personalEmail) params.set('email', personalEmail);
		if (roleFilter !== 'all') params.set('role', roleFilter);

		const res = await fetch(`/api/users?${params}`);
		users = await res.json();
		loading = false;
	}

	async function updateRole(userId: number, newRole: string) {
		await fetch(`/api/users/${userId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: newRole })
		});

		users = users.map((u) =>
			u.id === userId ? { ...u, role: newRole } : u
		);
	}

	async function deleteUser(id: number) {
		if (!confirm('Delete this user?')) return;
		await fetch(`/api/users/${id}`, { method: 'DELETE' });
		users = users.filter((u) => u.id !== id);
	}

	onMount(loadUsers);
</script>

<section class="card">
	<h1>User Management</h1>

	<div class="form-grid">
		<input placeholder="First name" bind:value={firstName} />
		<input placeholder="Last name" bind:value={lastName} />
		<input placeholder="Phone" bind:value={phone} />
		<input placeholder="Personal email" bind:value={personalEmail} />

		<select bind:value={roleFilter}>
			<option value="all">All roles</option>
			<option value="probationary">Probationary</option>
			<option value="volunteer">Volunteer</option>
			<option value="employee">Employee</option>
		</select>

		<button on:click={loadUsers}>Search</button>
	</div>
</section>

<section class="card">
	<h2>Users</h2>

	{#if loading}
		<p>Loading…</p>
	{:else}
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
				{#each users as u}
					<tr>
						<td>
							<a class="user-link" href={`/users/${u.id}`}>
								{u.lastName}, {u.firstName}
							</a>
						</td>
						<td>{u.phone}</td>
						<td>{u.personalEmail}</td>
						<td>
							<select
								class="role-select"
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
							<button class="danger" on:click={() => deleteUser(u.id)}>✕</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>

<style>
	.card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 24px;
		box-shadow: 0 20px 40px rgba(0,0,0,0.06);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 12px;
	}

	input, select {
		padding: 10px;
		border-radius: 10px;
		border: 1px solid #ddd;
	}

	button {
		padding: 10px 14px;
		border-radius: 10px;
		border: 1px solid #ccc;
		background: #f5f5f7;
		cursor: pointer;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 12px;
		border-bottom: 1px solid #eee;
	}

	.user-link {
		font-weight: 600;
		color: #111827;
		text-decoration: none;
	}

	.user-link:hover {
		text-decoration: underline;
	}

	.role-select {
		padding: 6px 10px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 600;
		background: #fde68a;
		border: none;
		cursor: pointer;
	}

	button.danger {
		background: none;
		border: none;
		color: red;
		font-size: 18px;
	}
</style>
