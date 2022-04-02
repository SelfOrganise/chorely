import { findUser } from '../repository/users';
import { FastifyPluginCallback } from 'fastify/types/plugin';

export const unauthenticated: FastifyPluginCallback = (server, opts, done) => {
  server.get('/healthz', (req, reply) => {
    reply.status(200).send();
  });

  server.post<{ Body: { username?: string } }>('/login', async (req, res) => {
    const user = await findUser(req.body?.username?.toString());
    if (!user) {
      res.status(401).send();
      return;
    }

    return { id: user.id };
  });

  done();
};
