import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MercuriusModule } from '../../lib';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { UserResolver } from './resolvers/user.resolver';
import { ImageResolver } from './resolvers/image.resolver';
import { ComplexityValidator } from './validation/complexity.validator';
import { HashScalar } from './scalars/hash.scalar';
import { JSONResolver } from 'graphql-scalars';
import { UpperCaseDirective } from './directives/upper-case.directive';
import { PersonResolver } from './resolvers/person.resolver';
import { SearchResolver } from './resolvers/search.resolver';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => ({
        autoSchemaFile: './schema.graphql',
        fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
        resolvers: {
          JSON: JSONResolver,
        },
        schemaDirectives: {
          uppercase: UpperCaseDirective,
        },
        buildSchemaOptions: {
          fieldMiddleware: [
            async (ctx, next) => {
              const value = await next();

              const { info } = ctx;
              const extensions = info?.parentType.getFields()[info.fieldName]
                .extensions;
              //...

              return value;
            },
          ],
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
  controllers: [AppController],
  providers: [
    UserService,
    PostService,
    PersonResolver,
    UserResolver,
    ImageResolver,
    SearchResolver,
    ComplexityValidator,
    HashScalar,
  ],
})
export class AppModule {}
