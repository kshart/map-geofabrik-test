import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import getThings from './getThings'

export default (fastify: FastifyInstance, opts: FastifyPluginOptions, done: (err?: Error) => void): void => {
  getThings(fastify)
  done()
}
