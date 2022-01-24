import { findUserByUserId } from '../repository/users';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function auth(req: FastifyRequest<{ Headers: { 'x-userid'?: string } }>, res: FastifyReply) {
  const userId = parseInt(req.headers['x-userid']!);
  if (isNaN(userId)) {
    res.status(401).send('Invalid userId');
    return;
  } else {
    const user = await findUserByUserId(userId);
    if (!user) {
      res.status(401).send('Invalid user.');
      return;
    }
    req.user = user;
    return;
  }
}
