import { dialog, IpcMainInvokeEvent } from "electron"

export async function showFolderSelect(e: IpcMainInvokeEvent, defaultDir?: string) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        buttonLabel: "Select Folder",
        properties: ['openDirectory'],
        defaultPath: defaultDir,
    })

    if (!canceled) return filePaths[0]
}

export async function showFileSave(e: IpcMainInvokeEvent, defaultDir?: string) {
    const { canceled, filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save File",
        properties: ['createDirectory'],
        defaultPath: defaultDir,
    })

    if (!canceled) return filePath
}