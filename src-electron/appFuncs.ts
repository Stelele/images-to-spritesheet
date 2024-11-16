import { app, BrowserWindow, ipcMain } from "electron"
import { showFileSave, showFolderSelect } from "./funcs"
import path from 'path';
import { imagesToSpriteSheet } from "./spritesheet";

export function createWindow() {

    let url: string
    let preloadPath: string
    // @ts-ignore
    if (import.meta.env.DEV) {
        // @ts-ignore
        url = import.meta.env.ELECTRON_APP_URL
        preloadPath = path.resolve(app.getAppPath(), "preload.js")
    } else {
        // @ts-ignore
        url = `file:${app.getAppPath()}/dist/${import.meta.env.ELECTRON_APP_URL}`
        preloadPath = path.resolve(app.getAppPath(), "dist", "preload.js")
    }

    const mainWindow: BrowserWindow = new BrowserWindow({
        width: 800,
        height: 600,
        useContentSize: true,
        webPreferences: {
            contextIsolation: true,
            preload: preloadPath
        }
    })

    // @ts-ignore
    if (!import.meta.env.DEV) {
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow?.webContents.closeDevTools()
        })
    }

    mainWindow.loadURL(url)
    mainWindow.setMenuBarVisibility(false)

    return mainWindow
}

export function mapHandlers() {
    ipcMain.handle('dialog:select-dir', showFolderSelect)
    ipcMain.handle('dialog:save-file', showFileSave)
    ipcMain.handle('spriteSheet', imagesToSpriteSheet)
}