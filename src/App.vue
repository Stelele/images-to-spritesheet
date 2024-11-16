<template>
  <div class="hero bg-base-200 min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">Images To Spritesheet!</h1>
        <p class="py-6">
          This is a simple tool to create a spritesheet from a bunch of images in a folder in your computer. The search
          for the images is recursive so you only need to select the root folder
        </p>
      </div>
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <div class="skeleton h-80 w-full" v-if="isProccessing"></div>
          <div class="form-control" v-if="!isProccessing">
            <label class="label">
              <span class="label-text">Select your images folder</span>
            </label>
            <label class="input input-bordered text-neutral-500 cursor-pointer overflow-clip p-2 h-10"
              @click="selectImageFolder">
              {{ imgFolder }}
            </label>
          </div>
          <div class="form-control" v-if="!isProccessing">
            <label class="label">
              <span class="label-text">Select where you want to save the spritesheet</span>
            </label>
            <label class="input input-bordered text-neutral-500 cursor-pointer overflow-clip p-2 h-10"
              @click="selectSaveLocation">
              {{ sprteOut }}
            </label>
          </div>
          <div class="form-control mt-6" v-if="!isProccessing">
            <button class="btn btn-primary" @click="createSpriteSheet" :disabled="!canCreateImage">
              Create Spritesheet
            </button>
          </div>
          <div class="form-control mt-6" v-if="!isProccessing">
            <label class="text-slate-400 text-wrap p-2">
              <pre class="text-wrap"> {{ statusMessage }} </pre>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

const imagesFolder = ref('')
const spriteSheetOut = ref('')
const statusMessage = ref('')

const imgFolder = computed(() => imagesFolder.value.length ? imagesFolder.value : "Browse")
const sprteOut = computed(() => spriteSheetOut.value.length ? spriteSheetOut.value : "Browse")
const canCreateImage = computed(() => !!imagesFolder.value.length && !!spriteSheetOut.value.length)

const isProccessing = ref(false)

async function selectImageFolder() {
  const folder = await window.electron.openFolderSelect()
  if (!folder) return
  imagesFolder.value = folder
}

async function selectSaveLocation() {
  const saveLoc = await window.electron.openFileSave()
  if (!saveLoc) return
  spriteSheetOut.value = saveLoc
}

async function createSpriteSheet() {
  if (!imagesFolder.value.length) return
  if (!spriteSheetOut.value.length) return

  isProccessing.value = true
  const response = await window.electron.spriteSheet(imagesFolder.value, spriteSheetOut.value)

  if (response.succeded) {
    statusMessage.value = `Success!!
You can find your spritesheet and json file at:
image:
  ${response.imageLoc}
json:
  ${response.jsonLoc}`
  } else {
    statusMessage.value = `Errror:
${JSON.stringify(response.error, undefined, 4)}`
  }
  isProccessing.value = false
}

</script>