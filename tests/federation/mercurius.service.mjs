import mercurius from 'mercurius';
import Fastify from 'fastify';
import redis from 'mqemitter-redis';

const emitter = redis({
  port: 6379,
  host: '127.0.0.1'
});

function userService() {

  const schema = `
  extend type Query {
    users: [User!]!
  }
  
  extend type Mutation {
    createUser: User!
  }
  
  type User @key(fields:"id") {
    id: ID!
    name: String!
  }
`;

  const users = [
    {
      id: 1,
      name: 'u1',
    },
    {
      id: 2,
      name: 'u2'
    }
  ];

  let nextId = 3;

  const resolvers = {
    Query: {
      users: () => users,
    },
    Mutation: {
      createUser: (root, args, ctx) => {
        const user = {
          name: 'afsdfd',
          id: nextId,
        };
        nextId++;
        users.push(user);
        ctx.pubsub.publish({
          topic: 'createUser',
          payload: { onCreateUser: user },
        });
        return user;
      }
    },
    User: {
      __resolveReference: (ref) => users.find(u => u.id.toString() === ref.id.toString()),
    },
  }

  const app = Fastify();
  app.register(mercurius, {
    schema,
    resolvers,
    federationMetadata: true,
    graphiql: 'playground',
    subscription: {
      emitter,
    },
  });

  app.get('/schema', async function (req, reply) {
    const query = '{ _service { sdl } }'
    return app.graphql(query)
  })

  app.listen(3001).then(() => console.log(':3001'));
}

function postService() {

  const schema = `
  extend type Query {
    posts: [Post!]!
  }
  
  extend type Subscription {
    onCreateUser: User!
  }
  
  type Post @key(fields:"id") {
    id: ID!
    title: String!
    authorId: ID!
  }
  
  type User @key(fields: "id") @extends {
    id: ID! @external
    posts: [Post!]!
  }
`;

  const posts = [
    {
      id: 1,
      title: 'p1',
      authorId: 1
    },
    {
      id: 2,
      title: 'p2',
      authorId: 1
    }
  ];

  const resolvers = {
    Query: {
      posts: () => posts,
    },
    Subscription: {
      onCreateUser: (roow, args, ctx) => {
        return ctx.pubsub.subscribe('createUser')
      },
    },
    User: {
      posts: (parent) => {
        return posts.filter(p => p.authorId.toString() === parent.id.toString())
      },
    },
    Post: {
      __resolveReference: (ref) => posts.find(p => p.id.toString() === ref.id.toString()),
    }
  }

  const app = Fastify();
  app.register(mercurius, {
    schema,
    resolvers,
    federationMetadata: true,
    graphiql: 'playground',
    subscription: {
      emitter,
    },
  });

  app.get('/schema', async function (req, reply) {
    const query = '{ _service { sdl } }'
    return app.graphql(query)
  })

  app.listen(3002).then(() => console.log(':3002'));
}

const svc = process.argv[2];

switch (svc) {
  case 'p':
  case 'post':
  case 'posts':
    postService();
    break;
  default:
    userService();
}
