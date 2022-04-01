import { completeAssignment, getTasks, remindAssignment, undoAssignment } from '../repository/assignments';
import { FastifyPluginCallback } from 'fastify/types/plugin';
import S from 'fluent-json-schema';

const AssignmentActions = {
  complete: completeAssignment,
  undo: undoAssignment,
  remind: remindAssignment,
};


export const assignments: FastifyPluginCallback = (server, opts, done) => {
  server.get('/assignments/current', async req => {
    return await getTasks(req.user.organisation_id);
  });

  interface ChoreIdQueryParam {
    Params: { id: string };
    Body: { action: keyof typeof AssignmentActions };
  }
  server.post<ChoreIdQueryParam>('/assignments/:id', {
    schema: {
      params: S.object().prop('id', S.number()).required(['id']),
      body: S.object()
        .prop('action', S.string().enum(Object.keys(AssignmentActions)))
        .required(['action']),
    },
    handler: async (req, res) => {
      const assignmentId = parseInt(req.params.id);
      const action = AssignmentActions[req.body.action];
      if (action === null) {
        res.status(400).send(`Cannot process unsupported action "${req.body.action}".`);
      }

      const response = await action(assignmentId, req.user);
      if (response) {
        res.status(response.code).send(response.data);
      } else {
        res.status(204);
      }
    },
  });

  done();
};
