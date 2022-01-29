import { buildServer } from './server';

const port = process.env.PORT || 4000;

const server = buildServer({
  logger: {
    level: 'info',
  },
});

server.listen(port, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  console.log(`🚀 Server ready at ${address}`);
});
