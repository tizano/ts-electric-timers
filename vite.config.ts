import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start-plugin';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: [`./tsconfig.json`],
    }),
    tailwindcss(),
    tanstackStart({
      // spa: {
      //   enabled: true,
      // },
      customViteReactPlugin: true,
      target: 'vercel',
    }),
    viteReact(),
  ],
});

export default config;
