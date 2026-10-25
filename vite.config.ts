import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// packs everything (code, pictures, sounds) into one index.html for itch.io
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
})
