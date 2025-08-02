<script lang='ts'>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-nocheck

	import Cropper from 'svelte-easy-crop';
	import getCroppedImg from './canvasUtils';
	import Button from '../button.svelte';

	let {
		showModal = $bindable(),
		croppedImage = $bindable(),
		mimeType = $bindable(),
		blob = $bindable()
	} = $props();

	let dialog = $state(); // HTMLDialogElement

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let image = $state(null);
	//let croppedImage = $state(null);
	let fileinput = $state(null);
	let pixelCrop = $state({ x: 0, y: 0 });

	$effect(() => {
		if (showModal) dialog.showModal();
	});

	function onFileSelected(e) {
		let imageFile = e.target.files[0];
		let reader = new FileReader();
		reader.onload = (e) => {
			image = e.target.result;
		};
		reader.readAsDataURL(imageFile);
	}

	let profilePicture = $state(null);
	let style = $state('');

	function previewCrop(e) {
		mimeType = profilePicture.src.substring(
			profilePicture.src.indexOf(':') + 1,
			profilePicture.src.indexOf(';')
		);

		// set pixelCrop to the cropper event
		pixelCrop = e.pixels;
		const { x, y, width } = e.pixels;
		const scale = 100 / width;
		profilePicture.style = `margin: ${-y * scale}px 0 0 ${
			-x * scale
		}px; width: ${profilePicture.naturalWidth * scale}px;`;
	}

	async function cropImage() {
		croppedImage = await getCroppedImg(image, pixelCrop);
		// convert croppedImage to a data blob
		blob = await fetch(croppedImage).then((r) => r.blob());
		dialog.close();
	}

	function reset() {
		croppedImage = null;
		image = null;
	}

	const askImageSelection = () => {
		const inputEl = document.querySelector('#avatarInput') as HTMLInputElement;
		inputEl.click();
	};
</script>

<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => {
		if (e.target === dialog) dialog.close();
	}}
>
	<div>
		{#if !image}
			<h2>Upload a picture for cropping?</h2>
			<input
				id="avatarInput"	
				type="file"
				accept=".jpg, .jpeg, .png"
				onchange={(e) => onFileSelected(e)}
				bind:this={fileinput}
			/>
			<Button type="button" callback={askImageSelection} label="Choisir une image" />
			<Button type="button" callback={() => dialog.close()} label="Annuler" />
		{:else}
			<h2>svelte-easy-crop</h2>
			<div style="position: relative; width: 100%; height: 300px;">
				<Cropper
					{image}
					bind:crop
					bind:zoom
					oncropcomplete={previewCrop}
					aspect={1}
					cropShape="round"
				/>
			</div>
			<h2>Preview</h2>
			<div class="prof-pic-wrapper">
				<img
					bind:this={profilePicture}
					class="prof-pic"
					src={image}
					alt="Profile example"
					{style}
				/>
			</div>
			{#if croppedImage}
				<h2>Cropped Output</h2>
				<img src={croppedImage} alt="Cropped profile" class="prof-file" /><br />
			
				
			{/if}
			<br />
			<Button type="button" callback={async () => cropImage()} label="Valider"/>
			<Button type="button" callback={reset} label="Supprimer"/>
		{/if}
		
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		padding: 0;
		border: 11px solid green;
		background-color: #131410;
		color: #4a8b53;
		border-image: url('/box_border.png') 11 stretch;
		border-radius: 12px;
		box-shadow: 3px 3px 6px #306b30;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	#avatarInput {
		display: none;
	}

	.prof-pic-wrapper {
		height: 100px;
		width: 100px;
		border-radius: 50px;
		position: relative;
		border: solid;
		overflow: hidden;
	}

	.prof-pic {
		position: absolute;
	}

	.prof-file {
		width: 100px;
		height: 100px;
		height: auto;
	}
</style>
