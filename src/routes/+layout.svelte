<script lang="ts">
	import { page } from '$app/state';
    let status = page.data?.response;
    let { children } = $props();
    const logout = (e: any) => {
        e.preventDefault();
        localStorage.removeItem("accessToken");
        e.target.parentElement.submit();
    }
</script>
<header>
    <h1><a href="/" >Bienvenue !</a></h1>
    {#if status.accessToken}
        <div class="logthumb">
            <form method="POST" action="/?/logout">
                <button type="submit" onclick={logout}>Logout</button>
            </form>
            <span>Logged in</span>
        </div>
    {/if}
</header>
{@render children()}

<style src="./header.css"></style>