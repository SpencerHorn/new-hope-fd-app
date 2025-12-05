<script lang="ts">
	export let data;

	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';

	// ⭐ Make landing.css global
	import '$lib/styles/landing.css';
</script>

<div class="app-shell">
	{#if data.user}
		<Sidebar user={data.user} />
	{/if}

	<div class="app-main">
		{#if data.user}
			<Header user={data.user} />
		{/if}

		<div class="app-content">
			<slot />
		</div>
	</div>
</div>

<style>
	/* App root layout */
	.app-shell {
		display: flex;
		min-height: 100vh;
		width: 100%;
		background: #f5f5f7;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.app-content {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}
</style>
