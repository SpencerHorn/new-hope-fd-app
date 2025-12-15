<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let checklistId: string;
	export let checklistName: string;

	const dispatch = createEventDispatcher();

	let mode: 'all' | 'group' | 'users' = 'all';

	let roles = {
		probationary: false,
		volunteer: false,
		employee: false
	};

	let users: any[] = [];
	let selectedUserIds: number[] = [];
	let loadingUsers = false;

	onMount(async () => {
		loadingUsers = true;
		const res = await fetch('/api/users');
		users = await res.json();
		loadingUsers = false;
	});

	async function unassign() {
		let payload: any = { checklistId };

		if (mode === 'all') {
			payload.unassignFrom = { type: 'all' };
		}

		if (mode === 'group') {
			payload.unassignFrom = {
				type: 'group',
				roles: Object.entries(roles)
					.filter(([, v]) => v)
					.map(([k]) => k)
			};
		}

		if (mode === 'users') {
			payload.unassignFrom = {
				type: 'users',
				userIds: selectedUserIds
			};
		}

		const ok = confirm(
			'This will remove this checklist from the selected users.\n\nContinue?'
		);
		if (!ok) return;

		const res = await fetch('/api/checklists/unassign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			alert('Failed to unassign checklist');
			return;
		}

		dispatch('close');
	}
</script>

<div class="backdrop" on:click={() => dispatch('close')} />

<div class="modal">
	<header>
		<h2>Unassign Checklist</h2>
		<p class="subtitle">{checklistName}</p>
		<button class="close" on:click={() => dispatch('close')}>✕</button>
	</header>

	<div class="section">
		<label><input type="radio" bind:group={mode} value="all" /> Unassign from all users</label>

		<label><input type="radio" bind:group={mode} value="group" /> Unassign by role</label>

		{#if mode === 'group'}
			<div class="group-options">
				<label><input type="checkbox" bind:checked={roles.probationary} /> Probationary</label>
				<label><input type="checkbox" bind:checked={roles.volunteer} /> Volunteer</label>
				<label><input type="checkbox" bind:checked={roles.employee} /> Employee</label>
			</div>
		{/if}

		<label><input type="radio" bind:group={mode} value="users" /> Unassign individual users</label>

		{#if mode === 'users'}
			{#if loadingUsers}
				<p class="muted">Loading users…</p>
			{:else}
				<div class="user-list">
					{#each users as u}
						<label>
							<input
								type="checkbox"
								on:change={(e) => {
									const checked = (e.target as HTMLInputElement).checked;
									selectedUserIds = checked
										? [...selectedUserIds, u.id]
										: selectedUserIds.filter((x) => x !== u.id);
								}}
							/>
							{u.lastName}, {u.firstName} ({u.role})
						</label>
					{/each}
				</div>
			{/if}
		{/if}
	</div>

	<div class="actions">
		<button class="secondary" on:click={() => dispatch('close')}>Cancel</button>
		<button class="danger" on:click={unassign}>Unassign</button>
	</div>
</div>

<style>
	/* matches Assign modal styling */
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		z-index: 40;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(560px, 92vw);
		background: white;
		border-radius: 20px;
		padding: 24px;
		z-index: 50;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
	}

	.subtitle {
		color: #6b7280;
		font-size: 14px;
	}

	.close {
		position: absolute;
		top: 16px;
		right: 16px;
		all: unset;
		cursor: pointer;
		font-size: 18px;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.group-options,
	.user-list {
		margin-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.user-list {
		max-height: 180px;
		overflow-y: auto;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 10px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}

	.secondary {
		background: #f3f4f6;
		border-radius: 14px;
		border: 1px solid #d1d5db;
		padding: 12px 20px;
		cursor: pointer;
	}

	.danger {
		background: #fee2e2;
		color: #991b1b;
		border-radius: 14px;
		border: 1px solid #fca5a5;
		padding: 12px 20px;
		cursor: pointer;
		font-weight: 600;
	}
</style>
