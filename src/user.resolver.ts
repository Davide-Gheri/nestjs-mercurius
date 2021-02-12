import { Resolver, Query, ResolveField } from '@nestjs/graphql';
import { UserType } from './user.type';

@Resolver(() => UserType)
export class UserResolver {
  @Query(() => [UserType])
  users() {
    return [
      {
        id: 1,
        name: 'user'
      }
    ]
  }

  // @ResolveField(() => String)
  // fullName(...args) {
  //   console.log(args);
  //   return 'eee';
  // }
}
