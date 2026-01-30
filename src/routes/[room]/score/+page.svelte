<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    
    // CORREÇÃO: O nome do parâmetro deve ser igual ao nome da pasta [room]
    // Usamos um valor padrão ou uma string vazia para evitar erros de undefined
    const roomCode = $derived(page.params.room || ""); 

    async function loadScore() {
        if (!roomCode) return [];
        try {
            const response = await fetch(`https://yp-game-backend.onrender.com/score?room=${roomCode}`);
            if (!response.ok) throw new Error("Falha ao carregar");
            return await response.json();
        } catch (e) {
            console.error("Erro no fetch:", e);
            return [];
        }
    }

    // Inicializamos como uma Promise para o #await funcionar
    let scorePromise = $state(loadScore());
    
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
                <div class="empty-state">Aguardando jogadores na sala {roomCode}...</div>
            {:else}
                <div class="table-wrapper">
                    <table class="score-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipe</th>
                                <th>Pontos</th>
                                <th>Progresso</th>
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
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        {/await}
    </div>
</div>