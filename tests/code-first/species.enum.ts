import { registerEnumType } from '@nestjs/graphql';

export enum Species {
  CAT = 'CAT',
  DOG = 'DOG',
}

registerEnumType(Species, {
  name: 'Species',
});
