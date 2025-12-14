<script>
	let email = '';
	let password = '';
	export let form;
</script>

<div class="login-wrapper">
	<div class="login-card">
		<img src="/NewHopeLogo.png" alt="NHFD Logo" class="login-logo" />

		<h2>Member Login</h2>

		<form method="POST">
			<input type="email" name="email" bind:value={email} placeholder="Email" required />

			<input
				type="password"
				name="password"
				bind:value={password}
				placeholder="Password"
				required
			/>

			<button type="submit">Sign In</button>

			{#if form?.message}
				<p class="login-error">{form.message}</p>
			{/if}
		</form>
	</div>
</div>

<style>
	/* Center layout */
	.login-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: #f5f5f7;
		padding: 1rem;
	}

	/* Card */
	.login-card {
		width: 100%;
		max-width: 380px;
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(18px);
		border-radius: 20px;
		padding: 2.5rem 2rem;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
		text-align: center;
		border: 1px solid rgba(200, 200, 200, 0.4);
	}

	.login-logo {
		width: 300px;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1.4rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}

	/* Inputs */
	input {
		width: 80%;
		padding: 0.8rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 10px;
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.9);
		margin-bottom: 1rem;
		outline: none;
		transition: all 0.15s ease;
	}

	input:focus {
		border-color: #0a84ff;
		box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
	}

	/* Button */
	button {
		width: 50%;
		padding: 0.8rem 1rem;
		background: #0a84ff;
		color: white;
		font-size: 1rem;
		border-radius: 12px;
		border: none;
		cursor: pointer;
		font-weight: 600;
		margin-top: 0.5rem;
		transition: background 0.15s ease;
	}

	button:hover {
		background: #006edc;
	}

	/* Error message */
	.login-error {
		margin-top: 1rem;
		color: #dc2626;
		font-size: 0.95rem;
		font-weight: 600;
	}
</style>
