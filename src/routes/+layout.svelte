<script lang="ts">
	import LogThumb from '../components/Header/logThumb.svelte';
	import { appState } from '$lib/client/state.svelte';
	
	let { children } = $props();
</script>

<header>
	<h1><a href="/">Old School Games !</a></h1>
	{#if appState.logStatus.isLoggedIn}
	<LogThumb />	
	{/if}
</header>
{@render children()}

<style src="./header.css"></style>
