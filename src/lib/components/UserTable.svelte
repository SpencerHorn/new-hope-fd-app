<script lang="ts">
	import { goto } from '$app/navigation';
	import { invalidate } from '$app/navigation';

	export let users: any[] = [];
	export let filters: any = {};

	let showMore = false;

	let firstName = filters.firstName ?? '';
	let lastName = filters.lastName ?? '';
	let phone = filters.phone ?? '';
	let personalEmail = filters.personalEmail ?? '';
	let role = filters.role ?? '';

	// expanded fields
	let address = '';
	let workEmail = '';
	let maskSize = '';
	let fitTestDate = '';
	let tshirtSize = '';

	/* SEARCH */
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

	/* ADD USER (INLINE — no routing) */
	async function addUser() {
		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName,
				lastName,
				phone,
				personalEmail,
				address,
				workEmail,
				maskSize,
				fitTestDate,
				tshirtSize,
				role: role || 'probationary'
			})
		});

		if (!res.ok) {
			alert('Failed to add user');
			return;
		}

		// Clear form
		firstName = '';
		lastName = '';
		phone = '';
		personalEmail = '';
		address = '';
		workEmail = '';
		maskSize = '';
		fitTestDate = '';
		tshirtSize = '';
		role = '';

		// Refresh data
		await invalidate();
	}
</script>

<section class="user-management">
	<h1>User Management</h1>

	<form class="user-form" on:submit|preventDefault={submitSearch}>
		<div class="form-grid">
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
			<div class="form-grid expanded">
				<input placeholder="Address" bind:value={address} />
				<input placeholder="Work email" bind:value={workEmail} />
				<input placeholder="Mask size" bind:value={maskSize} />
				<input placeholder="Fit test date" bind:value={fitTestDate} />
				<input placeholder="T-shirt size" bind:value={tshirtSize} />
			</div>
		{/if}

		<div class="actions">
			<button type="submit">Search</button>
			<button type="button" on:click={addUser}>Add User</button>
		</div>
	</form>

	<table class="user-table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Phone</th>
				<th>Email</th>
				<th>Role</th>
				<th>Actions</th>
			</tr>
		</thead>

		<tbody>
			{#each users as u}
				<tr>
					<td>
						<a href={`/users/${u.id}`}>
							{u.lastName}, {u.firstName}
						</a>
					</td>
					<td>{u.phone}</td>
					<td>{u.personalEmail}</td>
					<td>{u.role}</td>
					<td>
						<button on:click={() => goto(`/users/${u.id}`)}>View</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<style>
	.user-management {
		max-width: 1100px;
	}

	.user-form {
		margin-bottom: 24px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.form-grid.expanded {
		margin-top: 12px;
	}

	input,
	select {
		padding: 8px;
		border-radius: 6px;
		border: 1px solid #d0d0d0;
		font-size: 14px;
	}

	.actions {
		display: flex;
		gap: 10px;
		margin-top: 12px;
	}

	button {
		padding: 8px 12px;
		border-radius: 6px;
		border: 1px solid #d0d0d0;
		background: #fafafa;
		cursor: pointer;
	}

	button:hover {
		background: #f0f0f0;
	}

	.link {
		background: none;
		border: none;
		color: #2563eb;
		cursor: pointer;
		padding: 6px 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 10px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
	}
</style>
