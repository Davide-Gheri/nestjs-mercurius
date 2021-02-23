import { Module } from '@nestjs/common';
import { MercuriusModule } from '../../lib';
import { CatService } from './services/cat.service';
import { DogService } from './services/dog.service';
import { CatResolver } from './resolvers/cat.resolver';
import { AnimalResolver } from './resolvers/animal.resolver';
import { UpperCaseDirective } from '../example/directives/upper-case.directive';

@Module({
  imports: [
    MercuriusModule.forRoot({
      autoSchemaFile: true,
      schemaDirectives: {
        uppercase: UpperCaseDirective,
      },
    }),
  ],
  providers: [CatService, DogService, AnimalResolver, CatResolver],
  exports: [CatService],
})
export class AppModule {}
