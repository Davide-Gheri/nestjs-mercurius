import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HashScalar } from '../scalars/hash.scalar';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => Date)
  birthDay: Date;

  @Field(() => HashScalar, { nullable: true })
  secret?: string;
}
