import { app, BrowserWindow } from 'electron'
import { createWindow, mapHandlers } from './appFuncs'

let mainWindow: BrowserWindow | undefined

app.whenReady().then(() => {
    mainWindow = createWindow()
    mapHandlers()
    mainWindow.on('closed', () => {
        mainWindow = undefined
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow == null) {
        mainWindow = createWindow()
    }
})