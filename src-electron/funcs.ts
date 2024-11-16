import { dialog, IpcMainInvokeEvent } from "electron"
import fs from "fs"

export async function showFolderSelect(e: IpcMainInvokeEvent) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        buttonLabel: "Select Folder",
        properties: ['openDirectory'],
    })

    if (!canceled) return filePaths[0]
}

export async function showFileSave(e: IpcMainInvokeEvent) {
    const { canceled, filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save File",
        properties: ['createDirectory']
    })

    if (!canceled) return filePath
}


export function writeFile(e: IpcMainInvokeEvent, fileName: string, data: string | NodeJS.ArrayBufferView) {
    fs.writeFileSync(fileName, data)
}