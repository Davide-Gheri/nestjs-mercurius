import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { FastifyInstance } from 'fastify';
import { join } from 'path';
import * as request from 'supertest';
import { MercuriusModule } from '../../lib';
import { CatsRequestScopedService } from '../graphql/cats/cats-request-scoped.service';
import { CatsModule } from '../graphql/cats/cats.module';

interface Context {
  app: NestFastifyApplication;
}

const graphqlSuite = suite<Context>('GraphQL request scoped');

graphqlSuite.before.each(async (ctx) => {
  const module = await Test.createTestingModule({
    imports: [
      CatsModule.enableRequestScope(),
      MercuriusModule.forRoot({
        typePaths: [join(__dirname, '..', 'graphql', '**', '*.graphql')],
      }),
    ],
  }).compile();

  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();
  const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
  await fastify.ready();
  ctx.app = app;

  const performHttpCall = (end) =>
    request(app.getHttpServer())
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
      })
      .end((err, res) => {
        if (err) return end(err);
        end();
      });

  await new Promise((resolve) => performHttpCall(resolve));
  await new Promise((resolve) => performHttpCall(resolve));
  await new Promise((resolve) => performHttpCall(resolve));
});

graphqlSuite.after.each(async ({ app }) => {
  await app.close();
});

graphqlSuite('should create resolver for each incoming request', () => {
  assert.equal(CatsRequestScopedService.COUNTER, 3);
});

graphqlSuite.run();
