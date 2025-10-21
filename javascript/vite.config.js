import { defineConfig } from 'vite';
import { resolve } from 'path';

const buildType = process.env.BUILD_TYPE || 'minified';
const isTest = buildType === 'test';
const isMinifiedDebug = buildType === 'minified-debug';

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
    // build modes:
    // - test: no minification, produce source maps
    // - minified-debug: minify but disable name mangling and include inline source maps for debugging
    // - minified: fully minified (default)
    minify: isTest ? false : 'terser',
    sourcemap: isTest || isMinifiedDebug,
    terserOptions: isMinifiedDebug
      ? {
          mangle: false,
          keep_fnames: true,
          keep_classnames: true,
        }
      : undefined,
  },
  server: {
    open: '/examples/index.html',
  },
});
