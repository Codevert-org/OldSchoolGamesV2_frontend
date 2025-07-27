<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "$lib/client/state.svelte";

  let client;
  let wsMessages = $state<string[]>([]);

  const displayMessage = (message: string) => {
    wsMessages.push(message);
    const wsViewer = document.querySelectorAll('.wsViewer')[0];
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    wsViewer.appendChild(messageElement);
    setTimeout(() => {
      messageElement.remove();
    }, 5000); // Remove message after 5 seconds
  }
  onMount(() => {
    
    
    if (appState.webSocket) {
      client = appState.webSocket;
      
      
      client.on('welcome', function() {
        displayMessage("Welcome event received");
      });

      client.on('users', function(data: any) {
        console.log("users event received:", data);
        displayMessage(`Users event : ${JSON.stringify(data)}`);
      });
      client.on('movies', function(data: any) {
        console.log("movies event received:", data);
        displayMessage(`movies event : ${JSON.stringify(data)}`);
      });
      client.on('team', function(data: any) {
        console.log("team event received:", data);
        displayMessage(`team event : ${JSON.stringify(data)}`);
      });
    } 
  })
</script>

<h1>Home</h1>
<div class="wsViewer">

</div>

<style>
  h1 {
    text-align: center;
  }
</style>