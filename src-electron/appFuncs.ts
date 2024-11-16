import { app, BrowserWindow, ipcMain } from "electron"
import { showFileSave, showFolderSelect, writeFile } from "./funcs"
import path from 'path';
import { imagesToSpriteSheet } from "./spritesheet";

export function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        useContentSize: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.resolve(app.getAppPath(), "preload.js")
        }
    })

    mainWindow.setMenuBarVisibility(false)
    // when in dev mode, load the url and open the dev tools
    // @ts-ignore
    if (import.meta.env.DEV) {
        // @ts-ignore
        mainWindow.loadURL(import.meta.env.ELECTRON_APP_URL)
        // mainWindow?.webContents.openDevTools()
    } else {
        // in production, close the dev tools
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow?.webContents.closeDevTools()
        })

        // load the build file instead
        // @ts-ignore
        mainWindow.loadFile(import.meta.env.ELECTRON_APP_URL)
    }

    return mainWindow
}

export function mapHandlers() {
    ipcMain.handle('dialog:select-dir', showFolderSelect)
    ipcMain.handle('dialog:save-file', showFileSave)
    ipcMain.handle('files:save-file', writeFile)
    ipcMain.handle('spriteSheet', imagesToSpriteSheet)
}