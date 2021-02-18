import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Person } from '../types/person.interface';
import { LoaderQuery, ResolveLoader } from '../../../lib';

@Resolver(() => Person)
export class PersonResolver {
  @ResolveField(() => String)
  uniqueName(@Parent() person: Person) {
    return `${person.id}__${person.name}`;
  }

  @ResolveLoader(() => String)
  uniqueId(@Parent() queries: LoaderQuery<Person>[]) {
    return queries.map(({ obj }) => `${obj.name}__${obj.id}`);
  }
}
