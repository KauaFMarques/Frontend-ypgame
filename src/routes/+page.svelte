<script>
    import { default as TextInput } from "$lib/components/TextInput.svelte";
    import { default as Button } from "$lib/components/Button.svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    
    let room = $state("");
    let team = $state("");
    let isLoading = $state(false);
    let error = $state("");

    async function setupStorage() {
        if (!room || !team || !room.length || !team.length) {
            error = "Por favor, preencha todos os campos";
            return;
        }

        isLoading = true;
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
                goto(`/${room}/play`);
            } else {
                error = "Falha ao entrar na sala. Verifique o código.";
            }
        } catch (e) {
            error = "Erro de conexão. Tente novamente.";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="home-container">
    <header class="header">
        <h1 class="title">🎯 Quiz Challenge</h1>
        <p class="subtitle">Entre em uma sala e teste seus conhecimentos!</p>
    </header>

    <form id="team-form" action="/{room}/play" class="form">
        <div class="input-group">
            <TextInput 
                bind:value={team} 
                label="Nome da equipe" 
                name="team"
                placeholder="Digite o nome da sua equipe"
            />
            <TextInput 
                bind:value={room} 
                label="Código da sala" 
                name="room"
                placeholder="Digite o código da sala"
            />
        </div>

        {#if error}
            <div class="error-message">
                ⚠️ {error}
            </div>
        {/if}

        <Button 
            type="submit" 
            handler={setupStorage} 
            content={isLoading ? "Entrando..." : "Entrar"} 
            disabled={isLoading}
        />    
    </form>

    <div class="divider">
        <span>ou</span>
    </div>

    <a href="/create" class="create-link">
        <span class="create-icon">➕</span>
        Criar uma nova sala
    </a>
</div>

<style>
    .home-container {
        text-align: center;
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
        margin-bottom: 10px;
    }

    .title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4a5568;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .subtitle {
        font-size: 1.1rem;
        color: #718096;
        font-weight: 400;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .error-message {
        background: linear-gradient(135deg, #fed7d7, #feb2b2);
        color: #c53030;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 500;
        border: 1px solid #fbb6ce;
        animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
        0%, 20%, 40%, 60%, 80% {
            transform: translateX(-2px);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: translateX(2px);
        }
        100% {
            transform: translateX(0);
        }
    }

    .divider {
        display: flex;
        align-items: center;
        margin: 20px 0;
    }

    .divider::before,
    .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    }

    .divider span {
        padding: 0 20px;
        color: #a0aec0;
        font-weight: 500;
    }

    .create-link {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #5a67d8;
        font-weight: 600;
        font-size: 1.1rem;
        padding: 15px 25px;
        border: 2px solid #5a67d8;
        border-radius: 15px;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, rgba(90, 103, 216, 0.1), rgba(90, 103, 216, 0.05));
    }

    .create-link:hover {
        background: linear-gradient(135deg, #5a67d8, #667eea);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(90, 103, 216, 0.3);
    }

    .create-icon {
        font-size: 1.2rem;
        transition: transform 0.3s ease;
    }

    .create-link:hover .create-icon {
        transform: rotate(90deg);
    }

    @media (max-width: 768px) {
        .title {
            font-size: 2rem;
        }
        
        .subtitle {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        .home-container {
            gap: 25px;
        }
        
        .title {
            font-size: 1.8rem;
        }
        
        .create-link {
            padding: 12px 20px;
            font-size: 1rem;
        }
    }
</style>
