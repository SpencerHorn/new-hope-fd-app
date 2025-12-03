<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import "../lib/styles/landing.css";

	// Form fields for Add User (global state)
	let firstName = '';
	let lastName = '';
	let personalEmail = '';
	let phone = '';
	let errorMessage = '';

	// Formatting functions
	function normalizePhone(raw: string): string | null {
		const digits = raw.replace(/\D/g, '');
		if (digits.length !== 10) return null;
		return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
	}

	function formatName(name: string): string {
		if (!name) return name;
		return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
	}

	// Add user + Redirect to detail page
	async function addUser(e: Event) {
		e.preventDefault();
		errorMessage = '';

		const normalizedPhone = normalizePhone(phone);
		if (!normalizedPhone) {
			errorMessage = 'Phone number must have exactly 10 digits.';
			return;
		}

		const formattedFirst = formatName(firstName);
		const formattedLast = formatName(lastName);

		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName: formattedFirst,
				lastName: formattedLast,
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

		// Reset form
		firstName = '';
		lastName = '';
		personalEmail = '';
		phone = '';

		// Redirect to user page
		goto(`/users/${created.id}`);
	}

	import { searchResults, searchActive } from '$lib/stores/userSearch';

	async function searchUsers() {
		const values = [firstName, lastName, personalEmail, phone]
			.map(v => v.trim())
			.filter(v => v.length > 0);

		if (values.length === 0) {
			errorMessage = "Enter something to search.";
			return;
		}

		// Combine all fields into one query string
		const q = values.join(" ");

		const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);

		if (res.ok) {
			searchResults.set(await res.json());
			searchActive.set(true);
			goto('/');
		}
	}


</script>

<header class="nh-global-header">
	<div class="nh-header-inner">
		<img src="/NewHopeLogo.png" class="nh-logo" />

		<div class="nh-header-center">
			<form class="nh-inline-form" on:submit={addUser}>
				<input bind:value={firstName} placeholder="First name" required />
				<input bind:value={lastName} placeholder="Last name" required />
				<input bind:value={personalEmail} type="email" placeholder="Personal email" required />
				<input bind:value={phone} placeholder="Phone" required />
				<button class="nh-btn-add">Add</button>
				<button class="nh-btn-search" type="button" on:click={searchUsers}>Search</button>
			</form>
		</div>

		{#if $page.url.pathname.startsWith('/users/')}
			<a class="nh-back-link" href="javascript:history.back()">← Back</a>
		{/if}
	</div>
</header>

{#if errorMessage}
	<p class="nh-error">{errorMessage}</p>
{/if}

<slot />
