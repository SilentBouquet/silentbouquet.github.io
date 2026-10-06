import path from "path"
import fs from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// GitHub Pages 无 SPA 回退：构建后把 index.html 复制为 404.html，
// 使直接访问/刷新子路由（如 /write）时仍能渲染应用。
function spa404(): import("vite").Plugin {
  return {
    name: "spa-404",
    closeBundle() {
      const src = path.resolve(__dirname, "dist/index.html")
      const dst = path.resolve(__dirname, "dist/404.html")
      if (fs.existsSync(src)) fs.copyFileSync(src, dst)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), spa404()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
