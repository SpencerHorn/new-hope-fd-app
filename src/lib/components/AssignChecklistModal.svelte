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

	async function assign() {
		let payload: any = {
			checklistId
		};

		if (mode === 'all') {
			payload.assignTo = { type: 'all' };
		}

		if (mode === 'group') {
			payload.assignTo = {
				type: 'group',
				roles: Object.entries(roles)
					.filter(([, v]) => v)
					.map(([k]) => k)
			};
		}

		if (mode === 'users') {
			payload.assignTo = {
				type: 'users',
				userIds: selectedUserIds
			};
		}

		const res = await fetch('/api/checklists/assign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			alert('Failed to assign checklist');
			return;
		}

		dispatch('close');
	}
</script>

<div class="backdrop" on:click={() => dispatch('close')} />

<div class="modal">
	<header>
		<h2>Assign Checklist</h2>
		<p class="subtitle">{checklistName}</p>
		<button class="close" on:click={() => dispatch('close')}>✕</button>
	</header>

	<div class="section">
		<label>
			<input type="radio" bind:group={mode} value="all" />
			Assign to all users
		</label>

		<label>
			<input type="radio" bind:group={mode} value="group" />
			Assign by role
		</label>

		{#if mode === 'group'}
			<div class="group-options">
				<label><input type="checkbox" bind:checked={roles.probationary} /> Probationary</label>
				<label><input type="checkbox" bind:checked={roles.volunteer} /> Volunteer</label>
				<label><input type="checkbox" bind:checked={roles.employee} /> Employee</label>
			</div>
		{/if}

		<label>
			<input type="radio" bind:group={mode} value="users" />
			Assign to individual users
		</label>

		{#if mode === 'users'}
			{#if loadingUsers}
				<p class="muted">Loading users…</p>
			{:else}
				<div class="user-list">
					{#each users as u}
						<label>
							<input
								type="checkbox"
								value={u.id}
								on:change={(e) => {
									const id = u.id;
									if ((e.target as HTMLInputElement).checked) {
										selectedUserIds = [...selectedUserIds, id];
									} else {
										selectedUserIds = selectedUserIds.filter((x) => x !== id);
									}
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
		<button class="secondary" on:click={() => dispatch('close')}>
			Cancel
		</button>
		<button class="primary" on:click={assign}>
			Assign Checklist
		</button>
	</div>
</div>

<style>
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
		max-height: 85vh;
		overflow-y: auto;
		background: white;
		border-radius: 20px;
		padding: 24px;
		z-index: 50;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
	}

	header {
		margin-bottom: 16px;
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

	.primary {
		background: #111827;
		color: white;
		border: none;
		border-radius: 14px;
		padding: 12px 20px;
		cursor: pointer;
	}

	.secondary {
		background: #f3f4f6;
		border-radius: 14px;
		border: 1px solid #d1d5db;
		padding: 12px 20px;
		cursor: pointer;
	}

	.muted {
		color: #6b7280;
		font-size: 14px;
	}
</style>
