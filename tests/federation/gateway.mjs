import mercurius from 'mercurius';
import Fastify from 'fastify';
import { ApolloServer } from 'apollo-server';
import { ApolloGateway } from '@apollo/gateway';

function fastifyGateway() {
  const gateway = Fastify();

  gateway.register(mercurius, {
    graphiql: 'playground',
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
}

function apolloGateway() {
  const gateway = new ApolloGateway({
    serviceList: [
      {
        name: 'users',
        url: 'http://localhost:3001/graphql',
      },
      {
        name: 'posts',
        url: 'http://localhost:3002/graphql',
      },
    ],
  });

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
  });

  server.listen(3333).then(() => console.log('Apollo Gateway listening on :3333'));
}

const engine = process.argv[2] || 'f';

switch (engine) {
  case 'a':
  case 'apollo':
    apolloGateway();
    break;
  default:
    fastifyGateway();
}
