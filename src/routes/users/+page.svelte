<script lang="ts">
	import UserTable from '$lib/components/UserTable.svelte';
	export let data;
</script>

<UserTable users={data.users} />
