import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NestjsMercuriusModule } from '@app/nestjs-mercurius';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    NestjsMercuriusModule.forRoot({
      autoSchemaFile: 'schema.graphql',
      path: '/graphql',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UserResolver],
})
export class AppModule {}
