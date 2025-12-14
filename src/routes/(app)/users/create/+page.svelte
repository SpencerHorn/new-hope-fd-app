<script lang="ts">
	import { goto } from '$app/navigation';

	let firstName = '';
	let lastName = '';
	let phone = '';
	let personalEmail = '';
	let role = 'probationary';

	async function submit() {
		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName,
				lastName,
				phone,
				personalEmail,
				role
			})
		});

		if (res.ok) {
			goto('/users');
		} else {
			alert('Failed to create user');
		}
	}
</script>

<section class="create-user">
	<h1>Add User</h1>

	<form on:submit|preventDefault={submit}>
		<input placeholder="First name" bind:value={firstName} required />
		<input placeholder="Last name" bind:value={lastName} required />
		<input placeholder="Phone" bind:value={phone} />
		<input placeholder="Personal email" bind:value={personalEmail} />
		<select bind:value={role}>
			<option value="probationary">Probationary</option>
			<option value="volunteer">Volunteer</option>
			<option value="employee">Employee</option>
		</select>

		<button type="submit">Create</button>
	</form>
</section>

<style>
	.create-user {
		max-width: 600px;
	}

	form {
		display: grid;
		gap: 12px;
	}

	input, select, button {
		padding: 12px;
		font-size: 16px;
	}
</style>
