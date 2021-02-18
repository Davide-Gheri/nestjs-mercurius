import { Directive, Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class Person {
  @Field(() => ID)
  id: string;

  @Directive('@uppercase')
  @Field(() => String, { nullable: true })
  name?: string;
}
