import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Species } from './species.enum';

@InterfaceType()
export class Animal {
  @Field(() => ID)
  id: number;

  @Field(() => Species)
  species: Species;
}
