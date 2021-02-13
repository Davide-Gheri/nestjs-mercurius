import { TestingModule } from '@nestjs/testing';
import { createMercuriusTestClient } from 'mercurius-integration-testing';
import { HttpAdapterHost } from '@nestjs/core';

export function createTestClient(
  testingModule: TestingModule,
): ReturnType<typeof createMercuriusTestClient> {
  const httpAdapterHost = testingModule.get(HttpAdapterHost);
  const app = httpAdapterHost.httpAdapter.getInstance();

  return createMercuriusTestClient(app);
}
