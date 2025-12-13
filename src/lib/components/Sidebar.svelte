<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let legacyOpen = false;
</script>

<aside class="sidebar">
	<!-- TOP -->
	<div class="sidebar-top">
		<img src="/NewHopeLogo.png" alt="NHFD Logo" class="logo" />

		<nav class="nav">
			<button
				class:selected={$page.url.pathname === '/'}
				on:click={() => goto('/')}
			>
				Dashboard
			</button>

			<button
				class:selected={$page.url.pathname.startsWith('/users')}
				on:click={() => goto('/users')}
			>
				User Management
			</button>

			<button on:click={() => (legacyOpen = !legacyOpen)}>
				Legacy Apps ▸
			</button>

			{#if legacyOpen}
				<div class="legacy">
					<a href="/NHFD_Admin.html" target="_blank">Admin</a>
					<a href="/NHFD_Training.html" target="_blank">Training</a>
					<a href="/NHFD_Roster.html" target="_blank">Roster</a>
				</div>
			{/if}
		</nav>
	</div>

	<!-- BOTTOM (STICKY) -->
	<div class="sidebar-bottom">
		<button on:click={() => goto('/invite/create')}>
			Invite User
		</button>

		<form method="POST" action="/logout">
			<button class="logout">Logout</button>
		</form>
	</div>
</aside>

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
		backdrop-filter: blur(20px);
		border-right: 1px solid #e5e7eb;

		padding: 16px;
		box-sizing: border-box;
	}

	.sidebar-top {
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto; /* 👈 allows scrolling if needed */
	}

	.logo {
		width: 160px;
		margin: 0 auto 8px auto;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	button {
		all: unset;
		padding: 10px 14px;
		border-radius: 12px;
		background: #f5f5f7;
		cursor: pointer;
		font-weight: 500;
	}

	button.selected {
		background: #111827;
		color: white;
	}

	.legacy {
		margin-left: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.legacy a {
		font-size: 14px;
		text-decoration: none;
		color: #374151;
	}

	.sidebar-bottom {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 12px;
		border-top: 1px solid #e5e7eb;
	}

	.logout {
		background: #fee2e2;
		color: #991b1b;
	}
</style>
