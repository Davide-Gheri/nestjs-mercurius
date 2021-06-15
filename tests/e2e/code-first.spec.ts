import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createTestClient } from '../utils/create-test-client';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Test } from '@nestjs/testing';
import { AppModule } from '../code-first/app.module';
import * as Websocket from 'ws';
import { FastifyInstance } from 'fastify';
import { cats } from '../code-first/services/cat.service';

interface Context {
  app: NestFastifyApplication;
  mercuriusClient: ReturnType<typeof createTestClient>;
}

const expectedCats = [
  {
    id: '1',
    species: 'CAT',
    lives: 9,
  },
  {
    id: '2',
    species: 'CAT',
    lives: 9,
  },
];

const expectedDogs = [
  {
    id: '1',
    species: 'DOG',
    age: 2,
  },
  {
    id: '2',
    species: 'DOG',
    age: 5,
  },
];

const gqlSuite = suite<Context>('Code-first');

gqlSuite.before.each(async (ctx) => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();
  ctx.app = app;
  ctx.mercuriusClient = createTestClient(module);
});

gqlSuite.after.each(async (ctx) => {
  await ctx.app.close();
});

gqlSuite('should return a list of cats', async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(`
    query cats{
      cats {
        id
        species
        lives
      }
    }
  `);

  assert.equal(response.data, {
    cats: expectedCats,
  });
});

gqlSuite('should return Loader values', async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(
    `
    query cat($id: ID!) {
      cat(id: $id) {
        hasFur
      }    
    }
  `,
    {
      variables: { id: 1 },
    },
  );

  assert.equal(response.data, {
    cat: {
      hasFur: true,
    },
  });
});

gqlSuite('should apply schema directives', async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(
    `
    query cat($id: ID!) {
      cat(id: $id) {
        name
      }    
    }
  `,
    {
      variables: { id: 1 },
    },
  );

  assert.equal(response.data, {
    cat: {
      name: 'FUFY',
    },
  });
});

gqlSuite(
  'should return interface fieldResolver value',
  async ({ mercuriusClient }) => {
    const response = await mercuriusClient.query(
      `
    query cat($id: ID!) {
      cat(id: $id) {
        hasPaws
      }    
    }
  `,
      {
        variables: { id: 1 },
      },
    );

    assert.equal(response.data, {
      cat: {
        hasPaws: true,
      },
    });
  },
);

gqlSuite(
  'should return interface loader value',
  async ({ mercuriusClient }) => {
    const response = await mercuriusClient.query(
      `
    query cat($id: ID!) {
      cat(id: $id) {
        aField
      }    
    }
  `,
      {
        variables: { id: 1 },
      },
    );

    assert.equal(response.data, {
      cat: {
        aField: 'lorem',
      },
    });
  },
);

gqlSuite('should return union', async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(`
    query {
      domesticAnimals {
        ... on Animal {
          id
          species
          hasPaws
        }
        ...on Dog {
          age
        }
        ... on Cat {
          lives
        }
      }
    }
  `);

  assert.equal(response.data, {
    domesticAnimals: [
      ...expectedDogs.map((d) => ({
        ...d,
        hasPaws: true,
      })),
      ...expectedCats.map((c) => ({
        ...c,
        hasPaws: true,
      })),
    ],
  });
});

gqlSuite('should filter union return', async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(`
    query {
      domesticAnimals(species: DOG) {
        ... on Animal {
          id
          species
          hasPaws
        }
        ...on Dog {
          age
        }
        ... on Cat {
          lives
        }
      }
    }
  `);

  assert.equal(response.data, {
    domesticAnimals: [
      ...expectedDogs.map((d) => ({
        ...d,
        hasPaws: true,
      })),
    ],
  });
});

gqlSuite(
  'should return the interface resolved types',
  async ({ mercuriusClient }) => {
    const response = await mercuriusClient.query(`
    query {
      animals {
        ... on Animal {
          id
          species
          hasPaws
        }
        ...on Dog {
          age
        }
        ... on Cat {
          lives
        }
      }
    }
  `);

    assert.equal(response.data, {
      animals: [
        ...expectedDogs.map((d) => ({
          ...d,
          hasPaws: true,
        })),
        ...expectedCats.map((c) => ({
          ...c,
          hasPaws: true,
        })),
      ],
    });
  },
);

gqlSuite('subscriber should work', async ({ app }) => {
  return new Promise<void>((resolve, reject) => {
    app.listen(0, (err) => {
      if (err) {
        return reject(err);
      }
      const port = app.getHttpServer().address().port;
      const fastifyApp = app.getHttpAdapter().getInstance() as FastifyInstance;

      const ws = new Websocket(`ws://localhost:${port}/graphql`, 'graphql-ws');

      const client = Websocket.createWebSocketStream(ws, {
        encoding: 'utf8',
        objectMode: true,
      });
      client.setEncoding('utf8');
      client.write(
        JSON.stringify({
          type: 'connection_init',
        }),
      );

      client.write(
        JSON.stringify({
          id: 1,
          type: 'start',
          payload: {
            query: `
          subscription {
            onCatSub {
              id
              lives
              name
              hasFur
            }
          }
        `,
          },
        }),
      );

      client.on('data', (chunk) => {
        const data = JSON.parse(chunk);

        if (data.type === 'connection_ack') {
          fastifyApp.graphql.pubsub.publish({
            topic: 'CAT_SUB_TOPIC',
            payload: cats[0],
          });
        } else if (data.id === 1) {
          const expectedCat = expectedCats[0];
          const receivedCat = data.payload.data?.onCatSub;
          assert.ok(receivedCat);
          assert.equal(expectedCat.id, receivedCat.id);
          assert.type(receivedCat.hasFur, 'boolean');

          client.end();
        }
      });

      client.on('end', () => {
        client.destroy();
        app.close().then(resolve).catch(reject);
      });
    });
  });
});

gqlSuite.run();
