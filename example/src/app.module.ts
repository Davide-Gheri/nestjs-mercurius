import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MercuriusModule } from '../../lib';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [
    MercuriusModule.forRootAsync({
      useFactory: () => ({
        autoSchemaFile: './schema.graphql',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    UserService,
    PostService,
    UserResolver,
  ],
})
export class AppModule {}
