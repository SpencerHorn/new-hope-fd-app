<script lang="ts">
	export let data;
	export let form;
</script>

<div class="invite-container">
	<div class="invite-card">
		<h1>Create Your Account</h1>
		<p class="email">{data.email}</p>

		<form method="POST">
			<label>
				Password
				<input type="password" name="password" autocomplete="new-password" required />
			</label>

			<label>
				Confirm Password
				<input type="password" name="confirm" autocomplete="new-password" required />
			</label>

			<button type="submit">Create Account</button>
		</form>

		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
	</div>
</div>

<style>
	.invite-container {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: #f5f5f7;
	}

	.invite-card {
		width: min(100%, 420px);
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		padding: 1.25rem;
		box-shadow: 0 14px 30px rgba(17, 24, 39, 0.08);
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.4rem;
		color: #111827;
	}

	.email {
		margin: 0 0 1rem;
		color: #374151;
		font-weight: 600;
		word-break: break-word;
	}

	form {
		display: grid;
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.9rem;
		color: #374151;
	}

	input {
		padding: 0.7rem 0.8rem;
		border: 1px solid #d1d5db;
		border-radius: 10px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #0a84ff;
		box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.2);
	}

	button {
		margin-top: 0.35rem;
		padding: 0.75rem;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		color: #fff;
		background: #0a84ff;
		cursor: pointer;
	}

	button:hover {
		background: #006edc;
	}

	.error {
		margin: 0.8rem 0 0;
		color: #b91c1c;
		font-weight: 600;
	}
</style>
