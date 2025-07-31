import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        apparel: resolve(__dirname, 'src/apparel.html'),
        board: resolve(__dirname, 'src/board.html'),
        cart: resolve(__dirname, 'src/cart.html'),
        etc: resolve(__dirname, 'src/etc.html'),
        mens: resolve(__dirname, 'src/mens.html'),
        mypage: resolve(__dirname, 'src/mypage.html'),
        sale: resolve(__dirname, 'src/sale.html'),
        sportsbra: resolve(__dirname, 'src/sportsbra.html'),
        story_A: resolve(__dirname, 'src/story_A.html'),
        story: resolve(__dirname, 'src/story.html'),
        index_A: resolve(__dirname, 'index_A.html'),
        index_B: resolve(__dirname, 'index_B.html'),}
    }
  }
})