import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Animal } from '../animal.interface';
import { Species } from '../species.enum';

@ObjectType({
  implements: [Animal],
})
export class Cat implements Animal {
  @Field(() => ID)
  id: number;

  @Directive('@uppercase')
  @Field()
  name: string;

  @Field(() => Species)
  species: Species;

  @Field(() => Int)
  lives: number;
}
