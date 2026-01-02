<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import useLocalStorage from "$lib/storage.svelte.js";
    const { data } = $props();

    const store = useLocalStorage(page.params.room);
    
    async function loadScore(room) {
        const response = await fetch(`https://yp-game-backend.onrender.com/score?room=${room}`);
        return response.json();
    }

    let scorePromise = $state(loadScore(page.params.room));
    
    onMount(() => {
        const interval = setInterval(() => {
            scorePromise = loadScore(page.params.room);
        }, 5000);
        return () => clearInterval(interval);
    });
</script>

<div class="score-container">
    <header class="header">
        <h1 class="title">🏆 Placar de Aprendizagem</h1>
        <p class="room-info">Sala: <span class="code-value">{page.params.room}</span></p>
    </header>

    <div class="content">
        {#await scorePromise}
            <div class="loading">
                <div class="spinner"></div>
                <p>Calculando resultados...</p>
            </div>
        {:then teams}
            {#if !teams || teams.length === 0}
                <div class="empty-state">Aguardando as equipes entrarem...</div>
            {:else}
                <div class="table-wrapper">
                    <table class="score-table">
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Equipe</th>
                                <th>Pontos</th>
                                <th>Mapa de Respostas (Questão 1 → 20)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each teams.sort((a,b) => b.score - a.score) as team, i}
                                <tr class="team-row">
                                    <td class="rank">{i + 1}º</td>
                                    <td class="team-name">{team.name}</td>
                                    <td class="team-score">{team.score}</td>
                                    <td>
                                        <div class="status-map">
                                            {#each team.details || [] as detail}
                                                <div 
                                                    class="status-dot {detail.correct ? 'correct' : 'wrong'}"
                                                    title="Questão {detail.question_id}: {detail.correct ? 'Acertou' : 'Errou'}">
                                                    {detail.correct ? '✓' : '✕'}
                                                </div>
                                            {/each}
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        {/await}
    </div>
</div>

<style>
    .score-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Inter', sans-serif;
    }

    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 2.5rem; color: #2d3748; }
    .code-value { color: #5a67d8; font-weight: bold; }

    .table-wrapper {
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        overflow: hidden;
    }

    .score-table {
        width: 100%;
        border-collapse: collapse;
    }

    .score-table th {
        background: #f7fafc;
        padding: 15px;
        text-align: left;
        color: #718096;
    }

    .team-row { border-top: 1px solid #edf2f7; }
    .team-name { font-weight: 600; padding: 15px; }
    .team-score { font-weight: bold; color: #5a67d8; font-size: 1.2rem; }

    /* O MAPA DE STATUS (PONTINHOS) */
    .status-map {
        display: flex;
        gap: 6px;
        padding: 10px;
        flex-wrap: wrap;
    }

    .status-dot {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        cursor: help;
        transition: transform 0.2s;
    }

    .status-dot:hover { transform: scale(1.2); }
    .correct { background-color: #48bb78; } /* Verde */
    .wrong { background-color: #f56565; }   /* Vermelho */

    .loading { text-align: center; padding: 50px; }
</style>