<script lang='ts'>
	import { applyAction, enhance } from '$app/forms';
  import { appState } from '$lib/client/state.svelte';

  let { data } = $props();
  appState.logStatus.user = data.user;
  

</script>

<h1>Profile</h1>
<span>
  {JSON.stringify(data.user)}

</span>

<form method="post" use:enhance={({ formElement, formData, action, cancel}) => {
  return async ({result, update}) => {
    console.log(result);
    update();
  };
}}>
  <div class="form-line">
    <div><label for="pseudo">Pseudo:</label></div>
    <input type="text" id="pseudo" name="pseudo"/>
	</div>
  <button type="submit">Valider</button>
</form>