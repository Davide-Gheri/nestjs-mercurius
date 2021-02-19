import { Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PubSub } from 'mercurius';
import { FastifyInstance } from 'fastify';

@Injectable()
export class PubSubHost {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  getInstance(): PubSub | undefined {
    return this.httpAdapterHost.httpAdapter.getInstance<FastifyInstance>()
      .graphql?.pubsub;
  }
}
