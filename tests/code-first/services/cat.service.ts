import { Injectable } from '@nestjs/common';
import { Cat } from '../types/cat';
import { Species } from '../species.enum';
import { CreateCatInput } from '../inputs/create-cat.input';

export const cats: Cat[] = [
  {
    id: 1,
    species: Species.CAT,
    lives: 9,
    name: 'fufy',
  },
  {
    id: 2,
    species: Species.CAT,
    lives: 9,
    name: 'tigger',
  },
];

let nextId = 3;

@Injectable()
export class CatService {
  cats() {
    return cats;
  }

  cat(id: number) {
    return cats.find((c) => c.id === id);
  }

  createCat(data: CreateCatInput) {
    const cat: Cat = {
      ...data,
      species: Species.CAT,
      id: nextId,
    };
    nextId++;
    cats.push(cat);
    return cat;
  }

  deleteCat(id: number) {
    const idx = cats.findIndex((c) => c.id === id);
    if (idx < 0) {
      return false;
    }
    cats.splice(idx, 1);
    return true;
  }
}
