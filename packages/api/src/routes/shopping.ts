import { FastifyPluginCallback } from 'fastify/types/plugin';
import S from 'fluent-json-schema';
import {
  addGrocery,
  addGroceryToRecipe,
  addRecipe,
  addToBasket,
  createNewBasket,
  deleteGroceryFromRecipe,
  getCurrentBasket,
  getGroceries,
  getRecipe,
  getRecipes,
  getStoreMaps,
  updateOrCreateMap,
} from '../repository/shopping';

const { exec } = require('child_process');

let clients: Array<{ id: number; organisation_id: number; send: (basket: Basket) => void }> = [];

export const shopping: FastifyPluginCallback = (server, opts, done) => {
  // solve shopping
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

  //region basket
  // get current basket
  const sseHeaders = {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'X-Accel-Buffering': 'no', // fixes nginx caching sse
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

  // add to basket
  server.post<{ Body: { groceryId: number } }>('/shopping/baskets/current', {
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
  server.post('/shopping/baskets', async (req, reply) => {
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
  //endregion

  //region groceries
  // get groceries
  server.get('/shopping/groceries', async req => {
    return await getGroceries(req.user.organisation_id);
  });

  // create new grocery
  server.post<{ Body: Pick<DbGrocery, 'name' | 'size'> }>('/shopping/groceries', {
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
  //endregion

  //region maps
  // get shopping maps configurations
  server.get('/shopping/maps', async req => {
    return await getStoreMaps(req.user.organisation_id);
  });

  // update shop map configuration
  server.post<{ Body: { data: string } }>('/shopping/maps', {
    schema: {
      body: S.object().prop('data', S.string().minLength(2)).required(['data']),
    },
    handler: async (req, res) => {
      await updateOrCreateMap(req.body, req.user.organisation_id);
      res.status(204).send();
    },
  });
  //endregion

  //region recipes
  // get recipes
  server.get('/shopping/recipes', async req => {
    return await getRecipes(req.user.organisation_id);
  });

  // create recipe
  server.post<{ Body: { name: string } }>('/shopping/recipes', {
    schema: {
      body: S.object().prop('name', S.string().minLength(3)),
    },
    handler: async (req, res) => {
      const result = await addRecipe(req.body.name, req.user.organisation_id);
      return res.status(result.code).send(result.data);
    },
  });

  // get recipe
  server.get<{ Params: { id: number } }>('/shopping/recipes/:id', {
    schema: {
      params: S.object().prop('id', S.number().minimum(0)).required(['id']),
    },
    handler: async (req, res) => {
      const recipe = await getRecipe(req.params.id, req.user.id);
      return res.status(recipe.code).send(recipe.data);
    },
  });

  // add grocery to recipe
  server.post<{ Params: { id: number }; Body: { groceryId: number } }>('/shopping/recipes/:id', {
    schema: {
      params: S.object().prop('id', S.number().minimum(0)).required(['id']),
      body: S.object().prop('groceryId', S.number().minimum(0)),
    },
    handler: async (req, res) => {
      const result = await addGroceryToRecipe(req.params.id, req.body.groceryId);
      return res.status(result.code).send(result.data);
    },
  });

  // delete grocery from recipe
  server.delete<{ Params: { id: number }; Body: { recipeId: number } }>('/shopping/recipes/:id', {
    schema: {
      params: S.object().prop('id', S.number().minimum(0)).required(['id']),
      body: S.object().prop('recipeId', S.number().minimum(0)),
    },
    handler: async (req, res) => {
      const result = await deleteGroceryFromRecipe(req.params.id, req.body.recipeId);
      return res.status(result.code).send(result.data);
    },
  });
  //

  //endregion

  done();
};
