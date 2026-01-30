<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    
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

    let scorePromise = $state(loadScore());
    
    onMount(() => {
        const interval = setInterval(() => {
            scorePromise = loadScore();
        }, 5000);
        return () => clearInterval(interval);
    });
</script>

<style>
    :global(body) {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        color: #f1f5f9;
    }

    .score-container {
        max-width: 1100px;
        margin: 40px auto;
        padding: 24px;
    }

    .header {
        text-align: center;
        margin-bottom: 30px;
    }

    .title {
        font-size: 2.4rem;
        margin: 0;
        letter-spacing: 1px;
    }

    .room-info {
        margin-top: 8px;
        font-size: 1rem;
        opacity: 0.8;
    }

    .code-value {
        font-weight: bold;
        color: #38bdf8;
        font-size: 1.1rem;
    }

    .content {
        margin-top: 20px;
    }

    .loading,
    .empty-state {
        text-align: center;
        padding: 30px;
        font-size: 1.2rem;
        opacity: 0.7;
    }

    .table-wrapper {
        background: #0b1220;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        overflow-x: auto;
    }

    .score-table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        background: #1e293b;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    th, td {
        padding: 14px 12px;
        text-align: center;
    }

    th {
        opacity: 0.7;
    }

    .team-row {
        border-bottom: 1px solid rgba(255,255,255,0.05);
        transition: background 0.2s ease, transform 0.15s ease;
    }

    .team-row:hover {
        background: rgba(56, 189, 248, 0.08);
        transform: scale(1.01);
    }

    .rank {
        font-weight: bold;
        font-size: 1.1rem;
        width: 60px;
    }

    .team-row:nth-child(1) .rank {
        color: #facc15;
        font-size: 1.3rem;
    }

    .team-row:nth-child(2) .rank {
        color: #cbd5e1;
    }

    .team-row:nth-child(3) .rank {
        color: #f97316;
    }

    .team-name {
        text-align: left;
        font-weight: 600;
        font-size: 1rem;
        padding-left: 20px;
    }

    .team-score {
        font-size: 1.4rem;
        font-weight: bold;
        color: #38bdf8;
    }

    .status-map {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
    }

    .status-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    .status-dot.correct {
        background: linear-gradient(135deg, #22c55e, #16a34a);
    }

    .status-dot.wrong {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    @media (max-width: 768px) {
        .team-name {
            font-size: 0.9rem;
        }

        .team-score {
            font-size: 1.1rem;
        }

        .status-dot {
            width: 22px;
            height: 22px;
            font-size: 0.7rem;
        }
    }
</style>

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
