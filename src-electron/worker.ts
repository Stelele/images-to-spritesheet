import { Canvas, loadImage } from "skia-canvas";
import cropping from "detect-edges";
import pack from "bin-pack";
import { glob } from "glob";
import fs from "fs"
import { parentPort } from "worker_threads"

const defaultOptions = {
    outputFormat: "png",
    margin: 1,
    crop: true,
    outputName: "spritesheet.png",
};

type IOptions = Partial<typeof defaultOptions>

parentPort?.on("message", async (data) => {
    const { dirPath, output } = data
    parentPort?.postMessage(await imagesToSpriteSheet(dirPath, output))
})


/**
 * @typedef {Object} Options
 * @prop {String} [outputFormat="png"] - Format of the output image ("png" or "jpeg")
 * @prop {Number} [margin=1] - Added pixels between sprites (can prevent pixels leaking to adjacent sprite)
 * @prop {Boolean} [crop=true] - Cut transparent pixels around sprites
 * @prop {String} [outputName="spritesheet.png"] - Name of the image file (for reference in the JSON file)
 */
/**
 * Pack some images into a spritesheet.
 * @param {Array<String>} paths - List of paths to the images
 * @param {Options} [options] - Some options
 * @returns {Promise<{json: Object, buffer: Buffer}>}
 */
async function spriteSheet(paths: string[], options: IOptions, prefix: string, outputFile: string) {
    const { outputFormat, margin, crop, outputName } = {
        ...defaultOptions,
        ...options,
    };

    // Check input path
    if (!paths || !paths.length) {
        throw new Error("No file given.");
    }

    // Check outputFormat
    const supportedFormat = ["png", "jpeg"];
    if (!supportedFormat.includes(outputFormat)) {
        const supported = JSON.stringify(supportedFormat);
        throw new Error(`outputFormat should only be one of ${supported}, but "${outputFormat}" was given.`);
    }

    // FIXME: can read JSON module when supported
    const homepage = "Image to Spritesheet"
    const version = "1.0.0"

    // Load all images
    const loads = paths.map(path => loadImage(path));
    const images = await Promise.all(loads);

    // Crop all image
    const data = await Promise.all(images.map(async (source) => {
        const { width, height } = source;
        const playground = new Canvas(width, height);
        const playgroundContext = playground.getContext("2d");
        playgroundContext.drawImage(source, 0, 0);

        // @ts-ignore
        const cropped = crop ? await cropping(playground) : {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        }

        return {
            width: (width - cropped.left - cropped.right) + margin,
            height: (height - cropped.top - cropped.bottom) + margin,
            source,
            cropped,
        };
    }));

    // Pack images
    const { items, width, height } = pack(data);

    const canvas = new Canvas(width + margin, height + margin);
    const context = canvas.getContext("2d");

    // Draw all images on the destination canvas
    items.forEach(({ x, y, item }: { x: number; y: number; item: any }) => {
        context.drawImage(item.source, x - item.cropped.left + margin, y - item.cropped.top + margin);
    });

    // Write JSON
    const json = {
        // Global data about the generated file
        meta: {
            app: homepage,
            version,
            image: outputName,
            size: {
                w: width,
                h: height,
            },
            scale: 1,
        },
        frames: items
            .sort((a: any, b: any) => a.item.source.src.localeCompare(b.item.source.src))
            .reduce((acc: any, { x, y, width: w, height: h, item }: any) => {
                acc[item.source.src.replace(`${prefix}\\`, "")] = {
                    // Position and size in the spritesheet
                    frame: {
                        x: x + margin,
                        y: y + margin,
                        w: w - margin,
                        h: h - margin,
                    },
                    rotated: false,
                    trimmed: Object.values(item.cropped).some((value: any) => value > 0),
                    // Relative position and size of the content
                    spriteSourceSize: {
                        x: item.cropped.left,
                        y: item.cropped.top,
                        w: w - margin,
                        h: h - margin,
                    },
                    // File image sizes
                    sourceSize: {
                        w: item.source.width,
                        h: item.source.height,
                    },
                };
                return acc;
            }, {} as any),
    };

    // Write image
    const image = await canvas.toBuffer("png");

    return {
        json,
        image,
    };
}

async function imagesToSpriteSheet(dirPath: string, output: string) {
    const pngFiles = (await glob(`${dirPath.replaceAll("\\", "/")}/**/*.png`)).sort()

    const options: IOptions = {
        outputFormat: "png",
        outputName: `${output}.png`,
    }

    const { json, image } = await spriteSheet(pngFiles, options, dirPath, output);

    fs.writeFile(`${output}.png`, image, (err) => (console.error(err)));
    fs.writeFile(`${output}.json`, JSON.stringify(json, undefined, 4), (err) => (console.error(err)));

    return {
        succeded: true,
        imageLoc: `${output}.png`,
        jsonLoc: `${output}.json`,
    }
}
