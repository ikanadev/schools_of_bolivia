import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
          '@app': path.resolve(__dirname, './src'),
        },
      },
      plugins: [],
      server: {
        port: 3030,
      },
      build: {
        target: 'esnext',
      },    
});