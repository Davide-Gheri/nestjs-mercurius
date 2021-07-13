import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MercuriusModule } from '../../lib';
import { ImageResolver } from './resolvers/image.resolver';
import { HashScalar } from './scalars/hash.scalar';
import { JSONResolver } from 'graphql-scalars';
import { UpperCaseDirective } from './directives/upper-case.directive';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => {
        return {
          autoSchemaFile: './schema.graphql',
          fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
          graphiql: true,
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
                const extensions =
                  info?.parentType.getFields()[info.fieldName].extensions;
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
        };
      },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [ImageResolver, HashScalar],
})
export class AppModule {}
