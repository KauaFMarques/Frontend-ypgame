<script>
  let { handler, content, ...props } = $props();
</script>

<button onclick={handler} {...props}>{content}</button>

<style>
  button {
      padding: 10px 20px;
      border: none;
      font-weight: 700;
      border-radius: 20px;
    }
</style>
