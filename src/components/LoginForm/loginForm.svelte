<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import fadeScale from './fade-scale.js';
	import Box from '../box.svelte';
	import Button from '../button.svelte';
	import Switch from '../switch.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { setLogStatus } from '$lib/client/state.svelte.js';
	import CropperModal from '../CopperModal/CropperModal.svelte';

	let { data } = $props();
	if (data.accessToken) {
		if (browser) {
			localStorage.setItem('accessToken', data.accessToken);
			setLogStatus({ isLoggedIn: true, accessToken: data.accessToken });
			goto('/home'); // Redirect to home page after successful login
		}
	}
	let switchActive = $state(0);
	let showModal = $state(false);
	// cropper

	let croppedImage = $state(null);
	let blob = $state(null);
	let mimeType = $state(null);
	let extenstion = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/webp': 'webp'
	};

	let avatarFile: FileList | null = $state(null);

	let handleSubmit = (event: MouseEvent) => {
		event.preventDefault();

		if (blob) {
			let file = new File([blob], `avatar.${extenstion[mimeType || 'image/png']}`, {
				type: mimeType || 'image/png'
			});
			const fileList = new DataTransfer();
			fileList.items.clear();
			fileList.items.add(file);

			avatarFile = fileList.files;

			const fileInput = document.querySelector('input[name="avatar"]') as HTMLInputElement | null;
			if (fileInput) {
				fileInput.files = avatarFile;
			} else {
				console.error('Avatar input not found');
			}
		}
		const elt = event.target as HTMLFormElement;
		const form = elt.closest('form');
		if (form) {
			form.submit();
		}
	};
</script>

<div class="login-page">
	<Switch labels={['Connexion', 'Inscription']} bind:active={switchActive} />
	<Box>
		<form
			method="POST"
			enctype="multipart/form-data"
			action="?/{switchActive == 0 ? 'login' : 'register'}"
		>
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
				<div>
					<Button callback={() => (showModal = true)} label="avatar" />
				</div>
				<div>
					{#if croppedImage}
						<img src={croppedImage} alt="Cropped profile" class="avatar-preview" />
						<!-- Hidden input to submit cropped image as data URL -->
						<input type="file" name="avatar" style="display:none" />
					{:else}
						<p>Aucune image</p>
					{/if}
				</div>
			{/if}
			<!-- TODO disabled controlled by form validation -->
			<Button callback={(e) => handleSubmit(e)} label="valider" disabled={false} />
		</form>
	</Box>
	{#if data?.error}
		<div>Error :{data?.error}</div>
	{/if}
</div>

<CropperModal bind:showModal bind:croppedImage bind:mimeType bind:blob />

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
	.avatar-preview {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		margin: auto;
		display: block;
	}
</style>
