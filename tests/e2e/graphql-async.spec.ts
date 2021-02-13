import { suite } from 'uvu';
import * as request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import { AsyncApplicationModule } from '../graphql/async-options.module';

interface Context {
  app: NestFastifyApplication;
}

const graphqlSuite = suite<Context>('GraphQL (async configuration)');

graphqlSuite.before.each(async (ctx) => {
  const module = await Test.createTestingModule({
    imports: [AsyncApplicationModule],
  }).compile();

  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();
  const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
  await fastify.ready();
  ctx.app = app;
});

graphqlSuite.after.each(async ({ app }) => {
  await app.close();
});

graphqlSuite(`should return query result`, async ({ app }) => {
  await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables: {},
      query: '{\n  getCats {\n    id\n  }\n}\n',
    })
    .expect(200, {
      data: {
        getCats: [
          {
            id: 1,
          },
        ],
      },
    });
});

graphqlSuite.run();
