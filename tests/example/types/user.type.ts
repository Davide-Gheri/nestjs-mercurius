import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql';
import { HashScalar } from '../scalars/hash.scalar';
import { JSONResolver } from 'graphql-scalars';
import { Person } from './person.interface';

@ObjectType('User', {
  implements: [Person],
})
export class UserType implements Person {
  @Field(() => ID)
  id: string;

  @Extensions({ role: 'ADMIN' })
  @Field(() => String, { nullable: true })
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
