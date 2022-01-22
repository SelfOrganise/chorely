import fastify from 'fastify';
import fastify_cors from 'fastify-cors';
import { unauthenticated } from './routes/unauthenticated';
import { auth } from './hooks/auth';
import { chores } from './routes/chores';

export function buildServer(opts = {}) {

  const server = fastify(opts);

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

  return server;
}
