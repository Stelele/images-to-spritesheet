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
        openFolderSelect: (defaultPath?: string) => Promise<string?>
        openFileSave: (defaultPath?: string) => Promise<string?>
        spriteSheet: (imagesFolder: string, outputName: string) => Promise<ISpriteSheet>
    }
}

declare module "detect-edges"
declare module "bin-pack"