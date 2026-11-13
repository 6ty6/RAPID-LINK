import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const viteEntry = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const designs = [
  { name: 'Corporate', folder: 'corporate-trust', port: 5174, colour: '\u001b[36m' },
  { name: 'Human', folder: 'human-centred', port: 5175, colour: '\u001b[33m' },
  { name: 'Digital', folder: 'digital-first', port: 5176, colour: '\u001b[34m' },
]
const reset = '\u001b[0m'

if (!existsSync(viteEntry)) {
  console.error('Dependencies are missing. Run npm install in the main project first.')
  process.exit(1)
}

for (const design of designs) {
  const directory = path.join(projectRoot, '.worktrees', design.folder)
  if (!existsSync(directory)) {
    console.error(`Missing design worktree: ${directory}`)
    process.exit(1)
  }
}

const children = []
let stopping = false

function prefixOutput(stream, design, target) {
  let pending = ''
  stream.setEncoding('utf8')
  stream.on('data', chunk => {
    pending += chunk
    const lines = pending.split(/\r?\n/)
    pending = lines.pop() ?? ''
    for (const line of lines) {
      if (line) target.write(`${design.colour}[${design.name}]${reset} ${line}\n`)
    }
  })
  stream.on('end', () => {
    if (pending) target.write(`${design.colour}[${design.name}]${reset} ${pending}\n`)
  })
}

function stopAll(exitCode = 0) {
  if (stopping) return
  stopping = true
  console.log('\nStopping all RapidLink design previews...')
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  setTimeout(() => process.exit(exitCode), 250)
}

console.log('Starting all RapidLink design previews:\n')
for (const design of designs) {
  const cwd = path.join(projectRoot, '.worktrees', design.folder)
  const child = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', String(design.port), '--strictPort'], {
    cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)
  prefixOutput(child.stdout, design, process.stdout)
  prefixOutput(child.stderr, design, process.stderr)
  child.on('error', error => {
    console.error(`${design.name} preview failed to start: ${error.message}`)
    stopAll(1)
  })
  child.on('exit', code => {
    if (!stopping && code !== 0) {
      console.error(`${design.name} preview stopped unexpectedly with code ${code}.`)
      stopAll(code || 1)
    }
  })
}

console.log('Corporate Trust: http://127.0.0.1:5174/home')
console.log('Human-Centred:  http://127.0.0.1:5175/home')
console.log('Digital-First:   http://127.0.0.1:5176/home')
console.log('\nPress Ctrl+C once to stop all three.\n')

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))
