import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCatInput {
  @Field(() => Int, { defaultValue: 9 })
  lives: number;

  @Field()
  name: string;
}
