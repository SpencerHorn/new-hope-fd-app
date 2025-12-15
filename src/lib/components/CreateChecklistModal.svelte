<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let step = 1;

	// Step 1
	let checklistName = '';

	// Step 2
	let items: { id: number; name: string }[] = [
		{ id: Date.now(), name: '' }
	];

	function addItem() {
		items = [...items, { id: Date.now(), name: '' }];
	}

	function removeItem(id: number) {
		items = items.filter((i) => i.id !== id);
	}

	async function saveChecklist() {
		const payload = {
			name: checklistName.trim(),
			items: items
				.map((i, index) => ({
					itemNumber: index + 1,
					taskName: i.name.trim()
				}))
				.filter((i) => i.taskName)
		};

		const res = await fetch('/api/checklists/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			const err = await res.json();
			alert(err.error ?? 'Failed to create checklist');
			return;
		}

		dispatch('close');
	}
</script>

<div class="backdrop" on:click={() => dispatch('close')} />

<div class="modal">
	<header>
		<h2>Create Checklist</h2>
		<button class="close" on:click={() => dispatch('close')}>✕</button>
	</header>

	{#if step === 1}
		<label>
			Checklist name
			<input
				placeholder="e.g. Probationary Onboarding"
				bind:value={checklistName}
			/>
		</label>

		<div class="actions">
			<button
				class="primary"
				disabled={!checklistName.trim()}
				on:click={() => (step = 2)}
			>
				Next
			</button>
		</div>
	{:else}
		<h3>Checklist Items</h3>

		{#each items as item, index}
			<div class="item-row">
				<span class="num">{index + 1}</span>
				<input placeholder="Task description" bind:value={item.name} />
				<button class="remove" on:click={() => removeItem(item.id)}>✕</button>
			</div>
		{/each}

		<button class="link" on:click={addItem}>+ Add item</button>

		<div class="actions">
			<button class="secondary" on:click={() => (step = 1)}>
				Back
			</button>
			<button
				class="primary"
				on:click={saveChecklist}
				disabled={items.every((i) => !i.name.trim())}
			>
				Create Checklist
			</button>
		</div>
	{/if}
</div>

<style>
	/* same styling as before — unchanged */
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
		width: min(1080px, 95vw);
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
