import { IOptions } from "./spritesheet"

const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electron', {
    openFolderSelect: (defaultPath?: string) => ipcRenderer.invoke('dialog:select-dir', defaultPath),
    openFileSave: (defaultPath?: string) => ipcRenderer.invoke('dialog:save-file', defaultPath),
    spriteSheet: (imagesFolder: string, outputName: string) => ipcRenderer.invoke('spriteSheet', imagesFolder, outputName),
})