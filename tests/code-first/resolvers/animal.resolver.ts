import {
  Args,
  createUnionType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Animal } from '../animal.interface';
import { Dog } from '../types/dog';
import { Cat } from '../types/cat';
import { Species } from '../species.enum';
import { CatService } from '../services/cat.service';
import { DogService } from '../services/dog.service';
import { LoaderQuery, ResolveLoader } from '../../../lib';

export const DomesticAnimal = createUnionType({
  name: 'DomesticAnimal',
  types: () => [Dog, Cat],
  resolveType: (value: Dog | Cat) => {
    switch (value.species) {
      case Species.CAT:
        return Cat;
      case Species.DOG:
        return Dog;
      default:
        return null;
    }
  },
});

@Resolver(() => Animal)
export class AnimalResolver {
  constructor(
    private readonly catService: CatService,
    private readonly dogService: DogService,
  ) {}

  @Query(() => [Animal])
  animals() {
    return [...this.dogService.dogs(), ...this.catService.cats()];
  }

  @Query(() => [DomesticAnimal])
  domesticAnimals(
    @Args({ name: 'species', type: () => Species, nullable: true })
    species?: Species,
  ) {
    switch (species) {
      case Species.DOG:
        return this.dogService.dogs();
      case Species.CAT:
        return this.catService.cats();
      default:
        return [...this.dogService.dogs(), ...this.catService.cats()];
    }
  }

  @ResolveField(() => Boolean)
  hasPaws(@Parent() animal: Animal) {
    return true;
  }

  @ResolveLoader(() => String)
  aField(@Parent() queries: LoaderQuery<Animal>[]) {
    return queries.map(({ obj }) => 'lorem');
  }
}
