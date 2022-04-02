import fastify from 'fastify';
import fastify_cors from 'fastify-cors';
import { unauthenticated } from './routes/unauthenticated';
import { auth } from './hooks/auth';
import { assignments } from './routes/assignments';
import { shopping } from "./routes/shopping";

export function buildServer(opts = {}) {

  const server = fastify(opts);

  server.register(fastify_cors, {
    origin: true,
  });

  server.decorateRequest('user', null);

  server.register(unauthenticated);

  server.register((server, opt, done) => {
    server.addHook('preHandler', auth);

    server.register(assignments);
    server.register(shopping);
    done();
  });

  return server;
}
