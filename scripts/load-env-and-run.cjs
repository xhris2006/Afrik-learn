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

const rootDir = path.resolve(__dirname, '..')
loadEnvFile(path.join(rootDir, '.env'))
loadEnvFile(path.join(rootDir, '.env.local'))

const [command, ...args] = process.argv.slice(2)
if (!command) {
  console.error('Missing command to execute.')
  process.exit(1)
}

const resolvedCommand = path.resolve(rootDir, command)
const commandToRun = fs.existsSync(resolvedCommand) ? resolvedCommand : command

const result = spawnSync(process.execPath, [commandToRun, ...args], {
  cwd: rootDir,
  env: process.env,
  stdio: 'inherit',
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 0)
