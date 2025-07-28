<script lang="ts">
	import { onMount } from 'svelte';
	import { appState, setWebSocket } from '$lib/client/state.svelte';

	let client;
	let { children } = $props();

	//TODO Contrôller le token d'authentification !!!

	//TODO Sortir la gestion du WebSocket du onMount
	// Y mettre toute la logique ?

	onMount(() => {
		setWebSocket();

		if (appState.webSocket) {
			console.log('websocket state : ', appState.webSocket.connected);
			if (!appState.webSocket.connected) {
				appState.webSocket.connect();
			}

			client = appState.webSocket;
			client.on('connect', () => {
				console.log('WebSocket connected');
			});
			client.on('disconnect', () => {
				console.log('WebSocket disconnected');
			});
			client.on('error', (error: any) => {
				console.error('WebSocket error:', error);
			});
		}

		return () => {
			console.log('returned from onMount');
			if (appState.webSocket) {
				appState.webSocket.disconnect();
			}
		};
	});
</script>

{@render children()}
