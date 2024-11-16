type ISpriteSheet = {
    succeded: false
    error: Error
} | {
    succeded: true
    imageLoc: string
    jsonLoc: string
}

interface Window {
    electron: {
        openFolderSelect: () => Promise<string?>
        openFileSave: () => Promise<string?>
        writeToFile: (fileName: string, data: string | NodeJS.ArrayBufferView) => void
        spriteSheet: (imagesFolder: string, outputName: string) => Promise<ISpriteSheet>
    }
}

declare module "detect-edges"
declare module "bin-pack"