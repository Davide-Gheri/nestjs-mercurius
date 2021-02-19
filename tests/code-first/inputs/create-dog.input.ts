import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateDogInput {
  @Field(() => Int)
  age: number;
}
