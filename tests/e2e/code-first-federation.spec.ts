import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createTestClient } from '../utils/create-test-client';
import { AppModule } from '../federation/userService/app.module';
import { getIntrospectionQuery } from 'graphql';

interface Context {
  app: NestFastifyApplication;
  mercuriusClient: ReturnType<typeof createTestClient>;
}

const graphqlSuite = suite<Context>('Code-first federation service');

graphqlSuite.before.each(async (ctx) => {
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

graphqlSuite.after.each(async (ctx) => {
  await ctx.app.close();
});

graphqlSuite(
  'should define specific federation directives',
  async ({ app }) => {
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: null,
        query: getIntrospectionQuery(),
      })
      .expect(200);

    assert.ok(data && data.__schema);
    const schema = data.__schema;

    const federationDirectives = ['key', 'external', 'provides', 'requires'];
    const schemaDirectives = schema.directives.map((d) => d.name);

    federationDirectives.forEach((dir) => {
      assert.ok(schemaDirectives.includes(dir), `Missing directive ${dir}`);
    });
  },
);

graphqlSuite('should expose _service Query', async ({ app }) => {
  const {
    body: { data },
  } = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables: null,
      query: `
        {
          _service {
            sdl
          }        
        }
      `,
    })
    .expect(200);

  assert.ok(data && data._service.sdl);
  assert.type(data._service.sdl, 'string');
});

graphqlSuite('should expose _entities Query', async ({ app }) => {
  await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables: {
        representations: [
          {
            __typename: 'User',
            id: '1',
          },
        ],
      },
      query: `
        query($representations: [_Any!]!) {
          _entities(representations: $representations) {
            ...on User { id name }
          }
        }
      `,
    })
    .expect(200, {
      data: {
        _entities: [
          {
            id: '1',
            name: 'u1',
          },
        ],
      },
    });
});

graphqlSuite.run();
