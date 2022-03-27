import { FastifyPluginCallback } from "fastify/types/plugin";
import S from "fluent-json-schema";
import { addGrocery, getGroceries, getMaps, updateOrCreateMap } from "../repository/shopping";
const { exec } = require("child_process");

interface SolveParam {
  Body: {
    weights: Array<Array<number>>;
    numberOfPeople: number;
  };
}
export const shopping: FastifyPluginCallback = (server, opts, done) => {
  server.post<SolveParam>("/shopping/solve", {
    schema: {
      body: S.object()
        .prop("weights", S.array().items(S.array().items(S.number().minimum(0))))
        .prop("numberOfPeople", S.number().minimum(1).maximum(5))
        .required(["weights", "numberOfPeople"])
    },
    handler: (req, res) => {
      const args = req.body;

      exec(`${process.cwd()}/dist/solver.py '${JSON.stringify(args.weights)}' '${JSON.stringify(args.numberOfPeople)}'`, (err, stdout, stderr) => {
        if (err || stderr) {
          res.status(400).send(stderr);
        } else {
          // need to set content type since we return text from stdout
          res.type('application/json').status(200).send(stdout);
        }
      });
    }
  });

  server.get("/shopping/groceries", async req => {
    return await getGroceries(req.user.organisation_id);
  });

  interface AddGroceryRequest {
    Body: { name: string };
  }

  server.post<AddGroceryRequest>("/shopping/groceries", {
    schema: {
      body: S.object()
        .prop("name", S.string().minLength(1).maxLength(50))
        .required(["name"])
    },
    handler: async (req, res) => {
      const response = await addGrocery({ name: req.body.name }, req.user);
      res.status(200).send(response);
    }
  });

  server.get("/shopping/maps", async req => {
    return await getMaps(req.user.organisation_id);
  });

  interface UpdateStoreMapRequest {
    Body: { data: string };
  }

  server.post<UpdateStoreMapRequest>("/shopping/maps", {
    schema: {
      body: S.object()
        .prop("data", S.string().minLength(2))
        .required(["data"])
    },
    handler: async (req, res) => {
      await updateOrCreateMap(req.body, req.user.organisation_id);
      res.status(204).send();
    }
  });

  done();
};
