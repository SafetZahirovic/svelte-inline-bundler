<script>
  const routes = ["hydratable", "ssr", "dom"];
  const views = ["todo", "virtual-list", "hacker-news", "smui"];
</script>

<main>
  <h1>Svelte inline compiler examples</h1>
  <div>
    <h2>Examples:</h2>
    <ul>
      {#each routes as route (route)}
        {#each views as view (view)}
          <li>
            <a href={`${route}/${view}`} target="_blank">{route} - {view}</a>
          </li>
        {/each}
      {/each}
    </ul>
  </div>
</main>
