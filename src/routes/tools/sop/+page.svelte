<script lang="ts">
	import { onMount } from 'svelte';

	export let data: { isAdmin: boolean; documentId: string };

	let mode: 'all' | 'group' | 'users' = 'all';
	let savedDocuments: any[] = [];
	let selectedDocumentId = '';
	let loadingDocuments = false;
	let users: any[] = [];
	let selectedUserIds: number[] = [];
	let loadingUsers = false;
	let showAssignModal = false;
	let saving = false;
	let errorMessage = '';
	let successMessage = '';
	$: {
		const params = new URLSearchParams();
		if (data.documentId) {
			params.set('documentId', data.documentId);
		}
		params.set('canAssign', data.isAdmin ? '1' : '0');
		iframeSrc = `/tools/NHFD_SOP.html?${params.toString()}`;
	}
	let iframeSrc = '/tools/NHFD_SOP.html';

	let roles = {
		probationary: false,
		volunteer: false,
		employee: false,
		administrator: false
	};

	async function refreshSavedDocuments() {
		loadingDocuments = true;
		const docsRes = await fetch('/api/sops/documents');
		savedDocuments = docsRes.ok ? await docsRes.json() : [];
		loadingDocuments = false;

		if (savedDocuments.length === 0) {
			selectedDocumentId = '';
			return;
		}

		const selectedExists = savedDocuments.some((document) => document.id === selectedDocumentId);
		if (!selectedExists) {
			selectedDocumentId =
				savedDocuments.find((document) => document.id === data.documentId)?.id ??
				savedDocuments[0].id;
		}
	}

	async function openAssignModal() {
		errorMessage = '';
		successMessage = '';
		showAssignModal = true;
		await refreshSavedDocuments();
	}

	onMount(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== window.location.origin) {
				return;
			}

			if (!data.isAdmin || event.data?.type !== 'open-assign-sop-modal') {
				return;
			}

			void openAssignModal();
		};

		window.addEventListener('message', handleMessage);

		const loadAdminData = async () => {
			if (data.isAdmin) {
				loadingUsers = true;
				loadingDocuments = true;

				const usersRes = await fetch('/api/users');
				users = usersRes.ok ? await usersRes.json() : [];
				loadingUsers = false;

				await refreshSavedDocuments();
			}
		};

		void loadAdminData();

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	});

	async function assignSop() {
		errorMessage = '';
		successMessage = '';

		if (!selectedDocumentId) {
			errorMessage = 'Please select a saved SOP document.';
			return;
		}

		const payload: any = {
			sopDocumentId: selectedDocumentId
		};

		if (mode === 'all') {
			payload.assignTo = { type: 'all' };
		}

		if (mode === 'group') {
			payload.assignTo = {
				type: 'group',
				roles: Object.entries(roles)
					.filter(([, checked]) => checked)
					.map(([role]) => role)
			};
		}

		if (mode === 'users') {
			payload.assignTo = { type: 'users', userIds: selectedUserIds };
		}

		saving = true;
		const res = await fetch('/api/sops/assign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		saving = false;

		const body = await res.json().catch(() => ({}));
		if (!res.ok) {
			errorMessage = body.error ?? 'Failed to assign SOP.';
			return;
		}

		successMessage = `Assigned SOP to ${body.assignedCount ?? 0} user(s).`;
		showAssignModal = false;
		selectedUserIds = [];
		roles = {
			probationary: false,
			volunteer: false,
			employee: false,
			administrator: false
		};
	}

	function toggleSelectedUser(userId: number, checked: boolean) {
		selectedUserIds = checked
			? [...selectedUserIds, userId]
			: selectedUserIds.filter((id) => id !== userId);
	}
</script>

<div class="sop-page-layout">
	<div class="sheet-wrap">
		<iframe
			title="NHFD SOP Writer"
			src={iframeSrc}
			class="sheet"
		></iframe>
	</div>

	{#if showAssignModal}
		<button
			type="button"
			class="modal-backdrop"
			aria-label="Close assign SOP modal"
			on:click={() => (showAssignModal = false)}
		></button>

		<div class="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assign-sop-title">
			<div class="assignment-card">
				<div class="modal-header">
					<h2 id="assign-sop-title">Assign SOP</h2>
					<button class="close-btn" on:click={() => (showAssignModal = false)}>Close</button>
				</div>
				<p class="muted">
					Select a saved SOP, then assign it to all users, by role, or to selected users.
				</p>

				<div class="field-grid">
					<label>
						Saved SOP
						<select bind:value={selectedDocumentId} disabled={loadingDocuments || savedDocuments.length === 0}>
							{#if loadingDocuments}
								<option value="">Loading saved SOPs...</option>
							{:else if savedDocuments.length === 0}
								<option value="">No saved SOPs found</option>
							{:else}
								{#each savedDocuments as document}
									<option value={document.id}>
										{document.name} - {document.sopNumber} ({document.revisionDate})
									</option>
								{/each}
							{/if}
						</select>
					</label>
				</div>

				<div class="assignment-mode">
					<label class="choice"><input type="radio" bind:group={mode} value="all" /> Assign to all users</label>
					<label class="choice"><input type="radio" bind:group={mode} value="group" /> Assign by role</label>
					{#if mode === 'group'}
						<div class="group-options">
							<label class="choice"><input type="checkbox" bind:checked={roles.probationary} /> Probationary</label>
							<label class="choice"><input type="checkbox" bind:checked={roles.volunteer} /> Volunteer</label>
							<label class="choice"><input type="checkbox" bind:checked={roles.employee} /> Employee</label>
							<label class="choice"><input type="checkbox" bind:checked={roles.administrator} /> Administrator</label>
						</div>
					{/if}
					<label class="choice"><input type="radio" bind:group={mode} value="users" /> Assign to selected users</label>
					{#if mode === 'users'}
						{#if loadingUsers}
							<p class="muted">Loading users...</p>
						{:else}
							<div class="user-list">
								{#each users as user}
									<label class="choice">
										<input
											type="checkbox"
											checked={selectedUserIds.includes(user.id)}
											on:change={(event) =>
												toggleSelectedUser(user.id, (event.target as HTMLInputElement).checked)}
										/>
										{user.lastName}, {user.firstName} ({user.role})
									</label>
								{/each}
							</div>
						{/if}
					{/if}
				</div>

				<div class="actions">
					<button class="assign-btn" on:click={assignSop} disabled={saving}>
						{saving ? 'Assigning...' : 'Assign SOP'}
					</button>
					{#if successMessage}<p class="success">{successMessage}</p>{/if}
					{#if errorMessage}<p class="error">{errorMessage}</p>{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.sop-page-layout {
		max-width: 1180px;
		margin: 0 auto;
		padding: 0 6px;
	}

	.assignment-card {
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 14px;
		padding: 16px;
		margin-bottom: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
	}

	h2 {
		margin: 0 0 6px;
	}

	.muted {
		margin: 0 0 14px;
		color: #4b5563;
	}

	.field-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 10px;
		margin-bottom: 12px;
	}

	.field-grid label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 14px;
		font-weight: 600;
		min-width: 0;
	}

	.choice {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.3;
	}

	.assignment-mode {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.choice input[type='radio'],
	.choice input[type='checkbox'] {
		width: auto;
		flex: 0 0 auto;
		margin: 0;
	}

	.group-options,
	.user-list {
		margin-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.user-list {
		max-height: 180px;
		overflow-y: auto;
		border: 1px solid #d1d5db;
		border-radius: 10px;
		padding: 10px;
	}

	.field-grid select {
		width: 100%;
		min-width: 0;
		padding: 8px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font: inherit;
	}

	@media (min-width: 760px) {
		.field-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1120px) {
		.field-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 14px;
	}

	.assign-btn {
		padding: 10px 14px;
		background: #003670;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
	}

	.assign-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.success,
	.error {
		margin: 0;
		font-size: 14px;
	}

	.success {
		color: #166534;
	}

	.error {
		color: #b91c1c;
	}

	.sheet-wrap {
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
	}

	.sheet {
		width: 100%;
		height: clamp(760px, 82vh, 1040px);
		border: 0;
		background: #fff;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.38);
		border: 0;
		z-index: 40;
	}

	.assignment-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(740px, 94vw);
		max-height: 86vh;
		overflow-y: auto;
		z-index: 50;
	}

	.assignment-modal .assignment-card {
		margin: 0;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.close-btn {
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: #f8fafc;
		color: #111827;
		font-weight: 600;
		cursor: pointer;
	}

	@media (max-width: 900px) {
		.group-options,
		.user-list {
			margin-left: 0;
		}

		.assignment-modal {
			width: calc(100vw - 16px);
			max-height: 92vh;
		}

		.sheet {
			height: calc(100vh - 110px);
		}
	}
</style>
