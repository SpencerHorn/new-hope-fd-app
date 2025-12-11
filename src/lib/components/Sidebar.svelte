<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RosterModal from '$lib/components/RosterModal.svelte';

	let rosterOpen = false;

	// Legacy Apps collapse state
	let legacyOpen = false;

	export let user: any;
</script>

<aside class="sidebar">
	<nav class="main-nav">
		<a href="/" class:selected={$page.url.pathname === '/'}>Home</a>

		<!-- Roster Modal Trigger -->
		<button class="sidebar-btn" on:click={() => (rosterOpen = true)}>Roster</button>

		<!-- Legacy Apps Toggle -->
		<button class="sidebar-btn" on:click={() => (legacyOpen = !legacyOpen)}>
			Legacy Apps {legacyOpen ? '▾' : '▸'}
		</button>

		<!-- Collapsible Legacy Links -->
		{#if legacyOpen}
			<a href="/NHFD_Admin.html" class="legacy-link">Admin</a>
			<a href="/NHFD_Training.html" class="legacy-link">Training</a>
			<a href="/NHFD_Roster.html" class="legacy-link">Roster</a>
		{/if}
	</nav>

	<!-- Bottom actions -->
	<div class="sidebar-actions">
		<button class="sidebar-btn" on:click={() => goto('/invite/create')}>Invite User</button>

		<form method="POST" action="/logout">
			<button type="submit" class="sidebar-btn">Logout</button>
		</form>
	</div>
</aside>

<!-- Modal mount -->
{#if rosterOpen}
	<RosterModal on:close={() => (rosterOpen = false)} />
{/if}

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		width: 100px;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(18px);
		border-right: 1px solid #e5e7eb;
		padding: 16px;
		min-height: 100vh;
	}

	.main-nav {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.main-nav a {
		display: block;
		width: 80%;
		padding: 6px 6px;
		border-radius: 5px;
		font-size: 15px;
		background: #fafafa;
		border: 1px solid #d0d0d0;
		color: #111;
		text-decoration: none;
		transition: background 0.15s ease;
	}

	.main-nav a:hover {
		background: #f0f0f0;
	}

	.main-nav a.selected {
		background: #eaeaea;
		font-weight: 600;
		border-color: #bdbdbd;
	}

	/* Bottom area */
	.sidebar-actions {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	/* Buttons (Roster, Legacy Apps, Invite, Logout) */
	.sidebar-btn {
		all: unset;
		display: block;
		width: 80%;
		padding: 6px 6px;
		border-radius: 5px;
		border: 1px solid #d0d0d0;
		background: #fafafa;
		font-size: 14px;
		cursor: pointer;
		color: #111;
		text-align: left;
		transition: background 0.15s ease;
	}

	.sidebar-btn:hover {
		background: #f0f0f0;
	}

	/* Style for collapsible links */
	.legacy-link {
		display: block;
		width: 75%;
		margin-left: 10px;
		padding: 5px 6px;
		border-radius: 5px;
		font-size: 13px;
		background: #f4f4f4;
		border: 1px solid #dcdcdc;
		color: #111;
		text-decoration: none;
	}

	.legacy-link:hover {
		background: #ececec;
	}

	form {
		margin: 0;
	}
</style>
