
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Necessary for GitLab Pages subpath hosting
  define: {
    'process.env': process.env
  }
});
