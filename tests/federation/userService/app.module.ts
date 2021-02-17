import { Module } from '@nestjs/common';
import { MercuriusModule } from '../../../lib';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => ({
        autoSchemaFile: './schema.graphql',
        fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
        federationMetadata: true,
        // altair: true,

        context: (request, reply) => {
          return {
            headers: request.headers,
          };
        },
        subscription: {
          context: (connection, request) => {
            return {
              headers: request.headers,
            };
          },
        },
      }),
    }),
  ],
  providers: [UserResolver],
})
export class AppModule {}
