<script>
  let { questionId, questionText, handler, answers} = $props();
</script>

 <p>{questionId}. {questionText}</p>
<ol> 
  {#each answers as answer}
    <li><a class="answer" onclick={(e) => handler(e, answer.id)}>{answer.text}</a></li>
  {/each}
</ol>

<style>
  .answer {
    background: none;
    border: none;
  }

  li {
    text-align: left;
  }

  .answer:hover {
    color: blue;
    cursor: grab;
  }

  
</style>
