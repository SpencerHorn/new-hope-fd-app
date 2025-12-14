<script lang="ts">
	export let data;

	const user = data?.user ?? null;
</script>

{#if !user}
	<section style="padding: 2rem;">
		<h1>User not found</h1>
		<p>The requested user does not exist.</p>
	</section>
{:else}
	<section class="user-detail">
		<h1>{user.firstName} {user.lastName}</h1>

		<div class="field"><strong>Phone:</strong> {user.phone}</div>
		<div class="field"><strong>Personal Email:</strong> {user.personalEmail}</div>
		<div class="field"><strong>Work Email:</strong> {user.workEmail}</div>
		<div class="field"><strong>Role:</strong> {user.role}</div>
		<div class="field"><strong>Address:</strong> {user.address}</div>
		<div class="field"><strong>Mask Size:</strong> {user.maskSize}</div>
		<div class="field"><strong>Fit Test Date:</strong> {user.fitTestDate}</div>
		<div class="field"><strong>T-shirt Size:</strong> {user.tshirtSize}</div>
	</section>
{/if}

<style>
	.user-detail {
		max-width: 900px;
		margin: 0 auto;
	}

	.field {
		margin: 8px 0;
		font-size: 18px;
	}
</style>
