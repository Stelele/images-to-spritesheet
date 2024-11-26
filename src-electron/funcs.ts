import { dialog, IpcMainInvokeEvent } from "electron"
import { Worker } from "worker_threads"

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

export async function imagesToSpriteSheet(e: IpcMainInvokeEvent, dirPath: string, output: string) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("worker.js", import.meta.url))
        worker.postMessage({ dirPath, output })

        worker.on('message', resolve)
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(
                    `Stopped the Worker Thread with the exit code: ${code}`))
            }
        })
    })
}