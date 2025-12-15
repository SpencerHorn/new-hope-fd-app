<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let checklistId: string;
	export let checklistName: string;

	const dispatch = createEventDispatcher();

	let users: any[] = [];
	let loading = true;

	async function loadUsers() {
		loading = true;
		const res = await fetch(`/api/checklists/${checklistId}/assigned`);
		users = await res.json();
		loading = false;
	}

	async function unassignUser(userId: number) {
		const ok = confirm('Unassign this user from the checklist?');
		if (!ok) return;

		await fetch('/api/checklists/unassign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				checklistId,
				unassignFrom: {
					type: 'users',
					userIds: [userId]
				}
			})
		});

		users = users.filter((u) => u.id !== userId);
	}

	onMount(loadUsers);
</script>

<div class="backdrop" on:click={() => dispatch('close')} />

<div class="modal">
	<header>
		<h2>Assigned Users</h2>
		<p class="subtitle">{checklistName}</p>
		<button class="close" on:click={() => dispatch('close')}>✕</button>
	</header>

	{#if loading}
		<p class="muted">Loading users…</p>
	{:else if users.length === 0}
		<p class="muted">No users assigned.</p>
	{:else}
		<ul class="list">
			{#each users as u}
				<li>
					<span>{u.lastName}, {u.firstName}</span>
					<button class="remove" on:click={() => unassignUser(u.id)}>✕</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,.35);
		z-index: 40;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(420px, 92vw);
		background: white;
		border-radius: 20px;
		padding: 24px;
		z-index: 50;
		box-shadow: 0 30px 80px rgba(0,0,0,.25);
	}

	header {
		margin-bottom: 12px;
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

	.list {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
	}

	.remove {
		background: none;
		border: none;
		color: #dc2626;
		font-size: 18px;
		cursor: pointer;
	}

	.muted {
		color: #6b7280;
		font-size: 14px;
	}
</style>
