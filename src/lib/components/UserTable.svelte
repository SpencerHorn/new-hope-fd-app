<script lang="ts">
	export let users: any[] = [];

	let firstName = '';
	let lastName = '';
	let phone = '';
	let personalEmail = '';
	let roleFilter = 'all';

	let showMore = false;

	async function updateRole(id: number, role: string) {
		await fetch(`/api/users/${id}/role`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role })
		});
	}

	async function deleteUser(id: number) {
		if (!confirm('Delete this user?')) return;

		await fetch(`/api/users/${id}`, {
			method: 'DELETE'
		});

		location.reload();
	}
</script>

<section class="card">
	<h1>User Management</h1>

	<form method="POST" action="?/create" class="user-form">
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

			<button class="secondary" type="submit">Search</button>
		</div>

		<div class="actions-row">
			<button class="primary" type="submit">Add User</button>
		</div>

		<button type="button" class="link" on:click={() => (showMore = !showMore)}>
			{showMore ? 'Less fields' : 'More fields'}
		</button>
	</form>
</section>

<section class="card">
	<h2>Users</h2>

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
			{#if users.length === 0}
				<tr>
					<td colspan="5">No users found</td>
				</tr>
			{:else}
				{#each users as u}
					<tr>
						<td>
							<a href={`/users/${u.id}`}>
								{u.lastName}, {u.firstName}
							</a>
						</td>
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
	.card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 24px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
		max-width: 100%;
		overflow-x: hidden;
	}

	h1,
	h2 {
		margin-bottom: 16px;
	}

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
	}

	.actions-row {
		display: flex;
		gap: 12px;
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

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 14px 10px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
	}

	.role-pill {
		background: #fde68a;
		border-radius: 999px;
		padding: 6px 12px;
		font-weight: 600;
		border: none;
	}

	.delete {
		background: none;
		border: none;
		color: red;
		font-size: 18px;
		cursor: pointer;
	}
</style>
