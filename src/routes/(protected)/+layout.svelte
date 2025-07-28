<script lang="ts">
	import { onMount } from 'svelte';
	import { appState, setWebSocket, resetLogStatus } from '$lib/client/state.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let client;
	let { children } = $props();

	//TODO Contrôller le token d'authentification !!!
	if (browser && (appState.logStatus.isLoggedIn === false || !appState.logStatus.accessToken)) {
		resetLogStatus();
		localStorage.removeItem('accessToken');
		goto('/login');
	}

	onMount(() => {
		setWebSocket(appState.logStatus.accessToken);

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
