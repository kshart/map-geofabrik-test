import type { FastifyInstance, FastifyRequest } from 'fastify'

interface IQuerystring {
  /**
   * Polygon
   */
  p: [number, number][]
}

export default (fastify: FastifyInstance): void => {
  fastify.get<{
    Querystring: IQuerystring,
    // Reply: IReply
  }>('/getThings', {
    async handler (request, reply) {
      const client = await fastify.pg.connect()
      console.log(request.query.p)
      const sqlRaw = []
      for (const p of request.query.p) {
        sqlRaw.push(`${Number(p[0])} ${Number(p[1])}`)
      }
      try {
        const { rows } = await client.query(`
          SELECT
            osm_id as id,
            name,
            (ST_AsGeoJSON(ST_Transform(way, 4326))::jsonb - 'crs') as geojson
          FROM planet_osm_point
          WHERE shop IS NOT NULL AND ST_Contains(
            ST_Transform(
              'SRID=4326;POLYGON((${sqlRaw.join(', ')}))'::geometry, 3857),
              way
            )
        `)
        // WHERE shop = 'alcohol'
        reply
          .code(200)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send(rows)
      } finally {
        client.release()
      }
      // const { username, password } = request.query
      // const customerHeader = request.headers['h-Custom']
      // // do something with request data

      // // chaining .statusCode/.code calls with .send allows type narrowing. For example:
      // // this works
      // reply.code(200).send({ success: true });
      // // but this gives a type error
      // reply.code(200).send('uh-oh');
      // // it even works for wildcards
      // reply.code(404).send({ error: 'Not found' });
    },
    preValidation(request, reply, done) {
      if (typeof request.query.p === 'string') {
        request.query.p = JSON.parse(request.query.p)
      }
      done()
    },
    schema: {
      querystring: {
        type: 'object',
        required: ['p'],
        properties: {
          p: {
            type: 'array',
            minItems: 3,
            maxItems: 32,
            items: {
              type: 'array',
              // minItems: 2,
              // maxItems: 2,
              // items: 'number'
            }
          }
        }
      }
    }
  })
}
