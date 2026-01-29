<script>
    import { page } from "$app/state";
    import useLocalStorage from "$lib/storage.svelte.js";
    import { onMount } from "svelte";

    const { data } = $props();
    const store = useLocalStorage(page.params.room);
    
    let isAnswering = $state(false);
    let selectedAnswer = $state(null);
    let showResult = $state(false);
    let correct = $state(null);

    // Derivado: define qual pergunta mostrar baseado em quantos resultados já temos
    let currentQuestion = $derived.by(() => {
        if (store.value && data.questions) {
            return data.questions[store.value.results.length];
        }
    });

    let progress = $derived.by(() => {
        if (store.value && data.questions.length > 0) {
            return ((store.value.results.length / data.questions.length) * 100).toFixed(0);
        }
        return 0;
    });

    async function handleAnswer(answerId) {
        if (isAnswering || showResult) return;
        
        isAnswering = true;
        selectedAnswer = answerId;
        
        try {
            const params = new URLSearchParams({
                "team": String(store.value.teamId),
                "question": String(currentQuestion.id),
                "answer": String(answerId)
            });

            const response = await fetch(`https://yp-game-backend.onrender.com/answer?${params.toString()}`, {
                method: "POST"
            });
            
            if (response.ok) {
                const result = await response.json();
                correct = result.correct; 
                showResult = true;
                
                // ATENÇÃO: Agora salvamos APENAS AQUI para evitar pular perguntas
                store.value.results.push({
                    questionId: currentQuestion.id,
                    answerId: answerId,
                    correct: correct
                });
                
                if (correct) store.value.score += 1;
            }
        } catch (err) {
            console.error("Erro:", err);
        } finally {
            isAnswering = false;
        }
    }

    function goToNext() {
        // Apenas reseta o feedback visual. 
        // A próxima pergunta aparecerá automaticamente por causa do $derived
        showResult = false;
        selectedAnswer = null;
        correct = null;

        if (store.value.results.length === data.questions.length) {
            store.value.finished = true;
        }
    }
</script>

<div class="play-container">
    {#if store.value && !store.value.finished}
        <header class="game-header">
            <div class="header-top">
                <span class="team-badge">👥 {store.value.team}</span>
                <span class="score-badge">🎯 {store.value.score} <small>pts</small></span>
            </div>
            
            <div class="progress-section">
                <div class="progress-labels">
                    <span>Pergunta {store.value.results.length + 1} de {data.questions.length}</span>
                    <span>{progress}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: {progress}%"></div>
                </div>
            </div>
        </header>

        <main class="question-area">
            {#if currentQuestion}
                <div class="question-card" class:blur={showResult}>
                    <h2 class="question-text">{currentQuestion.text}</h2>
                    
                    <div class="answers-grid">
                        {#each currentQuestion.answers as answer}
                            <button 
                                class="answer-btn"
                                class:selected={selectedAnswer === answer.id}
                                class:correct={showResult && selectedAnswer === answer.id && correct}
                                class:incorrect={showResult && selectedAnswer === answer.id && !correct}
                                onclick={() => handleAnswer(answer.id)}
                                disabled={showResult}
                            >
                                <span class="answer-text">{answer.text}</span>
                                {#if showResult && selectedAnswer === answer.id}
                                    <span>{correct ? '✅' : '❌'}</span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if showResult}
                <div class="modal-overlay">
                    <div class="result-modal" class:is-correct={correct}>
                        <div class="result-icon">{correct ? '🎉' : '😓'}</div>
                        <h3>{correct ? 'Excelente!' : 'Não foi dessa vez'}</h3>
                        <p>{correct ? 'Você acertou e ganhou 1 ponto.' : 'Estude mais este ponto para a próxima!'}</p>
                        
                        <button class="continue-btn" onclick={goToNext}>
                            {store.value.results.length === data.questions.length ? 'Finalizar Quiz' : 'Próxima Pergunta'}
                        </button>
                    </div>
                </div>
            {/if}
        </main>

    {:else if store.value?.finished}
        <div class="finish-screen">
            <div class="finish-card">
                <div class="trophy">🏆</div>
                <h2>Parabéns, {store.value.team}!</h2>
                <div class="final-score-box">
                    <span>Pontuação Final</span>
                    <strong>{store.value.score}</strong>
                </div>
                <a href="/{page.params.room}/score" class="results-link">Ver Ranking Geral</a>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background-color: #f0f2f5;
        margin: 0;
        font-family: 'Inter', system-ui, sans-serif;
    }

    .play-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
    }

    /* HEADER */
    .game-header {
        background: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        margin-bottom: 24px;
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }

    .team-badge, .score-badge {
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.9rem;
    }

    .team-badge { background: #e0e7ff; color: #4338ca; }
    .score-badge { background: #fef3c7; color: #92400e; }

    /* PROGRESS BAR */
    .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #6b7280;
        margin-bottom: 8px;
    }

    .progress-track {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #10b981;
        transition: width 0.4s ease;
    }

    /* QUESTION CARD */
    .question-card {
        background: white;
        padding: 32px;
        border-radius: 24px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        transition: filter 0.3s;
    }

    .question-card.blur { filter: blur(4px); pointer-events: none; }

    .question-text {
        font-size: 1.25rem;
        color: #1f2937;
        margin-bottom: 24px;
        line-height: 1.5;
    }

    .answers-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .answer-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border: 2px solid #f3f4f6;
        border-radius: 12px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    }

    .answer-btn:hover:not(:disabled) {
        border-color: #6366f1;
        background: #f8fafc;
    }

    .answer-btn.correct { background: #d1fae5; border-color: #10b981; color: #065f46; }
    .answer-btn.incorrect { background: #fee2e2; border-color: #ef4444; color: #991b1b; }

    /* MODAL RESULTADO */
    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 100;
    }

    .result-modal {
        background: white;
        padding: 40px;
        border-radius: 24px;
        text-align: center;
        max-width: 400px;
        width: 100%;
        animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .result-icon { font-size: 4rem; margin-bottom: 16px; }

    .continue-btn {
        margin-top: 24px;
        width: 100%;
        padding: 16px;
        border: none;
        border-radius: 12px;
        background: #1f2937;
        color: white;
        font-weight: 700;
        cursor: pointer;
    }

    /* TELA FINAL */
    .finish-screen {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
    }

    .finish-card {
        background: white;
        padding: 48px;
        border-radius: 32px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }

    .trophy { font-size: 5rem; margin-bottom: 20px; }

    .final-score-box {
        margin: 24px 0;
        padding: 20px;
        background: #f8fafc;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
    }

    .final-score-box strong { font-size: 3rem; color: #6366f1; }

    .results-link {
        color: #6366f1;
        text-decoration: none;
        font-weight: 600;
    }
</style>