import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class FullNameArgs {
  @Field({ nullable: true })
  filter?: string;
}
