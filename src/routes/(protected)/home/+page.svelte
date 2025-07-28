<script lang="ts">
	import { onMount } from 'svelte';
	import { appState, setWebSocket } from '$lib/client/state.svelte';

	let { data } = $props();
	let client;

	const displayMessage = (message: string) => {
		const wsViewer = document.querySelectorAll('.wsViewer')[0];
		const messageElement = document.createElement('div');
		messageElement.textContent = message;
		wsViewer.appendChild(messageElement);
		setTimeout(() => {
			messageElement.remove();
		}, 5000); // Remove message after 5 seconds
	};

	onMount(() => {
		console.log('Data received:', data);
		if (data.user) {
			appState.logStatus.user = data.user;
			console.log('User data set in appState:', appState.logStatus.user);
		} else {
			console.warn('No user data received');
		}

		console.log('WebSocket ? :', appState.webSocket !== undefined && appState.webSocket !== null);
		return () => {
			console.log('Cleaning up WebSocket listeners');
			appState.webSocket?.off('welcome');
			appState.webSocket?.off('users');
			appState.webSocket?.off('movies');
			appState.webSocket?.off('team');
		};
	});

	setWebSocket(appState.logStatus.accessToken);

	console.log('websocket state : ', appState.webSocket?.connected);

	client = appState.webSocket;

	client?.on('welcome', function () {
		displayMessage('Welcome event received');
	});

	client?.on('users', function (data: any) {
		console.log('users event received:', data);
		displayMessage(`Users event : ${JSON.stringify(data)}`);
	});
	client?.on('movies', function (data: any) {
		console.log('movies event received:', data);
		displayMessage(`movies event : ${JSON.stringify(data)}`);
	});
	client?.on('team', function (data: any) {
		console.log('team event received:', data);
		displayMessage(`team event : ${JSON.stringify(data)}`);
	});
</script>

<h1>Home</h1>
<div class="wsViewer"></div>

<style>
	h1 {
		text-align: center;
	}
</style>
