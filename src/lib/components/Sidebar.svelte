<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RosterModal from '$lib/components/RosterModal.svelte';

	let rosterOpen = false;
	let legacyOpen = false;
</script>

<aside class="sidebar">
	<!-- Top -->
	<nav class="nav-section">
		<img src="/NewHopeLogo.png" alt="NHFD Logo" class="logo" />

		<a href="/users" class:selected={$page.url.pathname.startsWith('/users')}>
			User Management
		</a>

		<a href="/dashboard" class:selected={$page.url.pathname.startsWith('/dashboard')}>
			Dashboard
		</a>

		<button class="sidebar-btn" on:click={() => (rosterOpen = true)}>
			Print Roster
		</button>

		<!-- Legacy Apps -->
		<button class="sidebar-btn" on:click={() => (legacyOpen = !legacyOpen)}>
			Legacy Apps ▾
		</button>

		{#if legacyOpen}
			<div class="legacy-links">
				<a href="/NHFD_Admin.html" target="_blank">Admin</a>
				<a href="/NHFD_Training.html" target="_blank">Training</a>
				<a href="/NHFD_Roster.html" target="_blank">Roster</a>
			</div>
		{/if}
	</nav>

	<!-- Bottom -->
	<div class="sidebar-footer">
		<button class="sidebar-btn" on:click={() => goto('/invite/create')}>
			Invite User
		</button>

		<form method="POST" action="/logout">
			<button type="submit" class="sidebar-btn">
				Logout
			</button>
		</form>
	</div>
</aside>

{#if rosterOpen}
	<RosterModal on:close={() => (rosterOpen = false)} />
{/if}

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 220px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(18px);
		border-right: 1px solid #e5e7eb;
		padding: 16px;
		box-sizing: border-box;
	}

	.logo {
		width: 100%;
		margin-bottom: 12px;
	}

	.nav-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.sidebar-footer {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	a,
	.sidebar-btn {
		all: unset;
		display: block;
		padding: 8px;
		border-radius: 6px;
		background: #fafafa;
		border: 1px solid #d0d0d0;
		font-size: 14px;
		cursor: pointer;
		color: #111;
	}

	a:hover,
	.sidebar-btn:hover {
		background: #f0f0f0;
	}

	a.selected {
		background: #111827;
		color: white;
		font-weight: 600;
	}

	.legacy-links {
		margin-left: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
