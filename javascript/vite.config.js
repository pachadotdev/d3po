import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'd3po',
      formats: ['umd'],
      fileName: () => 'd3po.min.js',
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          d3: 'd3',
        },
      },
    },
    minify: 'terser',
    sourcemap: true,
  },
  server: {
    open: '/examples/index.html',
  },
});
