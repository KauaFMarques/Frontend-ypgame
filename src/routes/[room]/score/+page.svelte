<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    
    // Obtém o código da sala da URL (ex: /abc1234/score -> abc1234)
    const roomCode = page.params.code; 

    async function loadScore() {
        try {
            const response = await fetch(`https://yp-game-backend.onrender.com/score?room=${roomCode}`);
            if (!response.ok) throw new Error("Falha ao carregar");
            return await response.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    let scorePromise = $state(loadScore());
    
    // Atualiza a cada 5 segundos
    onMount(() => {
        const interval = setInterval(() => {
            scorePromise = loadScore();
        }, 5000);
        return () => clearInterval(interval);
    });
</script>

<div class="score-container">
    <header class="header">
        <h1 class="title">🏆 Placar em Tempo Real</h1>
        <p class="room-info">Sala: <span class="code-value">{roomCode}</span></p>
    </header>

    <div class="content">
        {#await scorePromise}
            <div class="loading">Carregando placar...</div>
        {:then teams}
            {#if !teams || teams.length === 0}
                <div class="empty-state">Aguardando jogadores...</div>
            {:else}
                <div class="table-wrapper">
                    <table class="score-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipe</th>
                                <th>Pontos</th>
                                <th>Respostas</th>
                                <th>Feedback</th>
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
                                    <td class="feedback-text">{team.feedback || "-"}</td>
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
    /* Use os mesmos estilos CSS que você já tinha para a tabela */
    .score-container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
    .header { text-align: center; margin-bottom: 30px; }
    .table-wrapper { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .score-table { width: 100%; border-collapse: collapse; }
    .score-table th { background: #f7fafc; padding: 15px; text-align: left; }
    .team-row { border-top: 1px solid #edf2f7; }
    .team-name { padding: 15px; font-weight: 600; }
    .team-score { padding: 15px; font-weight: bold; color: #5a67d8; }
    .rank { padding: 15px; color: #718096; }
    .status-map { display: flex; gap: 4px; padding: 15px; }
    .status-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; }
    .correct { background: #48bb78; }
    .wrong { background: #f56565; }
    .loading, .empty-state { text-align: center; padding: 40px; color: #718096; }
</style>