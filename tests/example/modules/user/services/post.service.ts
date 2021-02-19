import { Injectable } from '@nestjs/common';
import { PostType } from '../../../types/post.type';
import { groupBy } from 'lodash';

export const posts: PostType[] = [
  {
    id: '1',
    title: 'Post1',
    authorId: '1',
  },
  {
    id: '2',
    title: 'Post2',
    authorId: '1',
  },
  {
    id: '3',
    title: 'Post3',
    authorId: '2',
  },
];

@Injectable()
export class PostService {
  posts() {
    return posts;
  }

  userPostLoader(userIds: string[]) {
    const groupedPosts = groupBy(
      posts.filter((post) => userIds.includes(post.authorId)),
      'authorId',
    );

    return userIds.map((id) => groupedPosts[id] || []);
  }
}
