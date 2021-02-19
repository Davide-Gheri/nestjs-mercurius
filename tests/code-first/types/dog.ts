import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Animal } from '../animal.interface';
import { Species } from '../species.enum';

@ObjectType({
  implements: [Animal],
})
export class Dog implements Animal {
  @Field(() => ID)
  id: number;

  @Field(() => Species)
  species: Species;

  @Field(() => Int)
  age: number;
}
