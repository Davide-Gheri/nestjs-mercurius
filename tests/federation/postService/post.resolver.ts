import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Post } from './post';
import { User } from './user';

export const posts: Post[] = [
  {
    id: 1,
    title: 'p1',
    authorId: 1,
    publishedAt: new Date(),
  },
  {
    id: 2,
    title: 'p2',
    authorId: 1,
    publishedAt: new Date(),
  },
];

@Resolver(() => Post)
export class PostResolver {
  @Query(() => [Post])
  posts() {
    return posts;
  }

  @ResolveField(() => User)
  author(@Parent() post: Post) {
    return { __typename: 'User', id: post.authorId };
  }
}
