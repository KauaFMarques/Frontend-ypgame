<script>
    import { default as TextInput } from "$lib/components/TextInput.svelte";
    import { default as Button } from "$lib/components/Button.svelte";
    import { page } from "$app/state";
    
    let room = $state("");
    let team = $state("");
    let loading = $state(false);
    let error = $state("");

    async function setupStorage() {
        if (!room || !team || !room.length || !team.length) {
            error = "Por favor, preencha todos os campos";
            return;
        }

        loading = true;
        error = "";

        try {
            localStorage.removeItem(room);
            const response = await fetch(`https://yp-ghwh.onrender.com/join?room=${room}&team=${team}`, {
                method: "POST",
            });
            
            if (response.ok) {
                const body = await response.json();
                
                const session = {
                    team: team,
                    teamId: body.id,
                    score: 0,
                    finished: false,
                    results: [],
                };
                
                localStorage.clear();
                localStorage.setItem(room, JSON.stringify(session));
                console.log("Joined room.");
            } else {
                const errorData = await response.json().catch(() => ({}));
                error = errorData.message || "Falha ao entrar na sala. Verifique o código.";
            }
        } catch (err) {
            error = "Erro de conexão. Tente novamente.";
            console.error("Error joining room:", err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="main-container">
    <div class="hero-section">
        <div class="logo">
            <div class="quiz-icon">🧠</div>
            <h1>QuizMaster</h1>
        </div>
        
        <p class="subtitle">
            Teste seus conhecimentos e compete com seus amigos!
        </p>
    </div>

    <div class="join-section">
        <div class="card">
            <h2>🎯 Entrar no Jogo</h2>
            <p class="description">Digite o código da sala e o nome da sua equipe para começar</p>
            
            <form id="team-form" action="/{room}/play" class="form">
                <div class="input-group">
                    <TextInput 
                        bind:value={room} 
                        label="Código da Sala" 
                        name="room" 
                        placeholder="Ex: ABC123"
                        disabled={loading}
                    />
                </div>
                
                <div class="input-group">
                    <TextInput 
                        bind:value={team} 
                        label="Nome da Equipe" 
                        name="team" 
                        placeholder="Ex: Os Gênios"
                        disabled={loading}
                    />
                </div>

                {#if error}
                    <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        {error}
                    </div>
                {/if}

                <Button 
                    type="submit" 
                    handler={setupStorage} 
                    content={loading ? "Entrando..." : "🚀 Entrar na Sala"}
                    disabled={loading}
                    class="join-btn"
                />
            </form>
        </div>
    </div>

    <div class="actions-section">
        <div class="divider">
            <span>ou</span>
        </div>
        
        <a href="/create" class="create-link">
            <div class="create-card">
                <div class="create-icon">➕</div>
                <div class="create-info">
                    <h3>Criar Nova Sala</h3>
                    <p>Seja o professor e crie uma nova sala de quiz</p>
                </div>
                <div class="arrow">→</div>
            </div>
        </a>
    </div>

    <div class="features">
        <div class="feature-grid">
            <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <h4>Rápido</h4>
                <p>Entre e comece a jogar em segundos</p>
            </div>
            <div class="feature-item">
                <div class="feature-icon">🏆</div>
                <h4>Competitivo</h4>
                <p>Compete com outras equipes em tempo real</p>
            </div>
            <div class="feature-item">
                <div class="feature-icon">🎉</div>
                <h4>Divertido</h4>
                <p>Perguntas interessantes e feedback imediato</p>
            </div>
        </div>
    </div>
</div>

<style>
    .main-container {
        min-height: 100vh;
        width: 100%;
        padding: 20px;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .hero-section {
        text-align: center;
        margin-bottom: 40px;
        color: white;
    }

    .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;
    }

    .quiz-icon {
        font-size: 4em;
        margin-bottom: 10px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .hero-section h1 {
        font-size: 3em;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        font-weight: 700;
    }

    .subtitle {
        font-size: 1.3em;
        opacity: 0.9;
        max-width: 500px;
        margin: 0 auto;
        line-height: 1.5;
    }

    .join-section {
        width: 100%;
        max-width: 450px;
        margin-bottom: 40px;
    }

    .card {
        background: white;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        text-align: center;
    }

    .card h2 {
        color: #333;
        margin-bottom: 10px;
        font-size: 1.8em;
        font-weight: 600;
    }

    .description {
        color: #666;
        margin-bottom: 30px;
        line-height: 1.5;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .input-group {
        text-align: left;
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #ffebee;
        color: #c62828;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.9em;
        border-left: 4px solid #f44336;
    }

    .error-icon {
        font-size: 1.2em;
    }

    :global(.join-btn) {
        background: linear-gradient(135deg, #4CAF50, #45a049) !important;
        color: white !important;
        border: none !important;
        padding: 15px 30px !important;
        border-radius: 25px !important;
        font-weight: 600 !important;
        font-size: 1.1em !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
    }

    :global(.join-btn:hover:not(:disabled)) {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
    }

    :global(.join-btn:disabled) {
        opacity: 0.7 !important;
        cursor: not-allowed !important;
        transform: none !important;
    }

    .actions-section {
        width: 100%;
        max-width: 450px;
        margin-bottom: 40px;
    }

    .divider {
        text-align: center;
        position: relative;
        margin: 30px 0;
        color: white;
        opacity: 0.8;
    }

    .divider::before,
    .divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background: rgba(255, 255, 255, 0.3);
    }

    .divider::before {
        left: 0;
    }

    .divider::after {
        right: 0;
    }

    .divider span {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 0 20px;
    }

    .create-link {
        text-decoration: none;
        color: inherit;
        display: block;
    }

    .create-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s ease;
        cursor: pointer;
        color: white;
    }

    .create-card:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .create-icon {
        font-size: 2em;
        background: rgba(255, 255, 255, 0.2);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .create-info {
        flex: 1;
        text-align: left;
    }

    .create-info h3 {
        margin: 0 0 5px 0;
        font-size: 1.3em;
        font-weight: 600;
    }

    .create-info p {
        margin: 0;
        opacity: 0.8;
        font-size: 0.95em;
    }

    .arrow {
        font-size: 1.5em;
        opacity: 0.7;
        transition: transform 0.3s ease;
    }

    .create-card:hover .arrow {
        transform: translateX(5px);
    }

    .features {
        width: 100%;
        max-width: 800px;
        margin-top: 20px;
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .feature-item {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 25px;
        text-align: center;
        color: white;
        transition: transform 0.3s ease;
    }

    .feature-item:hover {
        transform: translateY(-5px);
    }

    .feature-icon {
        font-size: 2.5em;
        margin-bottom: 15px;
    }

    .feature-item h4 {
        margin: 0 0 10px 0;
        font-size: 1.2em;
        font-weight: 600;
    }

    .feature-item p {
        margin: 0;
        opacity: 0.9;
        font-size: 0.9em;
        line-height: 1.4;
    }

    @media (max-width: 768px) {
        .main-container {
            padding: 15px;
        }
        
        .hero-section h1 {
            font-size: 2.5em;
        }
        
        .subtitle {
            font-size: 1.1em;
        }
        
        .quiz-icon {
            width: 100px;
            height: 100px;
            font-size: 3em;
        }
        
        .card {
            padding: 30px 25px;
        }
        
        .create-card {
            flex-direction: column;
            text-align: center;
            gap: 15px;
        }
        
        .create-info {
            text-align: center;
        }
        
        .feature-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .feature-item {
            padding: 20px;
        }
    }

    @media (max-width: 480px) {
        .hero-section h1 {
            font-size: 2em;
        }
        
        .card {
            padding: 25px 20px;
        }
    }
</style>
