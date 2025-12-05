<script lang="ts">
	export let data;
	import Header from '$lib/components/Header.svelte';
</script>

<Header user={data.user} />

<slot />
