<script>
  let { value = $bindable(), label, name } = $props();
</script>

<div>
  <label for={name}>{label}</label>
  <input bind:value={value} id={name} type="text" required>
</div>

<style>
  input {
    display: block;
    border: 1px solid black;
    border-radius: 5px;
    width: 100%;
    height: 30px;
    outline: none;
  }
</style>
