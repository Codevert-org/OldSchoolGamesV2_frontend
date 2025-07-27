<script lang="ts">
	import socketIOClient from "socket.io-client";
	import { onMount } from "svelte";
  import { appState } from "$lib/client/state.svelte";

  let client;
  onMount( () => {
    appState.webSocket = socketIOClient('https://oldschoolgames-backend.codevert.org/events', { extraHeaders: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    if (appState.webSocket) {
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
      if (appState.webSocket) {
        appState.webSocket.disconnect();
      }
    };
  });
</script>
<slot />
