import adapter from '@sveltejs/adapter-vercel'; // Alterado para vercel
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// A Vercel agora vai entender automaticamente como publicar seu projeto
		adapter: adapter()
	}
};

export default config;