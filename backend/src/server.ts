/**
 * Local Development Server
 * Run with: bun run src/server.ts
 */

import app from './index'

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Starting development server on port ${port}...`)

Bun.serve({
  port,
  fetch: app.fetch,
})

console.log(`✅ Server running at http://localhost:${port}`)
