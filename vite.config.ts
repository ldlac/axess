import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'mdb-parser': path.resolve(__dirname, 'mdb-parser/src/MDBReader.ts'),
    },
  },
});
