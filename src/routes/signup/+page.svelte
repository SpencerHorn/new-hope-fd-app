<script lang="ts">
	export let form;

	let firstName = form?.values?.firstName ?? '';
	let lastName = form?.values?.lastName ?? '';
	let email = form?.values?.email ?? '';
	let phone = form?.values?.phone ?? '';
	let password = form?.values?.password ?? '';
	let confirm = form?.values?.confirm ?? '';
</script>

<div class="signup-wrapper">
	<div class="signup-card">
		<img src="/NewHopeLogo.png" alt="NHFD Logo" class="signup-logo" />
		<h2>Create Member Account</h2>

		<form method="POST">
			<input name="firstName" bind:value={firstName} placeholder="First name" required />
			<input name="lastName" bind:value={lastName} placeholder="Last name" required />
			<input type="email" name="email" bind:value={email} placeholder="Email" required />
			<input name="phone" bind:value={phone} placeholder="Phone" required />
			<input
				type="password"
				name="password"
				bind:value={password}
				placeholder="Password"
				autocomplete="new-password"
				required
			/>
			<input
				type="password"
				name="confirm"
				bind:value={confirm}
				placeholder="Confirm password"
				autocomplete="new-password"
				required
			/>

			<button type="submit">Sign Up</button>

			{#if form?.message}
				<p class="signup-error">{form.message}</p>
			{/if}
		</form>

		<p class="switch-auth">
			Already have an account?
			<a href="/login">Sign in</a>
		</p>
	</div>
</div>

<style>
	.signup-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #f5f5f7;
		padding: 1rem;
	}

	.signup-card {
		width: 100%;
		max-width: 420px;
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(18px);
		border-radius: 20px;
		padding: 2rem;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
		text-align: center;
		border: 1px solid rgba(200, 200, 200, 0.4);
	}

	.signup-logo {
		width: 240px;
		margin-bottom: 0.5rem;
	}

	h2 {
		font-size: 1.4rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	form {
		display: grid;
		gap: 0.8rem;
	}

	input {
		width: 100%;
		padding: 0.8rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 10px;
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.9);
		outline: none;
		transition: all 0.15s ease;
		box-sizing: border-box;
	}

	input:focus {
		border-color: #0a84ff;
		box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
	}

	button {
		padding: 0.8rem 1rem;
		background: #0a84ff;
		color: white;
		font-size: 1rem;
		border-radius: 12px;
		border: none;
		cursor: pointer;
		font-weight: 600;
		margin-top: 0.25rem;
	}

	button:hover {
		background: #006edc;
	}

	.signup-error {
		margin: 0.2rem 0 0;
		color: #dc2626;
		font-size: 0.95rem;
		font-weight: 600;
	}

	.switch-auth {
		margin-top: 1rem;
		font-size: 0.95rem;
		color: #4b5563;
	}

	.switch-auth a {
		color: #0a84ff;
		font-weight: 600;
		text-decoration: none;
	}

	.switch-auth a:hover {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.signup-card {
			padding: 1.25rem;
			border-radius: 14px;
		}

		.signup-logo {
			width: min(72vw, 210px);
		}

		h2 {
			font-size: 1.2rem;
		}
	}
</style>
