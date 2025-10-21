import { defineConfig } from 'vite';
import { resolve } from 'path';

const buildType = process.env.BUILD_TYPE || 'minified';
const isTest = buildType === 'test';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'd3po',
      formats: ['umd'],
      // use a different filename for test build to avoid confusion if desired
      fileName: () => (isTest ? 'd3po.js' : 'd3po.min.js'),
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          d3: 'd3',
        },
      },
    },
    // for test builds: no minification and produce source maps
    // for normal builds: minify with terser and skip source maps
    minify: isTest ? false : 'terser',
    sourcemap: isTest,
  },
  server: {
    open: '/examples/index.html',
  },
});
