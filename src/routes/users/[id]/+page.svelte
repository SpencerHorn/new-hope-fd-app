<script lang="ts">
	export let data;
	let user = structuredClone(data.user);

	async function save() {
		const res = await fetch(`/api/users/${user.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user)
		});

		if (res.ok) {
			alert('Saved!');
		} else {
			alert('Error saving user');
		}
	}
</script>

<main class="user-details">

	<h1>Edit User</h1>

	<div class="form-section">

		<label>First Name</label>
		<input bind:value={user.firstName} />

		<label>Last Name</label>
		<input bind:value={user.lastName} />

		<label>Personal Email</label>
		<input type="email" bind:value={user.personalEmail} />

		<label>Phone</label>
		<input bind:value={user.phone} />

		<label>Work Email</label>
		<input type="email" bind:value={user.workEmail} />

		<label>T-shirt Size</label>
		<select bind:value={user.tshirtSize}>
			<option value="">Select</option>
			<option>S</option>
			<option>M</option>
			<option>L</option>
			<option>XL</option>
			<option>2XL</option>
			<option>3XL</option>
		</select>

		<label>Mask Size</label>
		<select bind:value={user.maskSize}>
			<option value="">Select</option>
			<option>Small</option>
			<option>Medium</option>
			<option>Large</option>
		</select>

		<label>Fit Test Date</label>
		<input type="date" bind:value={user.fitTestDate} />

		<button class="save-btn" on:click={save}>
			Save Changes
		</button>
	</div>

	<hr />

	<h2>Onboarding Checklist</h2>
	<p><i>Placeholder checklist — full version coming soon.</i></p>

	<ul class="checklist">
		<li>Completed Application</li>
		<li>Background Check</li>
		<li>Orientation Scheduled</li>
		<li>PPE Assigned</li>
		<li>Ride-along Completed</li>
	</ul>

</main>

<style>
	.user-details {
		max-width: 700px;
		margin: 20px auto;
	}

	.form-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px 20px;
	}

	label {
		font-weight: bold;
	}

	input, select {
		padding: 6px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.save-btn {
		grid-column: span 2;
		padding: 10px;
		background: #003670;
		color: white;
		border-radius: 4px;
		border: none;
		cursor: pointer;
	}

	.save-btn:hover {
		background: #004a9e;
	}
</style>
