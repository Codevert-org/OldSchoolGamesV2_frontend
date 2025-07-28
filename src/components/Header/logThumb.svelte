<script lang="ts">
	import { browser } from '$app/environment';
	import { appState, resetLogStatus } from '$lib/client/state.svelte';

	const logout = (e: any) => {
		e.preventDefault();
		resetLogStatus();
		if (browser) {
			localStorage.removeItem('accessToken');
		}
		e.target.parentElement.parentElement.submit();
	};
</script>

<div class="logthumb">
	<form method="POST" action="/?/logout">
		<button type="submit" aria-label="logout" onclick={logout}>
			<img src="./turn-off.png" alt="logout" />
		</button>
	</form>
	<span>{appState.logStatus.user ? appState.logStatus.user.pseudo : 'logged in'}</span>
</div>

<style>
	.logthumb {
		position: absolute;
		top: 10px;
		right: 10px;
		padding: 5px 10px;
		border-radius: 5px;
		font-size: 16px;
		display: flex;
		flex-direction: column;
		align-items: end;
	}

	button {
		background: none;
		border: none;
		cursor: pointer;
	}
</style>
