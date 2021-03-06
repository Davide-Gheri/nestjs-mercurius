import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  Subscription,
  ID,
} from '@nestjs/graphql';
import { UserType } from '../../../types/user.type';
import { PostType } from '../../../types/post.type';
import {
  LoaderQuery,
  ResolveLoader,
  toAsyncIterator,
} from '../../../../../lib';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { CreateUserInput } from '../inputs/create-user.input';
import { MercuriusContext } from 'mercurius';
import {
  ParseIntPipe,
  UseFilters,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { LogInterceptor } from '../../../interceptors/log.interceptor';
import { ForbiddenExceptionFilter } from '../../../filters/forbidden-exception.filter';
import { Header } from '../../../decorators/header.decorator';
import { FullNameArgs } from '../inputs/full-name.args';
import { AuthGuard } from '../../../guards/auth.guard';

function calculateAge(birthday: Date): number {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

@UseFilters(ForbiddenExceptionFilter)
@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Query(() => [UserType], {
    complexity: (options) => options.childComplexity + 5,
  })
  users() {
    return this.userService.users();
  }

  @Query(() => UserType, { nullable: true })
  user(@Args({ name: 'id', type: () => ID }, ParseIntPipe) id: number) {
    return this.userService.find(id);
  }

  @Mutation(() => UserType)
  createUser(
    @Args({ name: 'input', type: () => CreateUserInput }) data: CreateUserInput,
    @Context() ctx: MercuriusContext,
  ) {
    const user = this.userService.create(data);

    return user;
  }

  @ResolveField(() => Int, { complexity: 5 })
  async age(
    @Parent() user: UserType,
    @Context('headers') headers: Record<string, any>,
  ) {
    return calculateAge(user.birthDay);
  }

  @ResolveLoader(() => String, {
    nullable: true,
    complexity: (options) => {
      return 5;
    },
    middleware: [
      async (ctx, next) => {
        const results = await next();
        return results.map((res) => res || 'Missing');
      },
    ],
    opts: {
      cache: false,
    },
  })
  async fullName(
    @Args({ type: () => FullNameArgs }) args: FullNameArgs[],
    @Parent() p: LoaderQuery<UserType>[],
    @Context() ctx: Record<string, any>,
    @Header('authorization') auth?: string,
  ) {
    return p.map(({ obj }) => {
      if (obj.name && obj.lastName) {
        return `${obj.name} ${obj.lastName}`;
      }
      return obj.name || obj.lastName;
    });
  }

  // @UseGuards(AuthGuard)
  @UseInterceptors(LogInterceptor)
  @ResolveLoader(() => [PostType])
  async posts(@Parent() queries: LoaderQuery<UserType>[]) {
    return this.postService.userPostLoader(queries.map((q) => q.obj.id));
  }

  @UseInterceptors(LogInterceptor)
  @Subscription(() => UserType)
  async userAdded(@Context() ctx: MercuriusContext) {
    return ctx.pubsub.subscribe('USER_ADDED');
  }

  @Subscription(() => String, {
    resolve: (payload) => {
      return payload.userAdded.id;
    },
  })
  async userAddedId(@Context() ctx: MercuriusContext) {
    return ctx.pubsub.subscribe('USER_ADDED');
  }

  @Subscription(() => UserType, {
    filter: (payload, variables: { id: string }) => {
      return payload.userAdded.id === variables.id;
    },
    resolve: (payload) => {
      return payload.userAdded;
    },
  })
  async specificUserAdded(
    @Args({ name: 'id', type: () => ID }) id: string,
    @Context() ctx: MercuriusContext,
  ) {
    return toAsyncIterator(ctx.pubsub.subscribe('USER_ADDED'));
  }
}
