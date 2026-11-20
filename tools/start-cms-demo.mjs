import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
const apiPort=Number(process.env.CMS_DEMO_API_PORT || 8791), websitePort=Number(process.env.CMS_DEMO_FRONTEND_PORT || 5182)
if (![apiPort,websitePort].every(port=>Number.isInteger(port)&&port>1024&&port<65536) || apiPort===websitePort) throw Error('Choose different valid local preview ports.')
const website=`http://127.0.0.1:${websitePort}`
const env = { ...process.env, CMS_DEMO: 'true', CMS_DATA_DIR: process.env.CMS_DEMO_DATA_DIR || '.cms-data/demo', CMS_WEBSITE_ORIGIN: website, PORT: String(apiPort), VITE_CUSTOM_CMS_ENABLED: 'true', VITE_CMS_API_BASE_URL: `http://127.0.0.1:${apiPort}` }
const children = [spawn(process.execPath, ['server/cms/server.mjs'], { cwd: root, env, stdio: 'inherit' }), spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(websitePort), '--strictPort'], { cwd: root, env, stdio: 'inherit' })]
let closing = false
function stop(code = 0) { if (closing) return; closing = true; children.forEach(child => child.kill()); process.exitCode = code }
children.forEach(child => { child.on('error', error => { process.stderr.write(error.message + '\n'); stop(1) }); child.on('exit', code => stop(code || 0)) })
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop())
process.stdout.write(`\nWebsite & CMS workspace: ${website}/\nUse Manage content and View website in the same tab. Local demonstration accounts only.\n`)
