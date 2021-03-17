import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Species } from './species.enum';

@InterfaceType({
  resolveType(animal) {
    switch (animal.species) {
      case Species.DOG:
        return import('./types/dog').then((module) => module.Dog);
      case Species.CAT:
        return import('./types/cat').then((module) => module.Cat);
    }
  },
})
export class Animal {
  @Field(() => ID)
  id: number;

  @Field(() => Species)
  species: Species;
}
