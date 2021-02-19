import { Module } from '@nestjs/common';
import { MercuriusModule } from '../../../lib';
import { UserResolver } from './user.resolver';
import { PostResolver } from './post.resolver';
import { User } from './user';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => ({
        autoSchemaFile: './schema.graphql',
        fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
        federationMetadata: true,
        buildSchemaOptions: {
          orphanedTypes: [User],
        },
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
  providers: [UserResolver, PostResolver],
})
export class AppModule {}
