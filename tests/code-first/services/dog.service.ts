import { Injectable } from '@nestjs/common';
import { Species } from '../species.enum';
import { Dog } from '../types/dog';
import { CreateDogInput } from '../inputs/create-dog.input';

export const dogs: Dog[] = [
  {
    id: 1,
    species: Species.DOG,
    age: 2,
  },
  {
    id: 2,
    species: Species.DOG,
    age: 5,
  },
];

let nextId = 3;

@Injectable()
export class DogService {
  dogs() {
    return dogs;
  }

  god(id: number) {
    dogs.find((c) => c.id === id);
  }

  createDog(data: CreateDogInput) {
    const dog: Dog = {
      ...data,
      species: Species.DOG,
      id: nextId,
    };
    nextId++;
    dogs.push(dog);
    return dogs;
  }

  deleteDog(id: number) {
    const idx = dogs.findIndex((c) => c.id === id);
    if (idx < 0) {
      return false;
    }
    dogs.splice(idx, 1);
    return true;
  }
}
