<script lang="ts">
    export let data;

    let password = "";
    let confirmPassword = "";
    let error = "";
</script>

<div class="invite-container">
    <h2>Complete Your Account Setup</h2>
    <p>Email: {data.email}</p>

    <form method="POST">
        <input type="password" name="password" placeholder="Password" bind:value={password} required />
        <input type="password" name="confirm" placeholder="Confirm password" bind:value={confirmPassword} required />
        <input type="hidden" name="token" value={data.token} />

        <button type="submit">Create Account</button>
    </form>

    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>
