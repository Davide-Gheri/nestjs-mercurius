import { Directive, Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType('IPerson')
export abstract class Person {
  @Field(() => ID)
  id: string;

  @Directive('@uppercase')
  @Field(() => String, { nullable: true })
  name?: string;
}
