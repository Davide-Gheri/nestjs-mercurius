import { Args, Context, Int, Parent, Query, ResolveField, Resolver, Mutation } from '@nestjs/graphql';
import { UserType } from '../types/user.type';
import { LoaderQuery, LoaderQueries, LoaderContext, ResolveLoader } from '../../../lib';
import { UserService } from '../services/user.service';
import { PostType } from '../types/post.type';
import { PostService } from '../services/post.service';
import { CreateUserInput } from '../inputs/create-user.input';

function calculateAge(birthday: Date): number {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Query(() => [UserType])
  users() {
    return this.userService.users();
  }

  @Mutation(() => UserType)
  createUser(
    @Args({ name: 'input', type: () => CreateUserInput }) data: CreateUserInput,
  ) {
    return this.userService.create(data);
  }

  @ResolveField(() => Int)
  async age(
    @Parent() user: UserType,
    @Context() ctx: any,
  ) {
    return calculateAge(user.birthDay);
  }

  @ResolveLoader(() => String, { nullable: true })
  async fullName(
    @Args({ name: 'filter', type: () => String, nullable: true }) f: never,
    @LoaderQueries() p: LoaderQuery<UserType>[],
    @LoaderContext() ctx: any,
  ) {
    return p.map(({ obj }) => {
      if (obj.name && obj.lastName) {
        return `${obj.name} ${obj.lastName}`;
      }
      return obj.name || obj.lastName;
    });
  }

  @ResolveLoader(() => [PostType])
  async posts(
    @LoaderQueries() queries: LoaderQuery<UserType>[],
  ) {
    return this.postService.userPostLoader(queries.map(q => q.obj.id));
  }
}
