<script>
  import Todo from "./components/Todo.svelte";

  export let lastId = 0;

  const createTodo = (text, done = false) => ({ id: ++lastId, text, done });

  let todoText = "";

  export let todos = [];

  $: uncompletedCount = todos.filter((t) => !t.done).length;

  $: status = `${uncompletedCount} of ${todos.length} remaining`;

  function addTodo() {
    todos.push(createTodo(todoText));
    todos = todos;
    todoText = "";
  }

  const archiveCompleted = () => (todos = todos.filter((t) => !t.done));

  const deleteTodo = (todoId) => (todos = todos.filter((t) => t.id !== todoId));

  function toggleDone(todo) {
    const { id } = todo;
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }
</script>

<div>
  <h1>To Do List</h1>
  <div>
    {status}
    <button on:click={archiveCompleted}>Archive Completed</button>
  </div>
  <form on:submit|preventDefault={addTodo}>
    <input size="30" placeholder="enter new todo here" bind:value={todoText} />
    <button disabled={!todoText}>Add</button>
  </form>
  <ul>
    {#each todos as todo}
      <Todo
        {todo}
        on:delete={() => deleteTodo(todo.id)}
        on:toggleDone={() => toggleDone(todo)}
      />
    {/each}
  </ul>
</div>

<style>
  button {
    margin-left: 1rem;
  }

  h1 {
    margin-top: 0;
  }

  ul {
    list-style: none;
    margin-left: 0;
    padding-left: 0;
  }
</style>
