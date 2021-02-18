import mercurius from 'mercurius';
import Fastify from 'fastify';
import utils from '@graphql-tools/schema';

const { makeExecutableSchema } = utils;

const typeDefs = `
  type Query {
    user: User!
  }
  
  interface Person {
    id: ID!
    name: String!
    uniqueId: String!
  }
  
  type User implements Person {
    id: ID!
    name: String!
    uniqueId: String!
  }
`;

const user = {
  id: 1,
  name: 'foo',
};

const resolvers = {
  Query: {
    user: () => user,
  },
};

const loaders = {
  Person: {
    uniqueId: queries => {
      console.log(queries)
      return queries.map(({ obj }) => obj.name + obj.id);
    }
  }
}

const schemaTransforms = [
  schema => schema,
];

const app = Fastify();
app.register(mercurius, {
  schema: typeDefs,
  resolvers,
  loaders,
  graphiql: 'playground',
  // schemaTransforms,
})

app.listen(3332).then(() => console.log(':3332'))
