<script lang="ts">
	import { onMount } from 'svelte';
	import { searchResults, searchActive } from '$lib/stores/userSearch';
	import { get } from 'svelte/store';


	type Role = 'probationary' | 'volunteer' | 'employee';

	type User = {
		id: number;
		firstName: string;
		lastName: string;
		personalEmail: string;
		phone: string;
		role: Role;
	};

	let firstName = '';
	let lastName = '';
	let personalEmail = '';
	let phone = '';
	let errorMessage = '';

	let users: User[] = [];

	// Sorting + filtering
	let sortField: 'none' | 'lastName' | 'role' = 'none';
	let roleFilter: 'all' | Role = 'all';

	// Modal
	let showModal = false;
	let modalUserId: number | null = null;

	function openDeleteModal(id: number) {
		modalUserId = id;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		modalUserId = null;
	}

	// Normalize phone to XXX-XXX-XXXX
	function normalizePhone(raw: string): string | null {
		const digits = raw.replace(/\D/g, '');
		if (digits.length !== 10) return null;
		return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
	}

	async function loadUsers() {
		const res = await fetch('/api/users');
		if (res.ok) users = await res.json();
	}

	onMount(async () => {
		if (get(searchActive)) {
			users = get(searchResults);
		} else {
			await loadUsers();
		}
	});


	// Filter then sort
	$: filteredUsers = users.filter((u) => {
		if (roleFilter === 'all') return true;
		return u.role === roleFilter;
	});

	$: sortedUsers = [...filteredUsers].sort((a, b) => {
		if (sortField === 'lastName') return a.lastName.localeCompare(b.lastName);
		if (sortField === 'role') {
			const rc = a.role.localeCompare(b.role);
			return rc !== 0 ? rc : a.lastName.localeCompare(b.lastName);
		}
		return 0;
	});

	function formatName(name: string): string {
		if (!name) return name;
		return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
	}

	async function changeRole(id: number, newRole: Role) {
		// Optimistic update (update UI immediately)
		users = users.map((u) => (u.id === id ? { ...u, role: newRole } : u));

		// Persist to backend
		const res = await fetch(`/api/users/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: newRole })
		});

		if (!res.ok) {
			// If backend fails, reload from server to avoid stale UI
			await loadUsers();
		}
	}

	async function confirmDelete() {
		if (modalUserId === null) return;

		await fetch(`/api/users/${modalUserId}`, {
			method: 'DELETE'
		});

		closeModal();
		await loadUsers();
	}
</script>

<main>
	{#if errorMessage}
		<p class="nh-error">{errorMessage}</p>
	{/if}

	<div class="nh-controls">
	<!-- Filter -->
	<div class="nh-controls-item">
		<label>
			Filter:
			<select class="nh-sort-select" bind:value={roleFilter}>
				<option value="all">All</option>
				<option value="probationary">Probationary</option>
				<option value="volunteer">Volunteer</option>
				<option value="employee">Employee</option>
			</select>
		</label>
	</div>

	<!-- Clear Search (center) -->
	<div class="nh-controls-item nh-controls-center">
		{#if $searchActive}
			<button class="nh-clear-btn" on:click={() => { searchActive.set(false); loadUsers(); }}>
				Clear Search
			</button>
		{/if}
	</div>

	<!-- Sort -->
	<div class="nh-controls-item">
		<label>
			Sort by:
			<select class="nh-sort-select" bind:value={sortField}>
				<option value="none">None</option>
				<option value="lastName">Last name</option>
				<option value="role">Role</option>
			</select>
		</label>
	</div>
	</div>


	{#if $searchActive}
		<button on:click={() => { searchActive.set(false); loadUsers(); }}>
			Clear Search
		</button>
	{/if}

	<table class="nh-table">
		<thead>
			<tr>
				<th>#</th>
				<th>Last</th>
				<th>First</th>
				<th>Email</th>
				<th>Phone</th>
				<th>Role</th>
				<th>Delete</th>
			</tr>
		</thead>
		<tbody>
			{#each sortedUsers as u, i}
				<tr class={`nh-row-${u.role}`}>
					<td>{i + 1}</td>
					<td><a class="nh-user-link" href={`/users/${u.id}`}>{u.lastName}</a></td>
					<td><a class="nh-user-link" href={`/users/${u.id}`}>{u.firstName}</a></td>
					<td>{u.personalEmail}</td>
					<td>{u.phone}</td>
					<td>
						<select
							class="nh-role-select"
							bind:value={u.role}
							on:change={(e) => changeRole(u.id, (e.currentTarget as HTMLSelectElement).value as Role)}
						>
							<option value="probationary">Probationary</option>
							<option value="volunteer">Volunteer</option>
							<option value="employee">Employee</option>
						</select>
					</td>
					<td>
						  <span
    						class="nh-delete-btn"
    						on:click={() => openDeleteModal(u.id)}
  						>
    						X
  						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if showModal}
		<div class="modal-overlay">
			<div class="modal-box">
				<h3>Confirm Delete</h3>
				<p>Are you sure you want to delete this user?</p>
				<div class="modal-actions">
					<button class="modal-cancel" on:click={closeModal}>Cancel</button>
					<button class="modal-confirm" on:click={confirmDelete}>Delete</button>
				</div>
			</div>
		</div>
	{/if}
</main>
