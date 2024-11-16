import { resolve } from 'path'
import { spawn, type ChildProcess } from 'child_process'
import type { ViteDevServer } from 'vite'
import { defineConfig, build } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'electron'
import { type AddressInfo } from 'net'

async function bundle(server: ViteDevServer) {
  // resolve the server address
  const address = server.httpServer?.address() as AddressInfo
  const host =
    (address.address === '127.0.0.1' || address.address === "::1")
      ? 'localhost'
      : address.address

  // build the url
  const appUrl = `http://${host}:${address.port}`

  // this is RollupWatcher, but vite do not export its typing...
  const watcher: any = await build({
    configFile: 'vite.config.electron.ts',

    // mode is `development` when running vite 
    // mode is `production` when running vite build
    mode: server.config.mode,

    build: {
      watch: {}, // to make a watcher,
      minify: server.config.mode === "production" ? true : false,
    },
    define: {
      // here we define a vite replacement
      'import.meta.env.ELECTRON_APP_URL': JSON.stringify(appUrl)
    }
  })

  // it returns a string pointing to the electron binary

  // resolve the electron main file
  const electronMain = resolve(
    server.config.root,
    server.config.build.outDir,
    'main.js'
  )

  let child: ChildProcess | undefined

  // exit the process when electron closes
  function exitProcess() {
    process.exit(0)
  }

  // restart the electron process
  function start() {
    if (child) {
      child.kill()
    }

    // @ts-ignore
    child = spawn(electron, [electronMain], {
      windowsHide: false
    })

    child?.on('close', exitProcess)
  }

  function startElectron({ code }: any) {
    if (code === 'END') {
      watcher.off('event', startElectron)
      start()
    }
  }

  watcher.on('event', startElectron)

  // watch the build, on change, restart the electron process
  watcher.on('change', () => {
    // make sure we dont kill our application when reloading
    child?.off('close', exitProcess)

    start()
  })
}

export default defineConfig((env) => ({
  base: env.mode === "production" ? "./" : "/",
  plugins: [
    vue(),
    // this is a vite plugin, configureServer is vite-specific
    {
      name: 'electron-vite',
      configureServer(server) {
        server.httpServer?.on('listening', () => {
          bundle(server).catch(server.config.logger.error)
        })
      }
    }
  ]
}))