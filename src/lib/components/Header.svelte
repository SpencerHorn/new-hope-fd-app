<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { searchResults, searchActive } from '$lib/stores/userSearch';

	export let user: any = null;

	// Form state
	let firstName = '';
	let lastName = '';
	let personalEmail = '';
	let phone = '';
	let errorMessage = '';

	// Derived reactive values
	$: pathname = $page.url.pathname;
	$: onLoginPage = pathname.startsWith('/login');
	$: onUserPage = pathname.startsWith('/users/');

	function normalizePhone(raw: string): string | null {
		const digits = raw.replace(/\D/g, '');
		return digits.length === 10
			? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
			: null;
	}

	function formatName(name: string): string {
		return name ? name[0].toUpperCase() + name.slice(1).toLowerCase() : '';
	}

	// Add User
	async function addUser(e: Event) {
		e.preventDefault();
		errorMessage = '';

		const normalizedPhone = normalizePhone(phone);
		if (!normalizedPhone) {
			errorMessage = 'Phone number must have exactly 10 digits.';
			return;
		}

		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName: formatName(firstName),
				lastName: formatName(lastName),
				personalEmail,
				phone: normalizedPhone
			})
		});

		if (!res.ok) {
			errorMessage = (await res.json().catch(() => ({}))).message || 'Error adding user';
			return;
		}

		const created = await res.json();

		firstName = lastName = personalEmail = phone = '';

		goto(`/users/${created.id}`);
	}

	// Search Users
	async function searchUsers() {
		const values = [firstName, lastName, personalEmail, phone].map((v) => v.trim()).filter(Boolean);

		if (values.length === 0) {
			errorMessage = 'Enter something to search.';
			return;
		}

		const q = values.join(' ');
		const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);

		if (res.ok) {
			searchResults.set(await res.json());
			searchActive.set(true);
			goto('/');
		}
	}
</script>

{#if !onLoginPage}
	<header class="app-header">
		<div class="header-left">
			<img src="/NewHopeLogo.png" alt="NHFD Logo" class="logo" />
		</div>

		<div class="header-center">
			<form class="search-form" on:submit={addUser}>
				<input bind:value={firstName} placeholder="First name" required />
				<input bind:value={lastName} placeholder="Last name" required />
				<input bind:value={personalEmail} type="email" placeholder="Personal email" required />
				<input bind:value={phone} placeholder="Phone" required />

				<button type="submit" class="btn-primary">Add</button>
				<button type="button" class="btn-primary" on:click={searchUsers}>Search</button>
			</form>
		</div>

		<div class="header-right">
			{#if onUserPage}
				<button class="btn-back" on:click={() => history.back()}> ← Back </button>
			{/if}
		</div>
	</header>
{/if}

{#if errorMessage}
	<p class="header-error">{errorMessage}</p>
{/if}

<style>
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0;
		margin: 0;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(18px);
		border-bottom: 1px solid rgba(148, 163, 184, 0.35);
	}

	.logo {
		justify-content: right;
		height: 75px;
	}

	.header-center {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.search-form {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.search-form input {
		padding: 6px 8px;
		border-radius: 5px;
		border: 1px solid #ccc;
		min-width: 140px;
		font-size: 0.9rem;
	}

	.btn-primary {
		background: #e5e5e7;
		border: 1px solid #cfd0d3;
		padding: 6px 12px;
		border-radius: 5px;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-primary:hover {
		background: #d8d8db;
	}

	.btn-back {
		background: transparent;
		padding-right: 20px;
		border: none;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		color: #003670;
	}

	.btn-back:hover {
		text-decoration: underline;
	}

	.header-error {
		color: red;
		padding-left: 24px;
		font-weight: 600;
	}
</style>
