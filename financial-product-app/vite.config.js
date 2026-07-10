import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/client': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/v1': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    }
    }
  },
  build: {
    // Never ship .map files - they reconstruct original source (including
    // comments and variable names) from the minified bundle.
    sourcemap: false,
    // Terser gives real identifier mangling + dead-code removal on top of
    // Rollup's tree-shaking; esbuild's default minifier does not mangle as
    // aggressively and leaves more of the original structure intact.
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: {
        // Do NOT enable mangle.properties - it renames object/JSON keys
        // too, which breaks React internals and any API payload shapes.
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Split large third-party libraries into their own cacheable
        // chunks instead of one multi-megabyte bundle.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/](react|react-dom|react-router-dom)[\\/]/.test(id)) return 'vendor-react';
          if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
          if (/[\\/](jspdf|html2canvas)[\\/]/.test(id)) return 'vendor-pdf';
        },
      },
    },
  },
})
