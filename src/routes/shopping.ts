import { FastifyPluginCallback } from 'fastify/types/plugin';
import S from 'fluent-json-schema';
import {
  addGrocery,
  addToBasket,
  createNewBasket,
  getCurrentBasket,
  getGroceries,
  getStoreMaps,
  updateOrCreateMap,
} from '../repository/shopping';
import { Basket, DbGrocery } from '../types';
import { FastifyReply } from 'fastify';
const { exec } = require('child_process');

let clients: Array<{ id: number; organisation_id: number; send: (basket: Basket) => void }> = [];

export const shopping: FastifyPluginCallback = (server, opts, done) => {
  interface SolveParam {
    Body: { weights: Array<Array<number>>; sizes: Array<number>; numberOfPeople: number };
  }
  server.post<SolveParam>('/shopping/solve', {
    schema: {
      body: S.object()
        .prop('weights', S.array().items(S.array().items(S.number().minimum(0))))
        .prop('sizes', S.array().items(S.number().minimum(0)))
        .prop('numberOfPeople', S.number().minimum(1).maximum(5))
        .required(['weights', 'numberOfPeople', 'sizes']),
    },
    handler: (req, res) => {
      const args = req.body;
      let weights = JSON.stringify(args.weights);
      let sizes = JSON.stringify(args.sizes);
      let numberOfPeople = JSON.stringify(args.numberOfPeople);

      // note: theoretically safe to pass as shell args because schema ensures values are numbers or array of numbers
      // strings like (') would break things otherwise
      exec(
        `${process.cwd()}/dist/solver.py '${weights}' '${sizes}' '${numberOfPeople}'`,
        (err: string, stdout: string, stderr: string) => {
          if (err || stderr) {
            res.status(400).send(stderr);
          } else {
            // need to set content type since we return text from stdout
            res.type('application/json').status(200).send(stdout);
          }
        }
      );
    },
  });

  const sseHeaders = {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  };
  server.get('/shopping/baskets/current', (req, reply) => {
    reply.raw.writeHead(200, { ...sseHeaders, 'access-control-allow-origin': req.headers.origin });
    const client = {
      id: req.id,
      organisation_id: req.user.organisation_id,
      send: (basket: Basket) => reply.raw.write(`data: ${JSON.stringify(basket)}\n\n`),
    };

    getCurrentBasket(req.user.organisation_id).then(basket => {
      if (basket) {
        client.send(basket);
      }
    });

    clients.push(client);

    req.raw.on('close', () => {
      clients = clients.filter(c => c.id != req.id);
    });
  });

  interface AddToBasketParams {
    Body: { groceryId: number };
  }
  server.post<AddToBasketParams>('/shopping/baskets/current', {
    schema: {
      body: S.object().prop('groceryId').required(['groceryId']),
    },
    handler: async (req, reply) => {
      const organisationId = req.user.organisation_id;
      await addToBasket(req.body.groceryId, organisationId);
      reply.status(204);

      // update baskets
      const currentBasket = await getCurrentBasket(organisationId);
      if (currentBasket) {
        for (const client of clients.filter(c => c.organisation_id === organisationId)) {
          client.send(currentBasket);
        }
      }
    },
  });

  // create new basket
  server.post<AddToBasketParams>('/shopping/baskets', async (req, reply) => {
    const organisationId = req.user.organisation_id;
    await createNewBasket(organisationId);

    // update baskets
    const currentBasket = await getCurrentBasket(organisationId);
    if (currentBasket) {
      for (const client of clients.filter(c => c.organisation_id === organisationId)) {
        client.send(currentBasket);
      }
    }
  });
  //     const currentBasket = await getCurrentBasket(organisationId);
  //     if (currentBasket) {
  //       for (const client of clients.filter(c => c.organisation_id === organisationId)) {
  //         client.send(currentBasket);
  //       }
  //     }
  //   },
  // });

  server.get('/shopping/groceries', async req => {
    return await getGroceries(req.user.organisation_id);
  });

  interface AddGroceryRequest {
    Body: Pick<DbGrocery, 'name' | 'size'>;
  }

  server.post<AddGroceryRequest>('/shopping/groceries', {
    schema: {
      body: S.object()
        .prop('name', S.string().minLength(1).maxLength(50))
        .prop('size', S.number().minimum(1).maximum(3))
        .required(['name', 'size']),
    },
    handler: async (req, res) => {
      const response = await addGrocery(req.body, req.user);
      res.status(200).send(response);
    },
  });

  server.get('/shopping/maps', async req => {
    return await getStoreMaps(req.user.organisation_id);
  });

  interface UpdateStoreMapRequest {
    Body: { data: string };
  }

  server.post<UpdateStoreMapRequest>('/shopping/maps', {
    schema: {
      body: S.object().prop('data', S.string().minLength(2)).required(['data']),
    },
    handler: async (req, res) => {
      await updateOrCreateMap(req.body, req.user.organisation_id);
      res.status(204).send();
    },
  });

  done();
};
