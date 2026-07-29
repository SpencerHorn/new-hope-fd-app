<script lang="ts">
    let email = "";
    let result = "";
    let error = "";

    async function createInvite(e: SubmitEvent) {
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

<style>
    h2 {
        margin: 0 0 0.75rem;
        font-size: 1.35rem;
        color: #111827;
    }

    form {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
    }

    input {
        flex: 1 1 240px;
        padding: 0.7rem 0.8rem;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        font-size: 1rem;
    }

    button {
        padding: 0.7rem 1rem;
        border: none;
        border-radius: 10px;
        background: #111827;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
    }

    pre {
        margin: 0.4rem 0 0;
        max-width: 100%;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
        background: #f3f4f6;
        border-radius: 10px;
        padding: 0.75rem;
    }

    .error {
        color: #b91c1c;
        font-weight: 600;
    }

    @media (max-width: 640px) {
        form {
            flex-direction: column;
        }

        input,
        button {
            width: 100%;
            box-sizing: border-box;
        }
    }
</style>
