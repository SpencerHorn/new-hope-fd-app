<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	export let data;

	let mobileNavOpen = false;
</script>

<div class="app-shell">
	{#if data.user}
		<button
			type="button"
			class="mobile-nav-toggle"
			aria-label="Open navigation"
			on:click={() => (mobileNavOpen = true)}
		>
			Menu
		</button>

		{#if mobileNavOpen}
			<button
				type="button"
				class="mobile-nav-backdrop"
				aria-label="Close navigation"
				on:click={() => (mobileNavOpen = false)}
			></button>
		{/if}

		<Sidebar
			appRole={data.appUser?.role ?? 'probationary'}
			mobileOpen={mobileNavOpen}
			on:close={() => (mobileNavOpen = false)}
		/>
	{/if}

	<main
		class="app-main"
		class:with-sidebar={!!data.user}
	>
		<slot />
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
		background: #f5f5f7;
	}

	.app-main {
		flex: 1;
		padding: 32px;
		box-sizing: border-box;
	}

	/* 👇 ONLY offset content when sidebar exists */
	.app-main.with-sidebar {
		margin-left: 220px; /* MUST match sidebar width */
	}

	.mobile-nav-toggle,
	.mobile-nav-backdrop {
		display: none;
	}

	@media (max-width: 960px) {
		.app-main {
			padding: 72px 14px 18px;
		}

		.app-main.with-sidebar {
			margin-left: 0;
		}

		.mobile-nav-toggle {
			display: inline-flex;
			position: fixed;
			top: 12px;
			left: 12px;
			z-index: 90;
			align-items: center;
			justify-content: center;
			border: 1px solid #d1d5db;
			background: white;
			border-radius: 12px;
			padding: 10px 14px;
			font-weight: 600;
		}

		.mobile-nav-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 80;
			border: 0;
			padding: 0;
			background: rgba(17, 24, 39, 0.4);
		}
	}
</style>
