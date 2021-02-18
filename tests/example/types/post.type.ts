import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum Status {
  PUBLISHED,
  DRAFT,
}

registerEnumType(Status, {
  name: 'Status',
});

@ObjectType()
export class PostType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  authorId: string;

  @Field(() => Status, { defaultValue: Status.DRAFT })
  status?: Status;
}
