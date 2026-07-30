<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { canViewChecklists, isAdministrator } from '$lib/auth/roles';

	export let appRole = 'probationary';
	let toolsOpen = false;
	export let mobileOpen = false;

	const dispatch = createEventDispatcher();
	$: canManageRoles = isAdministrator(appRole);
	$: canSeeChecklists = canViewChecklists(appRole);

	function navigate(path: string) {
		goto(path);
		dispatch('close');
	}
</script>

<aside class="sidebar" class:mobile-open={mobileOpen}>
	<!-- TOP -->
	<div class="sidebar-top">
		<button
			type="button"
			class="mobile-close"
			aria-label="Close navigation"
			on:click={() => dispatch('close')}
		>
			Close
		</button>

		<img src="/NewHopeLogo.png" alt="NHFD Logo" class="logo" />

		<nav class="nav">
			<button
				class:selected={$page.url.pathname.startsWith('/dashboard')}
				on:click={() => navigate('/dashboard')}
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
					navigate('/tools');
				}}
			>
				Tools ▸
			</button>

			{#if toolsOpen || $page.url.pathname.startsWith('/tools')}
				<div class="legacy">
					<button class="subnav" on:click={() => navigate('/tools/training')}>Training</button>
					<button class="subnav" on:click={() => navigate('/tools/roster')}>Roster</button>
					<button class="subnav" on:click={() => navigate('/tools/sop')}>SOP Writer</button>
				</div>
			{/if}

			<button
				class:selected={$page.url.pathname.startsWith('/users')}
				on:click={() => navigate('/users')}
			>
				User Management
			</button>

			{#if canSeeChecklists}
				<button
					class:selected={$page.url.pathname.startsWith('/checklists')}
					on:click={() => navigate('/checklists')}
				>
					Checklists
				</button>
			{/if}

		</nav>
	</div>

	<!-- BOTTOM (STICKY) -->
	<div class="sidebar-bottom">
		{#if canManageRoles}
			<button on:click={() => navigate('/invite/create')}>
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

	.mobile-close {
		display: none;
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

	@media (max-width: 960px) {
		.sidebar {
			width: min(320px, 84vw);
			height: 100dvh;
			z-index: 100;
			background: rgba(255, 255, 255, 0.98);
			transform: translateX(-110%);
			transition: transform 0.2s ease;
		}

		.sidebar.mobile-open {
			transform: translateX(0);
		}

		.mobile-close {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			align-self: flex-end;
			padding: 6px 10px;
			border-radius: 8px;
			background: #e5e7eb;
			font-size: 13px;
		}

		.logo {
			width: 132px;
		}

		button,
		.subnav {
			font-size: 16px;
		}

		.sidebar-bottom {
			padding-bottom: 12px;
		}
	}
</style>
