import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql';
import { Person } from './person.interface';

@ObjectType('Customer', {
  implements: Person,
})
export class CustomerType implements Person {
  @Field(() => ID)
  id: string;

  @Extensions({ role: 'ADMIN' })
  @Field(() => String, { nullable: true })
  name?: string;
}
