<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	export let data;
</script>

<div class="app-shell">
	<Sidebar />

	<main class="app-main">
		<slot />
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
		background: #f5f5f7;
	}

	/* Sidebar width lock */
	.app-main {
		margin-left: 220px; /* MUST match Sidebar width */
		flex: 1;
		padding: 32px;
		box-sizing: border-box;
		overflow-x: hidden;
	}
</style>
