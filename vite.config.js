import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'public/widget.js',  // our real entry
      name: 'TSHChatWidget',
      fileName: 'widget'
    },
    outDir: 'dist',              // what Netlify will serve
    emptyOutDir: true
  }
});
