<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import useLocalStorage from "$lib/storage.svelte.js";
    
    const store = useLocalStorage(page.params.room); 
    
    async function loadScore(room) {
        const response = await fetch(`https://yp-game-backend.onrender.com/score?room=${room}`);
        return response.json();
    }

    let scorePromise = $state(loadScore(page.params.room));
    
    // REMOVIDO: saveFeedback - não é mais necessário
    
    onMount(() => {
        const interval = setInterval(() => {
            scorePromise = loadScore(page.params.room);
        }, 5000);
        return () => clearInterval(interval);
    });
</script>

<div class="score-container">
    <header class="header">
        <h1 class="title">🏆 Placar da Sala</h1>
        <p class="room-info">Sala: <span class="code-value">{page.params.room}</span></p>
    </header>

    <div class="content">
        {#await scorePromise}
            <div class="loading">Carregando placar...</div>
        {:then teams}
            {#if !teams || teams.length === 0}
                <div class="empty-state">Aguardando as equipes entrarem...</div>
            {:else}
                <div class="table-wrapper">
                    <table class="score-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipe</th>
                                <th>Pontos</th>
                                <th>Mapa de Respostas</th>
                                <th>Status</th>
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
                                                    title="Questão {detail.question_id}">
                                                    {detail.correct ? '✓' : '✕'}
                                                </div>
                                            {/each}
                                        </div>
                                    </td>
                                    <td class="status-cell">
                                        {#if team.finished}
                                            <span class="badge finished">✓ Finalizado</span>
                                        {:else}
                                            <span class="badge in-progress">Em andamento...</span>
                                        {/if}
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
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 20px; 
        font-family: 'Inter', sans-serif; 
    }
    
    .header { 
        text-align: center; 
        margin-bottom: 30px; 
    }
    
    .title { 
        font-size: 2rem; 
        color: #2d3748; 
        margin-bottom: 10px;
    }
    
    .room-info { 
        color: #718096; 
        font-size: 1rem; 
    }
    
    .code-value { 
        color: #5a67d8; 
        font-weight: bold; 
        font-size: 1.2rem;
    }

    .content { 
        margin-top: 20px; 
    }
    
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
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
    }
    
    .team-row { 
        border-top: 1px solid #edf2f7;
        transition: background-color 0.2s;
    }
    
    .team-row:hover {
        background-color: #f7fafc;
    }
    
    .rank { 
        padding: 15px; 
        font-weight: bold; 
        color: #718096;
        font-size: 1.1rem;
    }
    
    .team-name { 
        font-weight: 600; 
        padding: 15px;
        color: #2d3748;
    }
    
    .team-score { 
        font-weight: bold; 
        color: #5a67d8; 
        font-size: 1.3rem; 
        padding: 15px;
    }

    /* Estilos do Mapa de Status */
    .status-map { 
        display: flex; 
        gap: 6px; 
        padding: 10px; 
        flex-wrap: wrap; 
    }
    
    .status-dot {
        width: 24px; 
        height: 24px; 
        border-radius: 5px; 
        display: flex;
        align-items: center; 
        justify-content: center; 
        font-size: 11px; 
        color: white;
        font-weight: bold;
        cursor: help;
        transition: transform 0.2s;
    }
    
    .status-dot:hover {
        transform: scale(1.2);
    }
    
    .correct { 
        background-color: #48bb78; 
    }
    
    .wrong { 
        background-color: #f56565; 
    }

    /* Estilos de Status */
    .status-cell { 
        padding: 15px;
        text-align: center;
    }
    
    .badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    .finished {
        background-color: #c6f6d5;
        color: #22543d;
    }
    
    .in-progress {
        background-color: #feebc8;
        color: #7c2d12;
    }
    
    .loading { 
        text-align: center; 
        padding: 40px; 
        color: #718096;
        font-size: 1.1rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #a0aec0;
        font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
        .score-container {
            padding: 15px;
        }
        
        .title {
            font-size: 1.6rem;
        }
        
        .table-wrapper {
            overflow-x: auto;
        }
        
        .score-table {
            font-size: 0.9rem;
        }
    }
</style>