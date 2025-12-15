<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { printChecklist } from '$lib/utils/printChecklist';

	export let checklists: any[] = [];

	const dispatch = createEventDispatcher();

	async function toggleItem(item: any) {
		const newCompleted = !item.completed;

		// optimistic UI update
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
			item.completed = !newCompleted;
			item.dateCompleted = newCompleted ? null : item.dateCompleted;
			alert('Failed to update checklist item');
		}
	}
</script>

<div class="backdrop" on:click={() => dispatch('close')} />

<div class="modal">
	<header class="modal-header">
		<h2>User Checklists</h2>

		<button class="close" on:click={() => dispatch('close')}>✕</button>
	</header>

	{#if checklists.length === 0}
		<p class="empty">No checklists assigned.</p>
	{:else}
		{#each checklists as checklist}
			<section class="checklist">
				<div class="checklist-header">
					<h3>{checklist.name}</h3>

					<button
						class="print-btn"
						on:click={() =>
							printChecklist({
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
			</section>
		{/each}
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
		width: min(900px, 92vw);
		max-height: 85vh;
		overflow-y: auto;
		background: white;
		border-radius: 20px;
		padding: 24px;
		z-index: 50;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.close {
		all: unset;
		font-size: 20px;
		cursor: pointer;
		padding: 6px 10px;
		border-radius: 10px;
	}

	.close:hover {
		background: #f3f4f6;
	}

	.empty {
		color: #6b7280;
		text-align: center;
		padding: 32px;
	}

	.checklist {
		margin-bottom: 32px;
	}

	.checklist-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
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

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 12px 10px;
		border-bottom: 1px solid #e5e7eb;
	}

	tr.completed td {
		opacity: 0.6;
		text-decoration: line-through;
	}
</style>
