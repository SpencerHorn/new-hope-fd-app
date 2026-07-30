<script lang="ts">
	import { onMount } from 'svelte';

	export let data;
	type ValidationErrors = {
		firstName?: string;
		lastName?: string;
		personalEmail?: string;
		phone?: string;
		workEmail?: string;
	};

	let user = data.user ? structuredClone(data.user) : null;
	let checklists: any[] = [];
	let loadingChecklists = true;
	let sopAssignments: any[] = [];
	let loadingSopAssignments = true;
	let saveMessage = '';
	let saveError = '';
	let errors: ValidationErrors = {};
	let mustChangePassword = Boolean(data.mustChangePassword);
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let passwordMessage = '';
	let passwordError = '';

	function isValidEmail(value: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	function isValidPhone(value: string): boolean {
		const digits = value.replace(/\D/g, '');
		return digits.length === 10;
	}

	function clearFieldError(field: keyof ValidationErrors) {
		if (errors[field]) {
			errors = { ...errors, [field]: undefined };
		}
	}

	function validateProfile(): boolean {
		if (!user) return false;

		const nextErrors: ValidationErrors = {};

		if (!String(user.firstName ?? '').trim()) {
			nextErrors.firstName = 'Please enter your first name.';
		}

		if (!String(user.lastName ?? '').trim()) {
			nextErrors.lastName = 'Please enter your last name.';
		}

		const personalEmail = String(user.personalEmail ?? '').trim();
		if (!personalEmail) {
			nextErrors.personalEmail = 'Please enter your personal email.';
		} else if (!isValidEmail(personalEmail)) {
			nextErrors.personalEmail = 'Enter a valid email address, like name@example.com.';
		}

		const phone = String(user.phone ?? '').trim();
		if (!phone) {
			nextErrors.phone = 'Please enter your phone number.';
		} else if (!isValidPhone(phone)) {
			nextErrors.phone = 'Use a 10-digit phone number.';
		}

		const workEmail = String(user.workEmail ?? '').trim();
		if (workEmail && !isValidEmail(workEmail)) {
			nextErrors.workEmail = 'Work email must be a valid address.';
		}

		errors = nextErrors;
		return Object.keys(nextErrors).length === 0;
	}

	async function saveProfile() {
		if (!user) return;

		saveMessage = '';
		saveError = '';

		if (!validateProfile()) {
			saveError = 'Please fix the highlighted fields and try again.';
			return;
		}

		const res = await fetch(`/api/users/${user.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user)
		});

		if (res.ok) {
			saveMessage = 'Profile updated.';
			saveError = '';
			return;
		}

		saveError = 'Failed to update profile.';
	}

	async function updatePassword() {
		passwordMessage = '';
		passwordError = '';

		if (!currentPassword || !newPassword || !confirmPassword) {
			passwordError = 'Please complete all password fields.';
			return;
		}

		if (newPassword.length < 10) {
			passwordError = 'New password must be at least 10 characters.';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'New password and confirmation do not match.';
			return;
		}

		const res = await fetch('/api/account/password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				currentPassword,
				newPassword,
				confirmPassword
			})
		});

		const body = await res.json().catch(() => ({}));
		if (!res.ok) {
			passwordError = body.error ?? 'Unable to update password.';
			return;
		}

		passwordMessage = body.message ?? 'Password updated successfully.';
		mustChangePassword = false;
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}

	async function loadAssignedChecklists() {
		if (!user) {
			loadingChecklists = false;
			return;
		}

		const res = await fetch(`/api/users/${user.id}/checklists`);
		checklists = res.ok ? await res.json() : [];
		loadingChecklists = false;
	}

	async function loadAssignedSops() {
		if (!user) {
			loadingSopAssignments = false;
			return;
		}

		const res = await fetch(`/api/users/${user.id}/sops`);
		sopAssignments = res.ok ? await res.json() : [];
		loadingSopAssignments = false;
	}

	async function openSopAssignment(assignment: any) {
		const res = await fetch('/api/sops/assigned/open', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userSopAssignmentId: assignment.userSopAssignmentId })
		});

		if (!res.ok) {
			alert('Unable to open SOP assignment.');
			return;
		}

		const body = await res.json().catch(() => ({}));
		if (body.completedAt) {
			assignment.completedAt = body.completedAt;
			assignment.status = 'completed';
		}

		const documentPath = assignment.sopDocumentId
			? `/tools/sop?documentId=${encodeURIComponent(assignment.sopDocumentId)}`
			: '/tools/sop';
		window.location.assign(documentPath);
	}

	async function toggleItem(item: any) {
		const nextCompleted = !item.completed;
		const previousDateCompleted = item.dateCompleted;

		item.completed = nextCompleted;
		item.dateCompleted = nextCompleted ? new Date().toISOString() : null;

		const res = await fetch('/api/checklists/items/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userChecklistItemId: item.userChecklistItemId,
				completed: nextCompleted
			})
		});

		if (!res.ok) {
			item.completed = !nextCompleted;
			item.dateCompleted = previousDateCompleted;
			alert('Failed to update checklist item');
		}
	}

	onMount(() => {
		loadAssignedChecklists();
		loadAssignedSops();
	});
</script>

<main class="dashboard">
	{#if !user}
		<section class="card">
			<h1>Dashboard</h1>
			<p class="muted">{data.error ?? 'Unable to load your profile.'}</p>
		</section>
	{/if}

	<section class="card">
		<div class="card-header">
			<div>
				<h2>Security</h2>
				<p class="muted">Update your password to keep your account secure.</p>
			</div>
		</div>

		{#if mustChangePassword}
			<p class="notice warning">
				You must change your temporary password before using the rest of the application.
			</p>
		{/if}

		<div class="form-grid">
			<div class="field-row">
				<label for="currentPassword">Current Password</label>
				<input id="currentPassword" type="password" bind:value={currentPassword} />
			</div>

			<div class="field-row">
				<label for="newPassword">New Password</label>
				<input id="newPassword" type="password" bind:value={newPassword} />
			</div>

			<div class="field-row">
				<label for="confirmPassword">Confirm New Password</label>
				<input id="confirmPassword" type="password" bind:value={confirmPassword} />
			</div>
		</div>

		<div class="actions">
			<button class="save-btn" type="button" on:click={updatePassword}>Update Password</button>
			{#if passwordMessage}<p class="status success">{passwordMessage}</p>{/if}
			{#if passwordError}<p class="status error">{passwordError}</p>{/if}
		</div>
	</section>

	{#if user}
		<section class="card">
			<div class="card-header">
				<div>
					<h1>My Dashboard</h1>
					<p class="muted">Update your profile and track your assigned checklist items.</p>
				</div>
				<span class="role-chip">{user.role}</span>
			</div>

			<div class="form-grid">
				<div class="field-row">
					<label for="firstName">First Name</label>
					<div>
						<input
							id="firstName"
							bind:value={user.firstName}
							on:input={() => clearFieldError('firstName')}
							aria-invalid={errors.firstName ? 'true' : 'false'}
						/>
						{#if errors.firstName}<p class="field-error">{errors.firstName}</p>{/if}
					</div>
				</div>

				<div class="field-row">
					<label for="lastName">Last Name</label>
					<div>
						<input
							id="lastName"
							bind:value={user.lastName}
							on:input={() => clearFieldError('lastName')}
							aria-invalid={errors.lastName ? 'true' : 'false'}
						/>
						{#if errors.lastName}<p class="field-error">{errors.lastName}</p>{/if}
					</div>
				</div>

				<div class="field-row">
					<label for="address">Address</label>
					<input id="address" bind:value={user.address} placeholder="123 Main St" />
				</div>

				<div class="field-row">
					<label for="personalEmail">Personal Email</label>
					<div>
						<input
							id="personalEmail"
							type="email"
							bind:value={user.personalEmail}
							on:input={() => clearFieldError('personalEmail')}
							aria-invalid={errors.personalEmail ? 'true' : 'false'}
						/>
						{#if errors.personalEmail}<p class="field-error">{errors.personalEmail}</p>{/if}
					</div>
				</div>

				<div class="field-row">
					<label for="phone">Phone</label>
					<div>
						<input
							id="phone"
							bind:value={user.phone}
							on:input={() => clearFieldError('phone')}
							aria-invalid={errors.phone ? 'true' : 'false'}
						/>
						{#if errors.phone}<p class="field-error">{errors.phone}</p>{/if}
					</div>
				</div>

				<div class="field-row">
					<label for="workEmail">Work Email</label>
					<div>
						<input
							id="workEmail"
							type="email"
							bind:value={user.workEmail}
							on:input={() => clearFieldError('workEmail')}
							aria-invalid={errors.workEmail ? 'true' : 'false'}
						/>
						{#if errors.workEmail}<p class="field-error">{errors.workEmail}</p>{/if}
					</div>
				</div>

				<div class="field-row">
					<label for="tshirtSize">T-shirt Size</label>
					<select id="tshirtSize" bind:value={user.tshirtSize}>
						<option value="">Select</option>
						<option>S</option>
						<option>M</option>
						<option>L</option>
						<option>XL</option>
						<option>2XL</option>
						<option>3XL</option>
					</select>
				</div>

				<div class="field-row">
					<label for="maskSize">Mask Size</label>
					<select id="maskSize" bind:value={user.maskSize}>
						<option value="">Select</option>
						<option>Small</option>
						<option>Medium</option>
						<option>Large</option>
					</select>
				</div>

				<div class="field-row">
					<label for="fitTestDate">Fit Test Date</label>
					<input id="fitTestDate" type="date" bind:value={user.fitTestDate} />
				</div>
			</div>

			<div class="actions">
				<button class="save-btn" type="button" on:click={saveProfile}>Save Profile</button>
				{#if saveMessage}<p class="status success">{saveMessage}</p>{/if}
				{#if saveError}<p class="status error">{saveError}</p>{/if}
			</div>
		</section>

		<section class="card">
			<h2>Assigned SOPs</h2>
			{#if loadingSopAssignments}
				<p class="muted">Loading SOP assignments...</p>
			{:else if sopAssignments.length === 0}
				<p class="muted">No SOPs are currently assigned to you.</p>
			{:else}
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>SOP #</th>
								<th>Revision Date</th>
								<th>Status</th>
								<th>Completed At</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each sopAssignments as assignment}
								<tr>
									<td>{assignment.sopTitle}</td>
									<td>{assignment.sopNumber}</td>
									<td>{assignment.revisionDate}</td>
									<td>
										{assignment.status === 'completed' ? 'Completed' : 'Pending'}
									</td>
									<td>
										{assignment.completedAt
											? new Date(assignment.completedAt).toLocaleString()
											: '-'}
									</td>
									<td>
										<button class="open-sop-btn" on:click={() => openSopAssignment(assignment)}>
											Open SOP
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>

		<section class="card">
			<h2>Assigned Checklist Items</h2>
			{#if loadingChecklists}
				<p class="muted">Loading checklists...</p>
			{:else if checklists.length === 0}
				<p class="muted">No checklists are currently assigned to you.</p>
			{:else}
				{#each checklists as checklist}
					<div class="checklist-card">
						<div class="checklist-header">
							<h3>{checklist.name}</h3>
							<p class="muted">
								{checklist.items.filter((item: any) => item.completed).length}/{checklist.items.length}
								completed
							</p>
						</div>

						<div class="table-wrap">
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
													: '-'}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/each}
			{/if}
		</section>
	{/if}
</main>

<style>
	.dashboard {
		display: grid;
		gap: 18px;
		max-width: 1160px;
		margin: 0 auto;
		width: 100%;
	}

	.card {
		background: white;
		border-radius: 14px;
		padding: 18px;
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 10px;
		margin-bottom: 14px;
	}

	h1,
	h2,
	h3 {
		margin: 0;
	}

	.muted {
		margin: 4px 0 0;
		color: #6b7280;
	}

	.notice {
		margin: 0 0 12px;
		padding: 10px 12px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 500;
	}

	.notice.warning {
		background: #fff7ed;
		border: 1px solid #fdba74;
		color: #9a3412;
	}

	.role-chip {
		background: #eef2ff;
		color: #3730a3;
		border-radius: 999px;
		padding: 6px 10px;
		font-size: 12px;
		font-weight: 600;
		text-transform: capitalize;
	}

	.form-grid {
		display: grid;
		gap: 12px;
	}

	.field-row {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 14px;
		align-items: start;
	}

	label {
		font-weight: 600;
		font-size: 13px;
	}

	input,
	select {
		width: 100%;
		padding: 8px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font: inherit;
		box-sizing: border-box;
	}

	input[aria-invalid='true'] {
		border-color: #dc2626;
		background: #fef2f2;
	}

	.field-error {
		margin: 6px 2px 0;
		font-size: 13px;
		color: #b91c1c;
	}

	.actions {
		margin-top: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.save-btn {
		padding: 10px 14px;
		background: #003670;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
	}

	.open-sop-btn {
		padding: 6px 10px;
		background: #111827;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
	}

	.status {
		margin: 0;
		font-size: 14px;
	}

	.status.success {
		color: #166534;
	}

	.status.error {
		color: #b91c1c;
	}

	.checklist-card {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 12px;
		margin-top: 12px;
	}

	.checklist-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.table-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
		min-width: 480px;
	}

	th,
	td {
		padding: 10px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
	}

	tr.completed td {
		opacity: 0.6;
	}

	@media (max-width: 900px) {
		.field-row {
			grid-template-columns: 1fr;
			gap: 6px;
		}

		.card-header {
			flex-direction: column;
		}
	}
</style>
