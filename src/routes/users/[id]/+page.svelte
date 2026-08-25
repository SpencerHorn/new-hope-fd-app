<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { printChecklist } from '$lib/utils/printChecklist';
	import type { PageData } from './$types';

	export let data: PageData;

	type UserRecord = NonNullable<PageData['user']>;

	let user: UserRecord | null = structuredClone(data.user);
	let attachments: any[] = data.attachments ? structuredClone(data.attachments) : [];
	let checklists: any[] = [];
	let loadingChecklists = true;
	let sopAssignments: any[] = [];
	let loadingSopAssignments = true;

	async function uploadAttachment(event: Event) {
		if (!user) return;
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		const formData = new FormData();
		formData.set('attachment', file);

		const res = await fetch(`/api/users/${user.id}/attachments`, {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			alert((await res.text()) || 'Unable to upload file.');
			return;
		}

		attachments = [...attachments, await res.json()];
	}

	async function removeAttachment(attachmentId: string) {
		if (!user) return;
		if (!confirm('Remove this file?')) return;

		const res = await fetch(`/api/users/${user.id}/attachments/${attachmentId}`, {
			method: 'DELETE'
		});

		if (!res.ok) {
			alert((await res.text()) || 'Unable to remove file.');
			return;
		}

		attachments = attachments.filter((a) => a.id !== attachmentId);
	}

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
		const reason = prompt('Please provide a reason for deleting this user:');
		if (reason === null) return;
		if (!reason.trim()) {
			alert('A reason for deletion is required.');
			return;
		}

		const res = await fetch(`/api/users/${data.user.id}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ reason: reason.trim() })
		});

		if (res.ok) {
			goto('/');
		} else {
			alert('Failed to delete user');
		}
	}

	async function resetPassword() {
		if (!data.user || !data.canManageUsers) return;

		const temporaryPassword = prompt(
			'Enter a temporary password (leave blank to auto-generate a secure temporary password):',
			''
		);

		if (temporaryPassword === null) return;

		const res = await fetch(`/api/users/${data.user.id}/password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ temporaryPassword })
		});

		const body = await res.json().catch(() => ({}));
		if (!res.ok) {
			alert(body.error ?? 'Failed to reset password');
			return;
		}

		alert(
			`Temporary password for ${user?.firstName} ${user?.lastName}: ${body.temporaryPassword}\n\nThe user will be prompted to change it on their next login.`
		);
	}

	// ----------------------------
	// Checklist logic
	// ----------------------------
	onMount(async () => {
		if (!user) {
			loadingChecklists = false;
			loadingSopAssignments = false;
			return;
		}

		const [checklistRes, sopRes] = await Promise.all([
			fetch(`/api/users/${user.id}/checklists`),
			fetch(`/api/users/${user.id}/sops`)
		]);

		checklists = checklistRes.ok ? await checklistRes.json() : [];
		loadingChecklists = false;

		sopAssignments = sopRes.ok ? await sopRes.json() : [];
		loadingSopAssignments = false;
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
		{#if !data.canManageUsers}
			<p class="muted">View only. Only administrators can modify user records.</p>
		{/if}

		<div class="form-section">
			<label for="firstName">First Name</label>
			<input id="firstName" bind:value={user.firstName} disabled={!data.canManageUsers} />

			<label for="lastName">Last Name</label>
			<input id="lastName" bind:value={user.lastName} disabled={!data.canManageUsers} />

			<label for="address">Address</label>
			<input
				id="address"
				bind:value={user.address}
				placeholder="123 Main St"
				disabled={!data.canManageUsers}
			/>

			<label for="personalEmail">Personal Email</label>
			<input
				id="personalEmail"
				type="email"
				bind:value={user.personalEmail}
				disabled={!data.canManageUsers}
			/>

			<label for="phone">Phone</label>
			<input id="phone" bind:value={user.phone} disabled={!data.canManageUsers} />

			<label for="workEmail">Work Email</label>
			<input
				id="workEmail"
				type="email"
				bind:value={user.workEmail}
				disabled={!data.canManageUsers}
			/>

			<label for="tshirtSize">T-shirt Size</label>
			<select id="tshirtSize" bind:value={user.tshirtSize} disabled={!data.canManageUsers}>
				<option value="">Select</option>
				<option>S</option>
				<option>M</option>
				<option>L</option>
				<option>XL</option>
				<option>2XL</option>
				<option>3XL</option>
			</select>

			<label for="maskSize">Mask Size</label>
			<select id="maskSize" bind:value={user.maskSize} disabled={!data.canManageUsers}>
				<option value="">Select</option>
				<option>Small</option>
				<option>Medium</option>
				<option>Large</option>
			</select>

			<label for="fitTestDate">Fit Test Date</label>
			<input
				id="fitTestDate"
				type="date"
				bind:value={user.fitTestDate}
				disabled={!data.canManageUsers}
			/>

			{#if data.canManageUsers}
				<button class="save-btn" type="button" on:click={save}>
					Save Changes
				</button>

				<button class="reset-password" type="button" on:click={resetPassword}>
					Reset Password
				</button>

				<button class="delete-user" type="button" on:click={deleteUser}>
					Delete User
				</button>
			{/if}
		</div>

		<hr />

		<h2>Attached Files</h2>
		{#if attachments.length === 0}
			<p class="muted">No files have been attached to this user.</p>
		{:else}
			<ul class="attachment-list">
				{#each attachments as file (file.id)}
					<li class="attachment-row">
						<a
							class="attachment-link"
							href={`/api/users/${user.id}/attachments/${file.id}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{file.fileName}
						</a>
						{#if data.canManageUsers}
							<button
								class="attachment-remove"
								type="button"
								on:click={() => removeAttachment(file.id)}
							>
								Remove
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		{#if data.canManageUsers}
			<label class="file-upload-btn">
				Add File
				<input type="file" on:change={uploadAttachment} hidden />
			</label>
		{/if}

		<hr />

		<h2>Assigned SOPs</h2>

		{#if loadingSopAssignments}
			<p class="muted">Loading SOP assignments...</p>
		{:else if sopAssignments.length === 0}
			<p class="muted">No SOPs assigned to this user.</p>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>SOP #</th>
							<th>Revision Date</th>
							<th>Status</th>
							<th>Completed At</th>
						</tr>
					</thead>
					<tbody>
						{#each sopAssignments as assignment}
							<tr>
								<td>{assignment.sopTitle}</td>
								<td>{assignment.sopNumber}</td>
								<td>{assignment.revisionDate}</td>
								<td>{assignment.status === 'completed' ? 'Completed' : 'Pending'}</td>
								<td>
									{assignment.completedAt
										? new Date(assignment.completedAt).toLocaleString()
										: '—'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

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

					<div class="table-wrap">
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

	.table-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
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

	.reset-password {
		grid-column: span 2;
		padding: 10px;
		background: #fef3c7;
		color: #92400e;
		border-radius: 8px;
		border: 1px solid #fcd34d;
		font-weight: 600;
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

	.attachment-list {
		list-style: none;
		margin: 0 0 12px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.attachment-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.attachment-link {
		display: inline-block;
		padding: 6px 10px;
		background: #003670;
		color: white;
		border-radius: 4px;
		font-size: 13px;
		text-decoration: none;
	}

	.attachment-remove {
		background: none;
		border: none;
		color: #991b1b;
		font-size: 13px;
		cursor: pointer;
		padding: 0;
	}

	.file-upload-btn {
		display: inline-block;
		padding: 6px 10px;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		color: #374151;
	}

	.file-upload-btn:hover {
		background: #e5e7eb;
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
		min-width: 520px;
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

	@media (max-width: 960px) {
		.user-details {
			max-width: 100%;
			margin: 8px auto;
		}

		.form-section {
			grid-template-columns: 1fr;
			gap: 8px;
		}

		.save-btn,
		.delete-user {
			grid-column: 1;
			width: 100%;
		}

		.checklist-card {
			padding: 14px;
		}

		.checklist-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 6px;
		}
	}

</style>
