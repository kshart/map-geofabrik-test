import type { FastifyInstance } from 'fastify'
import fastifyPostgres from '@fastify/postgres'

export default async (fastify: FastifyInstance): Promise<void> => {
  const host = process.env.POSTGRES_HOST || '127.0.0.1'
  const user = process.env.POSTGRES_USER || 'test'
  const password = process.env.POSTGRES_PASSWORD || 'test'
  const database = process.env.POSTGRES_DATABASE || 'geofabrik'
  await fastify.register(fastifyPostgres, {
    connectionString: `postgres://${user}:${password}@${host}/${database}`
  })
}
