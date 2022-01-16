import fastify, { FastifyRequest } from 'fastify';
import fastify_cors from 'fastify-cors';
import { chores } from './routes/chores';
import { unauthenticated } from './routes/unauthenticated';
import { auth } from './hooks/auth';
const port = process.env.PORT || 4000;

const server = fastify();

server.register(fastify_cors, {
  origin: true,
});

server.decorateRequest('user', null);

server.register(unauthenticated);

server.register((server, opt, done) => {
  server.addHook('preHandler', auth);

  server.register(chores);
  done();
});

server.listen(port, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  console.log(`🚀 Server ready at ${address}`);
});
