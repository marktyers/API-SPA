
/* index.js */

import app from './api/middleware.js'

const defaultPort = 8080
const envPort = Deno.env.get('PORT')
const port = envPort ? Number(envPort) : defaultPort

app.addEventListener('listen', ({ port }) => console.log(`listening on port: ${port}`))

await app.listen({ port })
