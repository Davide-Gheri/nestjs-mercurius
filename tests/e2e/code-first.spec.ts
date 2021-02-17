import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ApplicationModule } from '../code-first/app.module';
import { createTestClient } from '../utils/create-test-client';

interface Context {
  app: NestFastifyApplication;
  mercuriusClient: ReturnType<typeof createTestClient>;
}

const graphqlSuite = suite<Context>('Code-first');

graphqlSuite.before.each(async (ctx) => {
  const module = await Test.createTestingModule({
    imports: [ApplicationModule],
  }).compile();

  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();
  ctx.app = app;
  ctx.mercuriusClient = createTestClient(module);
});

graphqlSuite.after.each(async (ctx) => {
  await ctx.app.close();
});

graphqlSuite(
  'should return the categories result',
  async ({ mercuriusClient }) => {
    const response = await mercuriusClient.query(
      `query {
      categories {
        name
        description
        tags
      }
    }`,
    );

    assert.equal(response.data, {
      categories: [
        {
          name: 'Category #1',
          description: 'default value',
          tags: [],
        },
      ],
    });
  },
);

graphqlSuite('should return the search result', async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(
    `query {
      search {
        ... on Recipe {
          title
        }
        ... on Ingredient {
          name
        }
      }
    }`,
  );

  assert.equal(response.data, {
    search: [
      {
        title: 'recipe',
      },
      {
        name: 'test',
      },
    ],
  });
});

graphqlSuite(`should return query result`, async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(
    `query {
      recipes {
        id
        description
        ingredients {
          name
        }
        rating
        interfaceResolver
        averageRating
      }
    }`,
  );

  assert.equal(response.data, {
    recipes: [
      {
        id: '1',
        description: 'Description: Calzone',
        ingredients: [
          {
            name: 'cherry',
          },
        ],
        rating: 10,
        interfaceResolver: true,
        averageRating: 0.5,
      },
      {
        id: '2',
        description: 'Placeholder',
        ingredients: [
          {
            name: 'cherry',
          },
        ],
        rating: 10,
        interfaceResolver: true,
        averageRating: 0.5,
      },
    ],
  });
});

graphqlSuite(`should return query result`, async ({ mercuriusClient }) => {
  const response = await mercuriusClient.query(
    `query {
      recipes {
        id
        ingredients {
          name
        }
        rating
        averageRating
      }
    }`,
  );

  assert.equal(response.data, {
    recipes: [
      {
        id: '1',
        ingredients: [
          {
            name: 'cherry',
          },
        ],
        rating: 10,
        averageRating: 0.5,
      },
      {
        id: '2',
        ingredients: [
          {
            name: 'cherry',
          },
        ],
        rating: 10,
        averageRating: 0.5,
      },
    ],
  });
});

graphqlSuite.run();
