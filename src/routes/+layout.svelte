<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	export let data;
</script>

<div class="app-shell">
	{#if data.user}
		<Sidebar />
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
</style>
