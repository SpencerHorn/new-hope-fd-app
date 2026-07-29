<script lang="ts">
	export let data;

	const formatDeletedAt = (value: string | null | undefined) => {
		if (!value) return 'Unknown';
		return new Date(value).toLocaleString();
	};
</script>

<section class="card">
	<div class="top-row">
		<a class="back-link" href="/users">Back to User Management</a>
		<h1>Deleted Users</h1>
	</div>

	{#if !data.canManageDeletedUsers}
		<p class="muted">Only administrators can access this page.</p>
	{:else if data.users.length === 0}
		<p class="muted">No soft-deleted users found.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Phone</th>
						<th>Email</th>
						<th>Deleted</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user}
						<tr>
							<td>{user.lastName}, {user.firstName}</td>
							<td>{user.phone}</td>
							<td>{user.personalEmail}</td>
							<td>{formatDeletedAt(user.deletedAt)}</td>
							<td class="actions-cell">
								<form method="POST" action="?/restore">
									<input type="hidden" name="userId" value={user.id} />
									<button type="submit" class="restore-btn">Restore</button>
								</form>

								<form
									method="POST"
									action="?/purge"
									on:submit={(event) => {
										if (!confirm('Permanently delete this user and auth account?')) {
											event.preventDefault();
										}
									}}
								>
									<input type="hidden" name="userId" value={user.id} />
									<button type="submit" class="delete-btn">Delete Permanently</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<style>
	.card {
		background: white;
		border-radius: 18px;
		padding: 24px;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
	}

	.top-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.back-link {
		display: inline-block;
		width: fit-content;
		color: #1d4ed8;
		text-decoration: none;
		font-weight: 600;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 700px;
	}

	th,
	td {
		text-align: left;
		padding: 12px;
		border-bottom: 1px solid #e5e7eb;
	}

	.actions-cell {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	button {
		border: none;
		border-radius: 10px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}

	.restore-btn {
		background: #166534;
		color: white;
	}

	.delete-btn {
		background: #b91c1c;
		color: white;
	}

	.muted {
		color: #6b7280;
	}
</style>