<script lang="ts">
    import { goto } from "$app/navigation";

    let email = "";
    let result = "";
    let error = "";

    async function createInvite(e) {
        e.preventDefault();

        const res = await fetch("/api/invite", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            error = "Failed to create invite.";
            return;
        }

        const data = await res.json();
        result = `${window.location.origin}${data.inviteUrl}`;
    }
</script>

<h2>Create Invite</h2>

<form on:submit={createInvite}>
    <input type="email" bind:value={email} placeholder="Email" required />
    <button>Create Invite</button>
</form>

{#if result}
    <p>Invite URL:</p>
    <pre>{result}</pre>
{/if}

{#if error}
    <p class="error">{error}</p>
{/if}
