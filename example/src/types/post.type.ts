import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  authorId: string;
}
