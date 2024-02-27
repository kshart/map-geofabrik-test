import fastify from 'fastify'
import routes from './routes'
import database from './database'

const server = fastify()

server.register(routes, { prefix: '/api' })
database(server).catch(error => {
  console.error(error)
  process.exit(1)
})

server.listen({
  port: 8080,
  host: '::'
}, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
