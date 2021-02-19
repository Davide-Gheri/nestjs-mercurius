import { createUnionType, Query, Resolver } from '@nestjs/graphql';
import { PostType } from '../../../types/post.type';
import { UserType } from '../../../types/user.type';
import { users } from '../services/user.service';
import { posts } from '../services/post.service';

function isUser(value: PostType | UserType): value is UserType {
  return 'birthDay' in value;
}

function isPost(value: PostType | UserType): value is PostType {
  return 'title' in value;
}

const SearchUnion = createUnionType({
  name: 'SearchUnion',
  types: () => [PostType, UserType],
  resolveType: (value: PostType | UserType) => {
    if (isUser(value)) {
      return UserType;
    }
    if (isPost(value)) {
      return PostType;
    }
    return null;
  },
});

@Resolver()
export class SearchResolver {
  @Query(() => [SearchUnion])
  search() {
    return [...users, ...posts];
  }
}
