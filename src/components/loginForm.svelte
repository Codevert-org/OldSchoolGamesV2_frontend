<script>
	import { cubicInOut } from 'svelte/easing';
	import fadeScale from './fade-scale.js';
	import Box from '../components/box.svelte';
	import Button from './button.svelte';
	import Switch from './switch.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { setLogStatus } from '$lib/client/state.svelte.js';

	let switchActive = $state(0);
	let { data } = $props();
	console.log(data);
	if (data.accessToken) {
		if (browser) {
			localStorage.setItem('accessToken', data.accessToken);
			setLogStatus({ isLoggedIn: true, accessToken: data.accessToken });
			goto('/home'); // Redirect to home page after successful login
		}
	}
</script>

<div class="login-page">
	<Switch labels={['Connexion', 'Inscription']} bind:active={switchActive} />
	<Box>
		<form method="POST" action="?/{switchActive == 0 ? 'login' : 'register'}">
			{#if switchActive == 1}
				<div
					class="form-line"
					transition:fadeScale={{
						delay: 0,
						duration: 400,
						easing: cubicInOut,
						baseScale: 0.5
					}}
				>
					<div><label for="username">Pseudo:</label></div>
					<input type="text" id="username" name="pseudo" required />
				</div>
			{/if}
			<div class="form-line">
				<div><label for="email">Email:</label></div>
				<input type="text" id="email" name="email" required />
			</div>
			<div class="form-line">
				<div><label for="password">Mot de passe:</label></div>
				<input type="password" id="password" name="password" required />
			</div>
			{#if switchActive == 1}
				<div
					class="form-line"
					transition:fadeScale={{
						delay: 0,
						duration: 400,
						easing: cubicInOut,
						baseScale: 0.5
					}}
				>
					<div><label for="passwordConfirm">Confirmer:</label></div>
					<input type="password" id="passwordConfirm" name="passwordConfirm" required />
				</div>
			{/if}
			<Button type="submit">valider</Button>
		</form>
	</Box>
	{#if data?.error}
		<div>Error :{data?.error}</div>
	{/if}
</div>

<style>
	.login-page {
		width: fit-content;
		margin: auto;
	}
	.form-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 30px;
	}
	.form-line div {
		width: 100%;
	}
	.form-line label {
		width: 100px;
		text-align: right;
	}
	.form-line input {
		width: 200px;
	}
</style>
