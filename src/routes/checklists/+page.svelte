<script lang="ts">
	import { onMount } from 'svelte';
	import CreateChecklistModal from '$lib/components/CreateChecklistModal.svelte';
	import AssignChecklistModal from '$lib/components/AssignChecklistModal.svelte';
	import UnassignChecklistModal from '$lib/components/UnassignChecklistModal.svelte';
	import EditChecklistModal from '$lib/components/EditChecklistModal.svelte';
    import AssignedUsersModal from '$lib/components/AssignedUsersModal.svelte';


	let showAssignModal = false;
	let showUnassignModal = false;
    let showAssignedModal = false;
	let selectedChecklist: any = null;
	let showCreateModal = false;
	let showEditModal = false;
	let editChecklistId: string | null = null;
	let checklists: any[] = [];
	let loading = true;

	async function loadChecklists() {
		loading = true;
		const res = await fetch('/api/checklists');
		checklists = await res.json();
		loading = false;
	}

	onMount(loadChecklists);

	function openAssign(checklist: any) {
		selectedChecklist = checklist;
		showAssignModal = true;
	}

	function openUnassign(checklist: any) {
		selectedChecklist = checklist;
		showUnassignModal = true;
	}

	function openEdit(checklist: any) {
		editChecklistId = checklist.id;
		showEditModal = true;
	}

	async function deleteChecklist(checklist: any) {
		const ok = confirm(
			`Delete "${checklist.name}"?\n\nThis will remove it from all assigned users. This cannot be undone.`
		);
		if (!ok) return;

		const res = await fetch(`/api/checklists/${checklist.id}`, { method: 'DELETE' });
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(err.error ?? 'Failed to delete checklist');
			return;
		}

		await loadChecklists();
	}
</script>

<section class="card">
	<div class="header">
		<h1>Checklists</h1>

		<button class="primary" on:click={() => (showCreateModal = true)}>
			+ Create Checklist
		</button>
	</div>

	<p class="muted">Checklist templates can be assigned to users or groups.</p>

	{#if loading}
		<p class="muted">Loading checklists…</p>
	{:else if checklists.length === 0}
		<p class="muted">No checklists created yet.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Items</th>
					<th>Assigned</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each checklists as checklist}
					<tr>
						<td>{checklist.name}</td>
						<td>{checklist.itemCount}</td>
						<td>
                            <button
                                class="link"
                                on:click={() => {
                                    selectedChecklist = checklist;
                                    showAssignedModal = true;
                                }}
                            >
                                {checklist.assignedCount ?? 0}
                            </button>
                        </td>
						<td class="actions">
							<button class="link" on:click={() => openAssign(checklist)}>
								Assign
							</button>
							<button class="link danger" on:click={() => openUnassign(checklist)}>
								Unassign
							</button>
							<button class="link" on:click={() => openEdit(checklist)}>
								Edit
							</button>
							<button class="danger" on:click={() => deleteChecklist(checklist)}>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>

{#if showCreateModal}
	<CreateChecklistModal
		on:close={() => {
			showCreateModal = false;
			loadChecklists();
		}}
	/>
{/if}

{#if showEditModal && editChecklistId}
	<EditChecklistModal
		checklistId={editChecklistId}
		on:close={() => {
			showEditModal = false;
			editChecklistId = null;
			loadChecklists();
		}}
	/>
{/if}

{#if showAssignModal}
	<AssignChecklistModal
		checklistId={selectedChecklist.id}
		checklistName={selectedChecklist.name}
		on:close={() => (showAssignModal = false)}
	/>
{/if}

{#if showUnassignModal}
	<UnassignChecklistModal
		checklistId={selectedChecklist.id}
		checklistName={selectedChecklist.name}
		on:close={() => {
			showUnassignModal = false;
			loadChecklists();
		}}
	/>
{/if}

{#if showAssignedModal}
	<AssignedUsersModal
		checklistId={selectedChecklist.id}
		checklistName={selectedChecklist.name}
		on:close={() => {
			showAssignedModal = false;
			loadChecklists();
		}}
	/>
{/if}


<style>
	.card {
		background: white;
		border-radius: 18px;
		padding: 24px;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.primary {
		background: #111827;
		color: white;
		border: none;
		border-radius: 14px;
		padding: 12px 20px;
		font-size: 15px;
		cursor: pointer;
	}

	.muted {
		color: #6b7280;
		font-size: 14px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 16px;
	}

	th,
	td {
		padding: 14px 10px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
	}

	th {
		font-size: 13px;
		color: #6b7280;
		font-weight: 600;
	}

	td.actions {
		white-space: nowrap;
	}

	.link {
		background: none;
		border: none;
		color: #2563eb;
		cursor: pointer;
		font-weight: 500;
		margin-right: 10px;
	}

	.danger {
		background: none;
		border: none;
		color: #dc2626;
		cursor: pointer;
		font-weight: 600;
	}
</style>
