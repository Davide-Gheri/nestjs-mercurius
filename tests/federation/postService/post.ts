import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@Directive('@key(fields: "id")')
@ObjectType()
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  authorId: number;

  @Field({ nullable: true })
  public?: boolean;

  @Field(() => Date)
  publishedAt: Date;
}
