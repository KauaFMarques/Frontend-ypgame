<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
	<div class="content-wrapper">
		{@render children?.()}
	</div>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		color: #333;
		line-height: 1.6;
	}

	.app-container {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.content-wrapper {
		width: 100%;
		max-width: 600px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 20px;
		padding: 40px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
	}

	.content-wrapper:hover {
		transform: translateY(-5px);
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 768px) {
		.app-container {
			padding: 10px;
		}
		
		.content-wrapper {
			padding: 30px 20px;
			max-width: 100%;
		}
	}

	@media (max-width: 480px) {
		.content-wrapper {
			padding: 25px 15px;
		}
	}
</style>