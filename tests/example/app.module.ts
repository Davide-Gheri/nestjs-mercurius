import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MercuriusModule } from '../../lib';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { UserResolver } from './resolvers/user.resolver';
import { ImageResolver } from './resolvers/image.resolver';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => ({
        autoSchemaFile: './schema.graphql',
        altair: true,
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
  providers: [UserService, PostService, UserResolver, ImageResolver],
})
export class AppModule {}
