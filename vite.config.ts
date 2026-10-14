import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode, command }) => {
  const plugins = [react(), tailwindcss()];
  // Source-location tags are a dev-only editing aid; keep them out of production builds
  if (command === 'serve') {
    try {
      // @ts-expect-error - .vite-source-tags.js may not exist in all environments
      const m = await import('./.vite-source-tags.js');
      plugins.push(m.sourceTags());
    } catch {
      // ignore
    }
  }

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    // `npm run dev` talks to the Express server started with `npm run server`
    server: {
      proxy: {
        '/api': 'http://localhost:3000',
        '/uploads': 'http://localhost:3000',
      },
    },
  };
})
