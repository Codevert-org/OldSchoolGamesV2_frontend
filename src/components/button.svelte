<script lang="ts">
	let {
		callback = () => {},
		type = 'button',
		label,
		disabled = false
	}: {
		callback?: () => void;
		type?: 'button' | 'submit' | 'reset';
		label: string;
		disabled?: boolean;
	} = $props();
</script>

<div class="button_wrapper">
	<button {type} onclick={callback} {disabled}>
		<span>{label}</span>
	</button>
</div>

<style>
	.button_wrapper {
		width: fit-content;
		margin: 10px auto;
		border-radius: 12px;
		background-image: radial-gradient(ellipse at center, #131410 20%, rgb(3, 121, 3));
	}

	button {
		border: 11px solid transparent;
		border-radius: 12px;
		background-color: #131410;
		width: fit-content;
		transition: all 150ms;
		color: #4a8b53;
		border-image: url('/button_border.png') 11 stretch;
		cursor: pointer;
	}

	button:hover:not([disabled]) {
		box-shadow: 3px 3px 6px #3e8b3e;
		color: #4ac44a;
		background-color: transparent;
	}

	/* button disabled */
	button[disabled] {
		border: 11px solid transparent;
		border-radius: 12px;
		border-image: url('/button_border_disabled.png') 11 stretch;
		color: #4e6d52;
		cursor: default;
	}

	button[disabled] > span {
		cursor: default;
	}
</style>
