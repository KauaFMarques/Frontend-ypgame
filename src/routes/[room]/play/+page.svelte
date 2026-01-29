<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import useLocalStorage from "$lib/storage.svelte.js";
    import { onMount, tick } from "svelte";
    import { default as QuestionList } from "$lib/components/questionList.svelte";
    const { data } = $props();
    
    onMount(() => {
        console.log(page.params.room);
        console.log(localStorage.getItem(page.params.room));
    })

    const store = useLocalStorage(page.params.room);
    
    let team = $state();
    let isAnswering = $state(false);
    let selectedAnswer = $state(null);
    let showResult = $state(false);

    let currentQuestion = $derived.by(() => {
        if (store.value) return data.questions[store.value.results.length];
    });

    let correct = $state();
    let progress = $derived.by(() => {
        if (store.value) {
            return ((store.value.results.length / data.questions.length) * 100).toFixed(1);
        }
        return 0;
    });

    async function handleAnswer(e, answerId) {
        if (isAnswering) return;
        
        isAnswering = true;
        selectedAnswer = answerId;
        
        try {
            // O seu backend em Go usa r.FormValue, então os dados devem ir na URL
            // mesmo sendo um método POST.
            const params = new URLSearchParams({
                "team": String(store.value.teamId),
                "question": String(currentQuestion.id),
                "answer": String(answerId)
            });

            const response = await fetch(`https://yp-game-backend.onrender.com/answer?${params.toString()}`, {
                method: "POST"
                // Removido o Body JSON pois o seu Go está procurando na URL (strconv.Atoi do r.FormValue)
            });
            
            if (response.ok) {
                const result = await response.json();
                correct = result.correct; 
                showResult = true;
                
                setTimeout(async () => {
                    store.value.results.push({
                        questionId: currentQuestion.id,
                        answerId: answerId,
                        correct: correct
                    });
                    
                    if (correct) store.value.score += 1;
                    
                    showResult = false;
                    selectedAnswer = null;
                    isAnswering = false;
                }, 2000);
            } else {
                console.error("Erro no servidor (Status):", response.status);
                isAnswering = false;
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
            isAnswering = false;
        }
    }

    function nextQuestion(e) {
        store.push(correct);
        if (correct) store.increment();
        
        // Reset states
        correct = undefined;
        selectedAnswer = null;
        showResult = false;
        isAnswering = false;

        if (store.value.results.length === data.questions.length) {
            store.value.finished = true;
        } else {
            e.preventDefault();
        }
    }
</script>

<div class="play-container">
    {#if store.value && !store.value.finished}
        <header class="game-header">
            <div class="team-info">
                <span class="team-name">👥 {store.value.team}</span>
                <span class="current-score">🎯 {store.value.score} pts</span>
            </div>
            
            <div class="progress-container">
                <div class="progress-info">
                    <span class="question-count">
                        Pergunta {store.value.results.length + 1} de {data.questions.length}
                    </span>
                    <span class="progress-percent">{progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {progress}%"></div>
                </div>
            </div>
        </header>

        <div class="question-container">
            {#if currentQuestion}
                <div class="question-card">
                    <h2 class="question-text">{currentQuestion.text}</h2>
                    
                    <div class="answers-grid">
                        {#each currentQuestion.answers as answer}
                            <button 
                                class="answer-btn {selectedAnswer === answer.id ? 'selected' : ''} 
                                       {showResult && selectedAnswer === answer.id ? (correct ? 'correct' : 'incorrect') : ''}"
                                onclick={(e) => handleAnswer(e, answer.id)}
                                disabled={isAnswering || showResult}
                            >
                                <span class="answer-text">{answer.text}</span>
                                {#if showResult && selectedAnswer === answer.id}
                                    <span class="result-icon">
                                        {correct ? '✅' : '❌'}
                                    </span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if showResult}
                <div class="result-container">
                    <div class="result-card {correct ? 'success' : 'error'}">
                        <div class="result-icon-large">
                            {correct ? '🎉' : '😞'}
                        </div>
                        <h3 class="result-title">
                            {correct ? 'Correto!' : 'Incorreto!'}
                        </h3>
                        <p class="result-message">
                            {correct 
                                ? 'Parabéns! Você ganhou 1 ponto.' 
                                : 'Não desanime, continue tentando!'}
                        </p>
                        
                        <button 
                            class="next-btn {correct ? 'success' : 'error'}" 
                            onclick={(e) => nextQuestion(e)}
                        >
                            {store.value.results.length === data.questions.length ? 'Ver Resultado Final' : 'Próxima Pergunta'}
                            <span class="next-arrow">→</span>
                        </button>
                    </div>
                </div>
            {/if}
        </div>

    {:else if store.value && store.value.finished}
        <div class="finished-container">
            <div class="finished-card">
                <div class="celebration">🏆</div>
                <h2>Quiz Finalizado!</h2>
                <p class="final-score">Pontuação Final: <strong>{store.value.score} pontos</strong></p>
                <a href="/{page.params.room}/score" class="view-results-btn">
                    Ver Placar Final
                </a>
            </div>
        </div>
    {:else}
        <div class="loading">Carregando dados do time...</div>
    {/if}
</div> <style>
    /* Mova aquele trecho que estava solto para cá, para o início do style */
    .result-card.error {
        background: linear-gradient(135deg, #fff5f5, #fed7d7);
        border: 2px solid #e53e3e;
    }

    .result-icon-large {
        font-size: 3rem;
        margin-bottom: 15px;
    }

    .result-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .result-card.success .result-title {
        color: #22543d;
    }

    .result-card.error .result-title {
        color: #742a2a;
    }

    .result-message {
        font-size: 1rem;
        margin-bottom: 25px;
        opacity: 0.8;
    }

    .next-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 15px 30px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
        color: white;
    }

    .next-btn.success {
        background: linear-gradient(135deg, #48bb78, #38a169);
        box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
    }

    .next-btn.error {
        background: linear-gradient(135deg, #e53e3e, #c53030);
        box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
    }

    .next-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }

    .next-arrow {
        font-size: 1.2rem;
        transition: transform 0.3s ease;
    }

    .next-btn:hover .next-arrow {
        transform: translateX(5px);
    }

    .finished-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
    }

    .finished-card {
        text-align: center;
        padding: 40px;
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        border: 2px solid #e2e8f0;
        max-width: 400px;
        width: 100%;
    }

    .celebration {
        font-size: 4rem;
        margin-bottom: 20px;
        animation: bounce 1s ease infinite;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }

    .finished-card h2 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #4a5568;
        margin-bottom: 15px;
    }

    .final-score {
        font-size: 1.2rem;
        color: #718096;
        margin-bottom: 25px;
    }

    .final-score strong {
        color: #5a67d8;
        font-size: 1.4rem;
    }

    .view-results-btn {
        display: inline-block;
        padding: 15px 30px;
        background: linear-gradient(135deg, #5a67d8, #667eea);
        color: white;
        text-decoration: none;
        border-radius: 25px;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .view-results-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(90, 103, 216, 0.3);
    }

    @media (max-width: 768px) {
        .game-header {
            padding: 15px;
        }
        
        .team-info {
            flex-direction: column;
            gap: 10px;
            text-align: center;
        }
        
        .question-card {
            padding: 25px 20px;
        }
        
        .question-text {
            font-size: 1.2rem;
        }
        
        .answer-btn {
            padding: 15px 20px;
        }
    }

    @media (max-width: 480px) {
        .play-container {
            gap: 20px;
        }
        
        .question-text {
            font-size: 1.1rem;
        }
        
        .result-card,
        .finished-card {
            padding: 25px 20px;
        }
        
        .celebration {
            font-size: 3rem;
        }
    }
</style>