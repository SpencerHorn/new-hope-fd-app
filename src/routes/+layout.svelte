<script lang="ts">
	// SvelteKit now passes `data` into the layout:
	export let data;

	import { goto } from '$app/navigation';

	// Global CSS
	import '../lib/styles/landing.css';

	// Search store imports
	import { searchResults, searchActive } from '$lib/stores/userSearch';

	// -----------------------------
	// Global state for Add User form
	// -----------------------------
	let firstName = '';
	let lastName = '';
	let personalEmail = '';
	let phone = '';
	let errorMessage = '';

	// -----------------------------
	// Formatting helpers
	// -----------------------------
	function normalizePhone(raw: string): string | null {
		const digits = raw.replace(/\D/g, '');
		return digits.length === 10
			? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
			: null;
	}

	function formatName(name: string): string {
		return name ? name[0].toUpperCase() + name.slice(1).toLowerCase() : '';
	}

	// -----------------------------
	// Add User → Redirect to profile page
	// -----------------------------
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
			const data = await res.json().catch(() => ({}));
			errorMessage = data.message || 'Error adding user';
			return;
		}

		const created = await res.json();

		// Reset
		firstName = '';
		lastName = '';
		personalEmail = '';
		phone = '';

		goto(`/users/${created.id}`);
	}

	// -----------------------------
	// Search users
	// -----------------------------
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

<!-- Hide header entirely on the login page -->
{#if !data.url.pathname.startsWith('/login')}
	<header class="nh-global-header">
		<div class="nh-header-inner">
			<img src="/NewHopeLogo.png" class="nh-logo" alt="NHFD Logo" />

			<!-- Center ADD + SEARCH -->
			<div class="nh-header-center">
				<form class="nh-inline-form" on:submit={addUser}>
					<input bind:value={firstName} placeholder="First name" required />
					<input bind:value={lastName} placeholder="Last name" required />
					<input bind:value={personalEmail} type="email" placeholder="Personal email" required />
					<input bind:value={phone} placeholder="Phone" required />

					<button class="nh-btn-add" type="submit">Add</button>
					<button class="nh-btn-search" type="button" on:click={searchUsers}>Search</button>
				</form>
			</div>

			<!-- Right side: Invite + Logout -->
			<div class="nh-header-right">
				{#if data.user}
					<!-- Invite User -->
					<button class="nh-btn-invite" on:click={() => goto('/invite/create')}>
						Invite User
					</button>

					<!-- Logout -->
					<form method="POST" action="/logout">
						<button class="logout">Logout</button>
					</form>
				{/if}

				<!-- Back button on user pages -->
				{#if data.url.pathname.startsWith('/users/')}
					<button class="nh-back-link" on:click={() => history.back()}> ← Back </button>
				{/if}
			</div>
		</div>
	</header>
{/if}

{#if errorMessage}
	<p class="nh-error">{errorMessage}</p>
{/if}

<slot />
