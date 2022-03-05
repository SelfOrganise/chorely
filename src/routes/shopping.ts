import { FastifyPluginCallback } from 'fastify/types/plugin';
import S from 'fluent-json-schema';
import { exec } from 'child_process';
import { getGroceries } from "../repository/groceries";

interface SolveParam {
  Body: {
    weights: Array<Array<number>>;
    numberOfPeople: number;
  }
}

export const shopping: FastifyPluginCallback = (server, opts, done) => {
  server.post<SolveParam>('/shopping/solve', {
    schema: {
      body: S.object()
        .prop('weights', S.array().items(S.array().items(S.number().minimum(0))))
        .prop('numberOfPeople', S.number().minimum(1).maximum(5))
        .required(['weights', 'numberOfPeople'])
    },
    handler: async (req, res) => {
      const args = req.body;

      exec(`/home/bogdan/work/chores/chores-api/scripts/solver.py '${JSON.stringify(args.weights)}' '${JSON.stringify(args.numberOfPeople)}'`, (err, stdout, stderr) => {
        if (err || stderr) {
          res.status(400).send(stderr);
        }

        res.status(200).send(stdout);
      });
    }
  });

  server.get('/shopping/groceries', async req => {
    return await getGroceries(req.user.organisation_id);
  })

  // server.post<ChoreIdQueryParam>('/assignments/:id', {
  //   schema: {
  //     params: S.object().prop('id', S.number()).required(['id']),
  //     body: S.object()
  //       .prop('action', S.string().enum(Object.keys(AssignmentActions)))
  //       .required(['action']),
  //   },
  //   handler: async (req, res) => {
  //     const assignmentId = parseInt(req.params.id);
  //     const action = AssignmentActions[req.body.action];
  //     if (action === null) {
  //       res.status(400).send(`Cannot process unsupported action "${req.body.action}".`);
  //     }
  //
  //     const response = await action(assignmentId, req.user);
  //     if (response) {
  //       res.status(response.code).send(response.data);
  //     } else {
  //       res.status(204);
  //     }
  //   },
  // });

  done();
};
