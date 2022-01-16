import { findUser } from '../repository/users';
import { FastifyPluginCallback } from 'fastify/types/plugin';

export const unauthenticated: FastifyPluginCallback = (server, opts, done) => {
  server.get('/healthz', (req, reply) => {
    reply.status(200);
  });

  server.get<{ Querystring: { username?: string } }>('/login', async (req, res) => {
    const user = findUser(req.query?.username?.toString());
    if (!user) {
      res.status(401).send();
      return;
    }

    return { userId: user.userId };
  });

  done();
};
