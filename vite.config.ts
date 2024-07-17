import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'src/script/githubEventHandler.ts',
      output: {
        entryFileNames: 'script/[name].js',
        chunkFileNames: 'script/[name].js',
        assetFileNames: 'script/[name].[ext]',
      },
    },
  },
});
