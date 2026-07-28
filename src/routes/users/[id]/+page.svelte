<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { printChecklist } from '$lib/utils/printChecklist';
	import type { PageData } from './$types';

	export let data: PageData;

	type UserRecord = NonNullable<PageData['user']>;

	let user: UserRecord | null = structuredClone(data.user);
	let checklists: any[] = [];
	let loadingChecklists = true;

	async function save() {
		if (!user) return;

		const res = await fetch(`/api/users/${user.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user)
		});

		if (res.ok) {
			alert('Saved!');
		} else {
			alert('Error saving user');
		}
	}

	async function deleteUser() {
		if (!data.user) return;
		if (!confirm('Delete this user? This cannot be undone.')) return;

		const res = await fetch(`/api/users/${data.user.id}`, {
			method: 'DELETE'
		});

		if (res.ok) {
			goto('/');
		} else {
			alert('Failed to delete user');
		}
	}

	// ----------------------------
	// Checklist logic
	// ----------------------------
	onMount(async () => {
		if (!user) {
			loadingChecklists = false;
			return;
		}

		const res = await fetch(`/api/users/${user.id}/checklists`);
		checklists = res.ok ? await res.json() : [];
		loadingChecklists = false;
	});

	async function toggleItem(item: any) {
		const newCompleted = !item.completed;

		// optimistic UI
		item.completed = newCompleted;
		item.dateCompleted = newCompleted
			? new Date().toISOString()
			: null;

		const res = await fetch('/api/checklists/items/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userChecklistItemId: item.userChecklistItemId,
				completed: newCompleted
			})
		});

		if (!res.ok) {
			// rollback
			item.completed = !newCompleted;
			item.dateCompleted = newCompleted ? null : item.dateCompleted;
			alert('Failed to update checklist item');
		}
	}
</script>

<main class="user-details">
	{#if !user}
		<h1>User Not Found</h1>
		<p class="muted">The requested user record could not be loaded.</p>
	{:else}
		<!-- ================= USER FORM ================= -->
		<h1>Edit User</h1>

		<div class="form-section">
			<label for="firstName">First Name</label>
			<input id="firstName" bind:value={user.firstName} />

			<label for="lastName">Last Name</label>
			<input id="lastName" bind:value={user.lastName} />

			<label for="address">Address</label>
			<input id="address" bind:value={user.address} placeholder="123 Main St" />

			<label for="personalEmail">Personal Email</label>
			<input id="personalEmail" type="email" bind:value={user.personalEmail} />

			<label for="phone">Phone</label>
			<input id="phone" bind:value={user.phone} />

			<label for="workEmail">Work Email</label>
			<input id="workEmail" type="email" bind:value={user.workEmail} />

			<label for="tshirtSize">T-shirt Size</label>
			<select id="tshirtSize" bind:value={user.tshirtSize}>
				<option value="">Select</option>
				<option>S</option>
				<option>M</option>
				<option>L</option>
				<option>XL</option>
				<option>2XL</option>
				<option>3XL</option>
			</select>

			<label for="maskSize">Mask Size</label>
			<select id="maskSize" bind:value={user.maskSize}>
				<option value="">Select</option>
				<option>Small</option>
				<option>Medium</option>
				<option>Large</option>
			</select>

			<label for="fitTestDate">Fit Test Date</label>
			<input id="fitTestDate" type="date" bind:value={user.fitTestDate} />

			<button class="save-btn" type="button" on:click={save}>
				Save Changes
			</button>

			<button class="delete-user" type="button" on:click={deleteUser}>
				Delete User
			</button>
		</div>

		<hr />

		<!-- ================= CHECKLISTS ================= -->
		<h2>Assigned Checklists</h2>

		{#if loadingChecklists}
			<p class="muted">Loading checklists…</p>
		{:else if checklists.length === 0}
			<p class="muted">No checklists assigned to this user.</p>
		{:else}
			{#each checklists as checklist}
				<div class="checklist-card">
					<div class="checklist-header">
						<h3>{checklist.name}</h3>

						<button
							class="print-btn"
							on:click={() =>
								printChecklist({
									userName: `${user.lastName}, ${user.firstName}`,
									checklistName: checklist.name,
									items: checklist.items
								})
							}
						>
							Print Checklist
						</button>
					</div>

					<table>
						<thead>
							<tr>
								<th>#</th>
								<th>Task</th>
								<th>Done</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{#each checklist.items as item}
								<tr class:completed={item.completed}>
									<td>{item.number}</td>
									<td>{item.taskName}</td>
									<td>
										<input
											type="checkbox"
											checked={item.completed}
											on:change={() => toggleItem(item)}
										/>
									</td>
									<td>
										{item.dateCompleted
											? new Date(item.dateCompleted).toLocaleDateString()
											: '—'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}
		{/if}
	{/if}

</main>

<style>
	.user-details {
		max-width: 900px;
		margin: 20px auto;
	}

	.form-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px 20px;
		margin-bottom: 30px;
	}

	label {
		font-weight: bold;
	}

	input,
	select {
		padding: 6px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.save-btn {
		grid-column: span 2;
		padding: 10px;
		background: #003670;
		color: white;
		border-radius: 4px;
		border: none;
		cursor: pointer;
	}

	.delete-user {
		margin-top: 20px;
		padding: 10px 14px;
		border-radius: 10px;
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
		font-weight: 600;
		cursor: pointer;
	}

	hr {
		margin: 40px 0;
	}

	.muted {
		color: #6b7280;
		font-size: 14px;
	}

	.checklist-card {
		margin-top: 24px;
		padding: 20px;
		background: #ffffff;
		border-radius: 14px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
	}

	th,
	td {
		padding: 10px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
	}

	tr.completed td {
		opacity: 0.6;
		text-decoration: line-through;
	}

	.checklist-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.print-btn {
		background: none;
		border: none;
		color: #2563eb;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
	}

	.print-btn:hover {
		text-decoration: underline;
	}

</style>
