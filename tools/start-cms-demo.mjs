import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
const env = { ...process.env, CMS_DEMO: 'true', CMS_DATA_DIR: '.cms-data/demo', CMS_WEBSITE_ORIGIN: 'http://127.0.0.1:5182', PORT: '8791', VITE_CUSTOM_CMS_ENABLED: 'true', VITE_CMS_API_BASE_URL: 'http://127.0.0.1:8791' }
const children = [spawn(process.execPath, ['server/cms/server.mjs'], { cwd: root, env, stdio: 'inherit' }), spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5182', '--strictPort'], { cwd: root, env, stdio: 'inherit' })]
let closing = false
function stop(code = 0) { if (closing) return; closing = true; children.forEach(child => child.kill()); process.exitCode = code }
children.forEach(child => { child.on('error', error => { process.stderr.write(error.message + '\n'); stop(1) }); child.on('exit', code => stop(code || 0)) })
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop())
process.stdout.write('\nLocal CMS: http://127.0.0.1:5182/cms — demonstration accounts, never deploy this mode.\n')
