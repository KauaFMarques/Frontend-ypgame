<script>
	import { goto } from "$app/navigation";
	import { default as TextInput } from "$lib/components/TextInput.svelte"; 
	import { default as Button } from "$lib/components/Button.svelte";
	
	let room = $state("");
	let prof = $state("");
	let isLoading = $state(false);
	let error = $state("");
	
	async function createRoom(e) {
		if (!prof || !room || !prof.length || !room.length) {
			error = "Por favor, preencha todos os campos";
			return;
		}
		
		isLoading = true;
		error = "";
		
		try {
			const response = await fetch(`https://yp-game-backend.onrender.com/room?prof=${prof}&room=${room}`, {
				method: "POST",
			});
			
			if (response.ok) {
				const code = (await response.json()).id;
				console.log("Code: ", code);
				goto(`/${code}/score`);
			} else {
				error = "Falha ao criar a sala. Tente novamente.";
				e.preventDefault();
			}
		} catch (err) {
			error = "Erro de conexão. Tente novamente.";
			e.preventDefault();
		} finally {
			isLoading = false;
		}
	}	
</script>

<div class="create-container">
	<header class="header">
		<div class="back-button">
			<a href="/" class="back-link">
				← Voltar
			</a>
		</div>
		<h1 class="title">🏫 Criar Nova Sala</h1>
		<p class="subtitle">Configure sua sala de quiz personalizada</p>
	</header>

	<form class="form">
		<div class="input-group">
			<TextInput 
				bind:value={room} 
				label="Nome da sala" 
				name="room"
				placeholder="Ex: Quiz de História - Turma A"
			/>

			<TextInput 
				bind:value={prof} 
				label="Nome do professor" 
				name="prof" 
				placeholder="Digite seu nome"
				required 
			/>
		</div>

		{#if error}
			<div class="error-message">
				⚠️ {error}
			</div>
		{/if}

		<Button 
			handler={(e) => createRoom(e)} 
			content={isLoading ? "Criando..." : "Criar Sala"} 
			type="submit"
			disabled={isLoading}
		/>
	</form>

	<div class="info-card">
		<h3>📋 Como funciona?</h3>
		<ul>
			<li>Crie sua sala com um nome descritivo</li>
			<li>Compartilhe o código gerado com os alunos</li>
			<li>Acompanhe as pontuações em tempo real</li>
		</ul>
	</div>
</div>

<style>
	.create-container {
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
		position: relative;
	}

	.back-button {
		position: absolute;
		left: 0;
		top: 0;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: #5a67d8;
		font-weight: 500;
		padding: 8px 15px;
		border-radius: 10px;
		transition: all 0.3s ease;
		background: rgba(90, 103, 216, 0.1);
	}

	.back-link:hover {
		background: rgba(90, 103, 216, 0.2);
		transform: translateX(-3px);
	}

	.title {
		font-size: 2.2rem;
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

	.info-card {
		background: linear-gradient(135deg, #f7fafc, #edf2f7);
		border: 1px solid #e2e8f0;
		border-radius: 15px;
		padding: 25px;
		margin-top: 10px;
	}

	.info-card h3 {
		color: #4a5568;
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.info-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.info-card li {
		color: #718096;
		margin-bottom: 8px;
		padding-left: 20px;
		position: relative;
		font-weight: 500;
	}

	.info-card li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: #48bb78;
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.title {
			font-size: 1.8rem;
		}
		
		.back-button {
			position: static;
			margin-bottom: 20px;
		}
		
		.header {
			text-align: left;
		}
	}

	@media (max-width: 480px) {
		.create-container {
			gap: 25px;
		}
		
		.title {
			font-size: 1.6rem;
		}
		
		.info-card {
			padding: 20px;
		}
	}
</style>
