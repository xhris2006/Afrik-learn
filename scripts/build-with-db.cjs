const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

function parseEnv(content) {
  const entries = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries[key] = value
  }

  return entries
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const parsed = parseEnv(fs.readFileSync(filePath, 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function runNodeScript(scriptPath, args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) {
    console.error(result.error)
    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const rootDir = path.resolve(__dirname, '..')
loadEnvFile(path.join(rootDir, '.env'))
loadEnvFile(path.join(rootDir, '.env.local'))

if (process.env.DATABASE_URL) {
  console.log('[build] DATABASE_URL detected, pushing Prisma schema before Next build...')
  runNodeScript(path.join(rootDir, 'node_modules/prisma/build/index.js'), ['db', 'push'])
} else {
  console.log('[build] DATABASE_URL not set, skipping Prisma schema push.')
}

runNodeScript(path.join(rootDir, 'node_modules/next/dist/bin/next'), ['build'])
