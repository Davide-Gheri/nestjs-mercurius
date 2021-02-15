import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { HashScalar } from '../scalars/hash.scalar';
import { JSONResolver } from 'graphql-scalars';

@Directive('@key(fields: "id")')
@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ defaultValue: 'noone' })
  lastName?: string;

  @Field(() => Date)
  birthDay: Date;

  @Field(() => HashScalar, { nullable: true })
  secret?: string;

  @Field(() => JSONResolver, { nullable: true })
  meta?: any;
}
