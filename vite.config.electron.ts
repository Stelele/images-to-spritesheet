import { defineConfig } from 'vite'

export default defineConfig((env) => ({
  publicDir: false,
  build: {
    // we build on top of vite, do not delete the generated files
    emptyOutDir: false,
    ssr: true,
    rollupOptions: {
      input: [
        'src-electron/main.ts',
        'src-electron/preload.ts',
        'src-electron/worker.ts'
      ]
    },
    minify: env.mode === "production" ? true : false,
  },
  define: {
    // once again
    'import.meta.env.ELECTRON_APP_URL': JSON.stringify('index.html')
  }
}))
