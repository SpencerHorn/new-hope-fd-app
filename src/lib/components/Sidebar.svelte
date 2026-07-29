<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { canViewChecklists, isAdministrator } from '$lib/auth/roles';

	export let appRole = 'probationary';
	let toolsOpen = false;
	$: canManageRoles = isAdministrator(appRole);
	$: canSeeChecklists = canViewChecklists(appRole);
</script>

<aside class="sidebar">
	<!-- TOP -->
	<div class="sidebar-top">
		<img src="/NewHopeLogo.png" alt="NHFD Logo" class="logo" />

		<nav class="nav">
			<button
				class:selected={$page.url.pathname.startsWith('/dashboard')}
				on:click={() => goto('/dashboard')}
			>
				Dashboard
			</button>

			<button
				class:selected={$page.url.pathname.startsWith('/tools')}
				on:click={() => {
					if ($page.url.pathname.startsWith('/tools')) {
						toolsOpen = !toolsOpen;
						return;
					}

					toolsOpen = true;
					goto('/tools');
				}}
			>
				Tools ▸
			</button>

			{#if toolsOpen || $page.url.pathname.startsWith('/tools')}
				<div class="legacy">
					<button class="subnav" on:click={() => goto('/tools/training')}>Training</button>
					<button class="subnav" on:click={() => goto('/tools/roster')}>Roster</button>
				</div>
			{/if}

			<button
				class:selected={$page.url.pathname.startsWith('/users')}
				on:click={() => goto('/users')}
			>
				User Management
			</button>

			{#if canSeeChecklists}
				<button
					class:selected={$page.url.pathname.startsWith('/checklists')}
					on:click={() => goto('/checklists')}
				>
					Checklists
				</button>
			{/if}

		</nav>
	</div>

	<!-- BOTTOM (STICKY) -->
	<div class="sidebar-bottom">
		{#if canManageRoles}
			<button on:click={() => goto('/invite/create')}>
				Invite User
			</button>
		{/if}

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
		overflow-y: auto;
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

	.subnav {
		font-size: 14px;
		padding: 8px 10px;
		background: #eef2ff;
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
