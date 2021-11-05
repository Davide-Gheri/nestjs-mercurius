import Fastify from 'fastify';
import mercurius from 'mercurius';

const gateway = Fastify();

gateway.register(mercurius, {
  graphiql: true,
  subscription: true,
  logLevel: 'trace',
  gateway: {
    pollingInterval: 1000,
    services: [
      {
        name: 'users',
        url: 'http://localhost:3001/graphql',
        wsUrl: 'ws://localhost:3001/graphql',
      },
      {
        name: 'posts',
        url: 'http://localhost:3002/graphql',
        wsUrl: 'ws://localhost:3002/graphql',
      }
    ],
  },
});

gateway.listen(3333).then(() => console.log('Mercurius Gateway listening on :3333'));
