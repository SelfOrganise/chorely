import { completeAssignment, getTasks, remindChore, undoChore } from '../repository/assignments';
import { FastifyPluginCallback } from 'fastify/types/plugin';
import S from 'fluent-json-schema';

export const ChoreActions = {
  complete: 'complete',
  undo: 'undo',
  remind: 'remind',
};

interface ChoreIdQueryParam {
  Params: { id: string };
  Body: { action: keyof typeof ChoreActions };
}

export const assignments: FastifyPluginCallback = (server, opts, done) => {
  server.get('/assignments/current', async req => {
    return await getTasks(req.user.organisation_id);
  });

  server.post<ChoreIdQueryParam>('/assignments/:id', {
    schema: {
      params: S.object().prop('id', S.number()).required(['id']),
      body: S.object()
        .prop('action', S.string().enum(Object.values(ChoreActions)))
        .required(['action']),
    },
    handler: async (req, res) => {
      const choreId = parseInt(req.params.id);
      switch (req.body.action) {
        case ChoreActions.complete:
          const response = await completeAssignment(choreId, req.user);
          if (response) {
            res.status(response.code).send(response.data);
          } else {
            res.status(204);
          }
          break;
        case ChoreActions.undo:
          await undoChore(choreId, req.user);
          res.status(204);
          break;
        case ChoreActions.remind:
          await remindChore(choreId, req.user);
          res.status(204);
          break;
        default:
          console.log({ act: JSON.stringify(ChoreActions) });
          res.status(400).send('Could not process request');
      }
    },
  });

  done();
};
