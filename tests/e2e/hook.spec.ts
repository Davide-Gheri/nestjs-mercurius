import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Injectable } from '@nestjs/common';
import { AppModule } from '../code-first/app.module';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createTestClient } from '../utils/create-test-client';
import { GraphQLHook } from '../../lib';
import { CatService } from '../code-first/services/cat.service';

interface Context {
  app: NestFastifyApplication;
  mercuriusClient: ReturnType<typeof createTestClient>;
}

const gqlSuite = suite<Context>('Hook');

gqlSuite('should call hooks', async () => {
  @Injectable()
  class HookService {
    constructor(private readonly catService: CatService) {}

    @GraphQLHook('preParsing')
    async preParsing(schema, source) {
      assert.snapshot(source, 'query { cats { id } }', 'SNAPSHOT_NOT_MATCH');
    }
  }

  const module = await Test.createTestingModule({
    imports: [AppModule],
    providers: [HookService],
  }).compile();

  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();
  const mercuriusClient = createTestClient(module);

  const { errors } = await mercuriusClient.query('query { cats { id } }');
  // Nestjs swallows assert errors, need to check for the response
  assert.equal(errors, undefined);
  await app.close();
});

gqlSuite.run();
