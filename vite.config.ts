
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000
  },
  define: {
    // Injetando a chave fornecida para funcionar globalmente
    'process.env.API_KEY': JSON.stringify("AIzaSyA8sW4o-DNyiZhidkR2ZhATdCxe3RZgBMU")
  }
});
