import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@Directive('@key(fields: "id")')
@ObjectType()
export class PostType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  authorId: string;
}
