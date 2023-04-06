<script lang="ts">
  import Child from "./Child.svelte";

  export let asd: string = "ASD";
  function log() {
    console.log("LOGGING FROM FUNCTION");
  }
</script>

<svelte:head>
  <script>
    /*     document.getElementById("some-id").addEventListener("click", () => {
      console.log("ASDASD");
    }); */
  </script>
</svelte:head>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="some-id" onclick={log}>
  {asd}

  <Child childProp="asd" />
</div>

<style>
  #some-id {
    background-color: red;
  }
</style>
