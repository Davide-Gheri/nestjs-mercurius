import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HashScalar } from '../scalars/hash.scalar';
import { JSONResolver } from 'graphql-scalars';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => Date)
  birthDay: Date;

  @Field(() => HashScalar, { nullable: true })
  secret?: string;

  @Field(() => JSONResolver, { nullable: true })
  meta?: any;
}
