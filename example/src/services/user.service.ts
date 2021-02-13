import { Injectable } from '@nestjs/common';
import { UserType } from '../types/user.type';
import { CreateUserInput } from '../inputs/create-user.input';

export const users: UserType[] = [
  {
    id: '1',
    name: 'foo',
    lastName: 'bar',
    birthDay: new Date(),
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
  users() {
    return users;
  }

  create(data: CreateUserInput) {
    const user = {
      ...data,
      id: nextId.toString(),
    };
    nextId++;
    users.push(user);
    return user;
  }
}
