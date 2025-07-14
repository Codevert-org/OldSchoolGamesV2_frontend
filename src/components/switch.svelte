<script lang="ts">
  let { active = $bindable(0), labels } = $props();
  let [label1, label2] = JSON.parse(labels);

  function toggleActive() {
    active = active === 0 ? 1 : 0;
  }
</script>

<button
  type="button"
  class="wrapper"
  class:isFirstActive={active === 0}
  aria-pressed={active === 0}
  onclick={toggleActive}
>
  <div class="label">{label1}</div>
  <div class="label">{label2}</div>
</button>

<style>
.wrapper {
  margin: 10px auto;
  padding: 4px;
  display: grid;
  grid-template-columns: repeat(2, minmax(max-content, 1fr));
  width: 100%;
  background-color: transparent;
  position: relative;
  cursor: pointer;
  /*border: 1px solid #333;
  border-radius: 6px;*/
  border: 11px solid green;
  border-image: url("./button_border_disabled.png") 11 stretch;
  border-radius: 12px;
}

.wrapper::after {
  content: '';
  display: block;
  width: 50%;
  height: 100%;
  border: 11px solid green;
  border-image: url("./button_border.png") 11 stretch;
  border-radius: 12px;
  box-shadow: 3px 3px 6px #306b30;
  position: absolute;
  top: -11px;
  left: -11px;
  transition: left 0.3s ease-in-out;
  
}

.wrapper:not(.isFirstActive)::after {
  left: calc(50% - 11px);
  transition: left 0.3s ease-in-out;
}

.label {
  padding: 4px;
  text-align: center;
  background-clip: text;
  color: transparent;
  background-size: 200% 100%;
  background-image: linear-gradient(to right, rgb(11, 112, 36), rgb(21, 235, 74) 2% 49%, rgb(11, 112, 36) 51%);
  transition: background-position 0.3s ease-in-out;
  
}

.wrapper.isFirstActive .label:nth-child(1) {
  background-position: 0%;
}
.wrapper:not(.isFirstActive) .label:nth-child(1) {
  background-position: -100%;
}

.wrapper.isFirstActive .label:nth-child(2) {
  background-color: rgb(11, 112, 36);
  background-position: 100%;
}
.wrapper:not(.isFirstActive) .label:nth-child(2) {
  background-position: 0%;
}

</style>