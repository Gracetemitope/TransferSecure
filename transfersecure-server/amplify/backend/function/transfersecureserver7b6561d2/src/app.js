const fastify = require('fastify')

const app = fastify()
app.get('/hello', async (request, reply) => reply.send({ hello: 'world' }))

if (require.main === module) {

  app.listen({ port: 3000 }, (err) => {
    if (err) console.error(err)
    console.log('server listening on 3000')
  })
} else {

  module.exports = app
}