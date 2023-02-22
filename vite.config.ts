import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
          '@app': path.resolve(__dirname, './src'),
        },
      },
      plugins: [solidPlugin()],
      server: {
        port: 3030,
      },
      build: {
        target: 'esnext',
      },    
});