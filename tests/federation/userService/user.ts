import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@Directive('@key(fields: "id")')
@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ defaultValue: true })
  isActive?: boolean;
}
