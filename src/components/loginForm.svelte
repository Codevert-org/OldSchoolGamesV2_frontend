<script>
	import { cubicInOut } from 'svelte/easing';
	import fadeScale from './fade-scale.js';
	import Box from '../components/box.svelte';
	import Button from './button.svelte';
	import Switch from './switch.svelte';
	let switchActive = $state(0);
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	let response = page.data?.response;
	//console.log(response);
	if (browser && response?.accessToken) {
		localStorage.setItem('accessToken', response.accessToken);
		goto('/home');
	}
</script>

<div class="login-page">
	<Switch labels="['Login', 'Register']" bind:active={switchActive} />
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
					<div><label for="username">Username:</label></div>
					<input type="text" id="username" name="pseudo" required />
				</div>
			{/if}
			<div class="form-line">
				<div><label for="email">Email:</label></div>
				<input type="text" id="email" name="email" required />
			</div>
			<div class="form-line">
				<div><label for="password">Password:</label></div>
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
					<div><label for="passwordConfirm">Confirm:</label></div>
					<input type="password" id="passwordConfirm" name="passwordConfirm" required />
				</div>
			{/if}
			<Button type="submit">valider</Button>
		</form>
	</Box>
	{#if response?.error}
		<div>Error :{response?.error}</div>
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
