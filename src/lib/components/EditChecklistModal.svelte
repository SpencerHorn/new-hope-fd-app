<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let checklistId: string;

	const dispatch = createEventDispatcher();

	let step = 1;
	let loading = true;

	let checklistName = '';
	let items: { id?: string; localId: number; name: string }[] = [{ localId: Date.now(), name: '' }];

	function addItem() {
		items = [...items, { localId: Date.now(), name: '' }];
	}

	function removeItem(localId: number) {
		items = items.filter((i) => i.localId !== localId);
	}

	onMount(async () => {
		const res = await fetch(`/api/checklists/${checklistId}`);
		const data = await res.json();

		checklistName = data.name ?? '';
		items =
			(data.items ?? []).map((it: any) => ({
				id: it.id,
				localId: Date.now() + Math.floor(Math.random() * 100000),
				name: it.taskName
			})) || [{ localId: Date.now(), name: '' }];

		if (items.length === 0) items = [{ localId: Date.now(), name: '' }];

		loading = false;
	});

	async function saveChecklist() {
		const payload = {
			name: checklistName.trim(),
			items: items
				.map((i, index) => ({
					id: i.id, // preserve when present
					itemNumber: index + 1,
					taskName: i.name.trim()
				}))
				.filter((i) => i.taskName)
		};

		const res = await fetch(`/api/checklists/${checklistId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			const err = await res.json();
			alert(err.error ?? 'Failed to update checklist');
			return;
		}

		dispatch('close');
	}
</script>

<div class="backdrop" on:click={() => dispatch('close')} />

<div class="modal">
	<header>
		<h2>Edit Checklist</h2>
		<button class="close" on:click={() => dispatch('close')}>✕</button>
	</header>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else}
		{#if step === 1}
			<label>
				Checklist name
				<input placeholder="Checklist name" bind:value={checklistName} />
			</label>

			<div class="actions">
				<button class="primary" disabled={!checklistName.trim()} on:click={() => (step = 2)}>
					Next
				</button>
			</div>
		{:else}
			<h3>Checklist Items</h3>

			{#each items as item, index}
				<div class="item-row">
					<span class="num">{index + 1}</span>
					<input placeholder="Task description" bind:value={item.name} />
					<button class="remove" on:click={() => removeItem(item.localId)}>✕</button>
				</div>
			{/each}

			<button class="link" on:click={addItem}>+ Add item</button>

			<div class="actions">
				<button class="secondary" on:click={() => (step = 1)}>Back</button>
				<button class="primary" on:click={saveChecklist} disabled={items.every((i) => !i.name.trim())}>
					Save Changes
				</button>
			</div>
		{/if}
	{/if}
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
		width: min(1080px, 92vw);
		background: white;
		border-radius: 20px;
		padding: 24px;
		z-index: 50;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.muted {
		color: #6b7280;
		font-size: 14px;
	}

	input {
		width: 75%;
		padding: 12px 14px;
		border-radius: 12px;
		border: 1px solid #d1d5db;
		margin-top: 6px;
	}

	.item-row {
		display: grid;
		grid-template-columns: 32px 1fr 32px;
		gap: 8px;
		align-items: center;
		margin-bottom: 10px;
	}

	.num {
		font-weight: 600;
		text-align: center;
	}

	.remove {
		background: none;
		border: none;
		color: #dc2626;
		cursor: pointer;
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

	.link {
		background: none;
		border: none;
		color: #2563eb;
		cursor: pointer;
		margin-top: 8px;
	}

	.close {
		all: unset;
		cursor: pointer;
		font-size: 18px;
	}
</style>
