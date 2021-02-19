import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from './user';
import { Post } from './post';
import { posts } from './post.resolver';

@Resolver(() => User)
export class UserResolver {
  @ResolveField(() => [Post])
  posts(@Parent() user: User) {
    const userPosts = posts.filter(
      (p) => p.authorId.toString() === user.id.toString(),
    );
    return userPosts;
  }
}
