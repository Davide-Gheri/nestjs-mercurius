import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createTestClient } from '../utils/create-test-client';
import { suite } from 'uvu';
import { Test } from '@nestjs/testing';
import { AppModule as GatewayModule } from '../federation/gateway/app.module';
import { AppModule as UserModule } from '../federation/userService/app.module';
import { AppModule as PostModule } from '../federation/postService/app.module';
import { NestFactory } from '@nestjs/core';
import { getIntrospectionQuery } from 'graphql';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

interface Context {
  app: NestFastifyApplication;
  mercuriusClient: ReturnType<typeof createTestClient>;
  services: INestApplication[];
}

const graphqlSuite = suite<Context>('Gateway');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

graphqlSuite.before.each(async (ctx) => {
  const userApp = await NestFactory.create(UserModule, new FastifyAdapter());
  const postApp = await NestFactory.create(PostModule, new FastifyAdapter());

  await Promise.all([userApp.listen(3001), postApp.listen(3002)]);

  ctx.services = [userApp, postApp];

  await sleep(500);

  const module = await Test.createTestingModule({
    imports: [GatewayModule],
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
  await Promise.all(ctx.services.map((svc) => svc.close()));
});

graphqlSuite('Should start', async (t) => {
  await request(t.app.getHttpServer())
    .post('/graphql')
    .send({
      query: getIntrospectionQuery(),
    })
    .expect(200);
});

graphqlSuite('Should call service query', async (t) => {
  await request(t.app.getHttpServer())
    .post('/graphql')
    .send({
      query: `
        {
          users {
            id
            name
          }
        }
      `,
    })
    .expect(200, {
      data: {
        users: [
          {
            id: '1',
            name: 'u1',
          },
          {
            id: '2',
            name: 'u2',
          },
        ],
      },
    });
});

graphqlSuite.run();
