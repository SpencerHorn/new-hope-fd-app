<script lang="ts">
	export let form;
</script>

<div class="login-container">
	<img src="/NewHopeLogo.png" alt="New Hope FD" class="logo" />

	<form method="POST" class="login-form">
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		<input type="email" name="email" placeholder="Email" required />
		<input type="password" name="password" placeholder="Password" required />

		<button type="submit">Login</button>
	</form>
</div>

<style>
	.login-container {
		max-width: 380px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 120px;
	}

	.logo {
		max-width: 180px;
		margin-bottom: 24px;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 12px;
	}

	button {
		padding: 10px;
		background: #b40606;
		color: white;
		border-radius: 4px;
		border: none;
		cursor: pointer;
	}
</style>
