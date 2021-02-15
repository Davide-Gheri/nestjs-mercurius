import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MercuriusModule } from '../../lib';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { UserResolver } from './resolvers/user.resolver';
import { ImageResolver } from './resolvers/image.resolver';
import queryComplexity, {
  directiveEstimator,
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-query-complexity';
import { ComplexityValidator } from './validation/complexity.validator';
import { HashScalar } from './scalars/hash.scalar';
import { JSONResolver } from 'graphql-scalars';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => ({
        autoSchemaFile: './schema.graphql',
        fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
        resolvers: {
          JSON: JSONResolver,
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
        validationRules: ({ variables, operationName }) => [
          queryComplexity({
            maximumComplexity: 100,
            variables,
            operationName,
            estimators: [
              fieldExtensionsEstimator(),
              directiveEstimator(),
              simpleEstimator({ defaultComplexity: 1 }),
            ],
            onComplete: (complexity: number) => {
              console.log('Query Complexity:', complexity);
            },
          }),
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    UserService,
    PostService,
    UserResolver,
    ImageResolver,
    ComplexityValidator,
    HashScalar,
  ],
})
export class AppModule {}
