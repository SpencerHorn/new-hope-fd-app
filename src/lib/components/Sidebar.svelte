<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	export let user: any;
</script>

<aside class="sidebar">
	<nav class="main-nav">
		<!-- <img src="/NewHopeLogo.png" alt="NHFD Logo" class="logo" /> -->
		<a href="/" class:selected={$page.url.pathname === '/'}>Home</a>
	</nav>

	<!-- Bottom-fixed actions -->
	<div class="sidebar-actions">
		<button class="sidebar-btn" on:click={() => goto('/invite/create')}> Invite User </button>

		<form method="POST" action="/logout">
			<button type="submit" class="sidebar-btn"> Logout </button>
		</form>
	</div>
</aside>

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

	/* .main-nav img {
		margin: 0;
		padding: 0;
		width: 100%;
		margin-bottom: 12px;
	} */

	/* Navigation link */
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

	/* Button & link matching visual style */
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

	form {
		margin: 0;
	}
</style>
