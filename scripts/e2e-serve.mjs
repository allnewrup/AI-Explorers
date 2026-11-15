#!/usr/bin/env node
/**
 * Builds one end-to-end test build and serves it.
 *
 *   node scripts/e2e-serve.mjs <port>
 *
 * Started by playwright.config.ts, once per test build, with the build's
 * settings in the environment (NEXT_DIST_DIR, NEXT_PUBLIC_SUPABASE_URL, …).
 *
 * Playwright starts its web servers in parallel, but two `next build`
 * processes running at once in the same project crash intermittently. The
 * builds therefore take turns using a lock folder; the servers then run side
 * by side as normal.
 */
import { spawn } from "node:child_process"
import { mkdirSync, rmSync, statSync } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"

const port = process.argv[2]
if (!port || Number.isNaN(Number(port))) {
  console.error("Usage: node scripts/e2e-serve.mjs <port>")
  process.exit(1)
}

const LOCK = ".next-e2e/.build-lock"
const STALE_AFTER_MS = 10 * 60 * 1000
let holdingLock = false

function releaseLock() {
  if (!holdingLock) return
  holdingLock = false
  rmSync(LOCK, { recursive: true, force: true })
}

async function acquireLock() {
  mkdirSync(".next-e2e", { recursive: true })
  for (;;) {
    try {
      mkdirSync(LOCK)
      holdingLock = true
      return
    } catch (error) {
      if (error.code !== "EEXIST") throw error
      try {
        // A lock left behind by a killed run must not block the suite for ever.
        if (Date.now() - statSync(LOCK).mtimeMs > STALE_AFTER_MS) {
          rmSync(LOCK, { recursive: true, force: true })
        }
      } catch {
        // The other process released it between our two calls: just retry.
      }
      await sleep(400)
    }
  }
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", args, { stdio: "inherit", env: process.env })
    child.on("error", reject)
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`npx ${args.join(" ")} exited with code ${code}`))
    )
  })
}

let server
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    releaseLock()
    if (server) server.kill(signal)
    else process.exit(1)
  })
}

try {
  await acquireLock()
  await run(["next", "build"])
} catch (error) {
  releaseLock()
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
releaseLock()

server = spawn("npx", ["next", "start", "--port", port], { stdio: "inherit", env: process.env })
server.on("exit", (code) => process.exit(code ?? 0))
