import { suite } from 'uvu';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { ApplicationModule } from '../graphql/app.module';
import { FastifyInstance } from 'fastify';

interface Context {
  app: NestFastifyApplication;
}

const graphqlSuite = suite<Context>('GraphQL');

graphqlSuite.before.each(async (ctx) => {
  const module = await Test.createTestingModule({
    imports: [ApplicationModule],
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
      query: `
        {
          getCats {
            id,
            color,
            weight
          }
        }`,
    })
    .expect(200, {
      data: {
        getCats: [
          {
            id: 1,
            color: 'black',
            weight: 5,
          },
        ],
      },
    });
});

graphqlSuite.run();
