<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import useLocalStorage from "$lib/storage.svelte.js";
    const { data } = $props();

    const store = useLocalStorage(page.params.room);
    
    async function loadScore(room) {
    	const response = await fetch(`https://yp-ghwh.onrender.com/score?room=${room}`);
    	return response.json();
    }

    // Recarregar dados a cada 5 segundos para atualizar em tempo real
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
        <h1 class="title">🏆 Placar</h1>
        {#if store.value !== undefined}
            <div class="user-score">
                <span class="score-label">Sua pontuação:</span>
                <span class="score-value">{store.value.score}</span>
            </div>
        {/if}
    </header>

    <div class="content">
        {#await scorePromise}
            <div class="loading">
                <div class="spinner"></div>
                <p>Carregando dados...</p>
            </div>
        {:then teams}
            {#if !teams || teams.length === 0}
                <div class="room-info">
                    <div class="room-code">
                        <span class="code-label">Código da sala:</span>
                        <span class="code-value">{page.params.room}</span>
                    </div>
                    <p class="waiting-message">Aguardando equipes se conectarem...</p>
                </div>
            {:else}
                <div class="leaderboard">
                    <h2 class="leaderboard-title">🎯 Ranking das Equipes</h2>
                    <div class="table-container">
                        <table class="score-table">
                            <thead>
                                <tr>
                                    <th scope="col" class="rank-col">#</th>
                                    <th scope="col" class="name-col">Nome da Equipe</th>
                                    <th scope="col" class="score-col">Pontuação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each teams.sort((a, b) => b.score - a.score) as team, index}
                                    <tr class="team-row {index < 3 ? 'podium-' + (index + 1) : ''}" 
                                        class:highlight={store.value && team.team === store.value.team}>
                                        <td class="rank-cell">
                                            {#if index === 0}🥇
                                            {:else if index === 1}🥈
                                            {:else if index === 2}🥉
                                            {:else}{index + 1}
                                            {/if}
                                        </td>
                                        <td class="name-cell">{team.team}</td>
                                        <td class="score-cell">
                                            <span class="points">{team.score}</span>
                                            <span class="points-label">pts</span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        {:catch error}
            <div class="error">
                <div class="error-icon">⚠️</div>
                <p>Falha ao carregar dados: {error}</p>
                <button onclick={() => scorePromise = loadScore(page.params.room)} class="retry-btn">
                    🔄 Tentar Novamente
                </button>
            </div>
        {/await}
    </div>
</div>

<style>
    .score-container {
        display: flex;
        flex-direction: column;
        gap: 30px;
        animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
    }

    .title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4a5568;
        margin-bottom: 15px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-score {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(135deg, #4299e1, #3182ce);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
    }

    .score-label {
        font-size: 0.9rem;
    }

    .score-value {
        font-size: 1.2rem;
        font-weight: 700;
    }

    .content {
        min-height: 200px;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 40px;
        color: #718096;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #5a67d8;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .room-info {
        text-align: center;
        padding: 40px 20px;
    }

    .room-code {
        display: inline-flex;
        flex-direction: column;
        gap: 10px;
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        padding: 25px 35px;
        border-radius: 20px;
        border: 2px solid #e2e8f0;
        margin-bottom: 25px;
    }

    .code-label {
        font-size: 0.9rem;
        color: #718096;
        font-weight: 500;
    }

    .code-value {
        font-size: 2rem;
        font-weight: 700;
        color: #5a67d8;
        font-family: 'Courier New', monospace;
        letter-spacing: 2px;
    }

    .waiting-message {
        color: #718096;
        font-style: italic;
        font-size: 1.1rem;
    }

    .leaderboard-title {
        text-align: center;
        color: #4a5568;
        font-size: 1.8rem;
        font-weight: 600;
        margin-bottom: 25px;
    }

    .table-container {
        overflow-x: auto;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        background: white;
    }

    .score-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
    }

    .score-table th {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 18px 15px;
        font-weight: 600;
        text-align: left;
        font-size: 1rem;
    }

    .rank-col {
        width: 80px;
        text-align: center !important;
    }

    .score-col {
        width: 120px;
        text-align: center !important;
    }

    .team-row {
        border-bottom: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }

    .team-row:hover {
        background: #f7fafc;
        transform: translateX(5px);
    }

    .team-row.highlight {
        background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
        border-left: 4px solid #48bb78;
    }

    .team-row.podium-1 {
        background: linear-gradient(135deg, #fef5e7, #fbd38d);
    }

    .team-row.podium-2 {
        background: linear-gradient(135deg, #f0f4f8, #cbd5e0);
    }

    .team-row.podium-3 {
        background: linear-gradient(135deg, #fdf2f8, #f4a6cd);
    }

    .score-table td {
        padding: 18px 15px;
        font-weight: 500;
    }

    .rank-cell {
        text-align: center;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .name-cell {
        font-weight: 600;
        color: #4a5568;
    }

    .score-cell {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }

    .points {
        font-size: 1.3rem;
        font-weight: 700;
        color: #5a67d8;
    }

    .points-label {
        font-size: 0.8rem;
        color: #718096;
        font-weight: 500;
    }

    .error {
        text-align: center;
        padding: 40px 20px;
        color: #e53e3e;
    }

    .error-icon {
        font-size: 3rem;
        margin-bottom: 20px;
    }

    .retry-btn {
        background: linear-gradient(135deg, #5a67d8, #667eea);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 20px;
    }

    .retry-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(90, 103, 216, 0.3);
    }

    @media (max-width: 768px) {
        .title {
            font-size: 2rem;
        }
        
        .leaderboard-title {
            font-size: 1.5rem;
        }
        
        .code-value {
            font-size: 1.5rem;
        }
        
        .score-table th,
        .score-table td {
            padding: 12px 8px;
        }
        
        .rank-col {
            width: 60px;
        }
        
        .score-col {
            width: 100px;
        }
    }

    @media (max-width: 480px) {
        .score-container {
            gap: 20px;
        }
        
        .user-score {
            padding: 10px 20px;
        }
        
        .room-code {
            padding: 20px 25px;
        }
        
        .points {
            font-size: 1.1rem;
        }
    }
</style>
