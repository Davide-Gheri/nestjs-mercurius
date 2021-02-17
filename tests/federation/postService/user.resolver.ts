import {
  Context,
  ID,
  Parent,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { User } from './user';
import { Post } from './post';
import { posts } from './post.resolver';
import { PubSub } from 'mercurius';
import { toAsyncIterator } from '../../../lib';

@Resolver(() => User)
export class UserResolver {
  @ResolveField(() => [Post])
  posts(@Parent() user: User) {
    const userPosts = posts.filter(
      (p) => p.authorId.toString() === user.id.toString(),
    );
    // console.log('qui', userPosts, user);
    return userPosts;
  }
}
