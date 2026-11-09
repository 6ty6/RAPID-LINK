import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, statSync, readFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { spaRoutes } from './src/prerender/routes.js'

export default defineConfig({
  plugins: [react(), {
    name: 'preview-static-routing',
    configurePreviewServer(server) {
      const root = resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((request, response, next) => {
        if (!['GET', 'HEAD'].includes(request.method)) return next()
        let pathname
        try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/\/+$/, '') || '/' }
        catch { response.statusCode = 400; response.end(); return }
        const file = resolve(root, `.${pathname}`)
        const inside = file === root || file.startsWith(`${root}${sep}`)
        const isFile = path => existsSync(path) && statSync(path).isFile()
        if (inside && isFile(resolve(file, 'index.html'))) request.url = `${pathname === '/' ? '' : pathname}/index.html`
        else if (inside && isFile(file)) { /* Serve actual assets as normal. */ }
        else if (spaRoutes.includes(pathname)) request.url = '/spa.html'
        else {
          response.statusCode = 404
          response.setHeader('Content-Type', 'text/html; charset=utf-8')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(request.method === 'HEAD' ? undefined : readFileSync(resolve(root, '404.html')))
          return
        }
        next()
      })
    },
  }],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['tests/e2e/**', 'tests/prerender/**', 'node_modules/**', 'dist/**', '.prerender/**'],
    css: true,
  },
})
