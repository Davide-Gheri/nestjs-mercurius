import {
  Args,
  Context,
  InputType,
  Mutation,
  OmitType,
  Query,
  Resolver,
  ResolveReference,
  Subscription,
} from '@nestjs/graphql';
import { User } from './user';
import { PubSub } from 'mercurius';
import {
  LoaderQuery,
  Reference,
  ResolveReferenceLoader,
  toAsyncIterator,
} from '../../../lib';

const users: User[] = [
  {
    id: 1,
    name: 'u1',
  },
  {
    id: 2,
    name: 'u2',
  },
];

let nextId = 3;

@InputType()
class CreateUserInput extends OmitType(User, ['id'], InputType) {}

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  users() {
    return users;
  }

  @ResolveReferenceLoader()
  resolveReference(refs: LoaderQuery<Reference<'User', 'id'>>[]) {
    const refIds = refs.map(({ obj }) => obj.id.toString());

    return users.filter((u) => refIds.includes(u.id.toString()));
  }

  @Mutation(() => User)
  createUser(
    @Args('input') data: CreateUserInput,
    @Context('pubsub') pubSub: PubSub,
  ) {
    const user = {
      ...data,
      id: nextId,
    };
    users.push(user);
    pubSub.publish({
      topic: 'createUser',
      payload: { user },
    });

    nextId++;

    return user;
  }

  @Subscription(() => User, {
    resolve: (payload) => payload.user,
  })
  onCreateUser(@Context('pubsub') pubSub: PubSub) {
    return toAsyncIterator(pubSub.subscribe('createUser'));
  }
}
