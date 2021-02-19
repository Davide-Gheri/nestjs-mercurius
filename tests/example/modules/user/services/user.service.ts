import { Injectable } from '@nestjs/common';
import { UserType } from '../../../types/user.type';
import { CreateUserInput } from '../inputs/create-user.input';
import { PubSubHost } from '../../../../../lib';

export const users: UserType[] = [
  {
    id: '1',
    name: 'foo',
    lastName: 'bar',
    birthDay: new Date(),
    secret: 'supersecret',
    meta: {
      foo: 'bar',
    },
  },
  {
    id: '2',
    birthDay: new Date(),
  },
  {
    id: '3',
    name: 'baz',
    birthDay: new Date(),
  },
  {
    id: '4',
    name: 'bep',
    birthDay: new Date(),
  },
];
let nextId = 5;

@Injectable()
export class UserService {
  constructor(private readonly pubSubHost: PubSubHost) {}

  users() {
    return users;
  }

  find(id: number) {
    return users.find((user) => user.id === id.toString());
  }

  create(data: CreateUserInput) {
    const user = {
      ...data,
      id: nextId.toString(),
    };
    nextId++;
    users.push(user);

    this.pubSubHost.getInstance()?.publish({
      topic: 'USER_ADDED',
      payload: {
        userAdded: user,
      },
    });

    return user;
  }
}
