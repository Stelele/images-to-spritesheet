import { IOptions } from "./spritesheet"

const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electron', {
    openFolderSelect: () => ipcRenderer.invoke('dialog:select-dir'),
    openFileSave: () => ipcRenderer.invoke('dialog:save-file'),
    writeToFile: (fileName: string, data: string | NodeJS.ArrayBufferView) => ipcRenderer.invoke('files:save-file', fileName, data),
    spriteSheet: (imagesFolder: string, outputName: string) => ipcRenderer.invoke('spriteSheet', imagesFolder, outputName),
})