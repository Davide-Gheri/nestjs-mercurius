import { SetMetadata } from '@nestjs/common';
import { VALIDATOR_METADATA } from '../constants';

export function ValidationRule(): ClassDecorator {
  return (target: Function) => {
    SetMetadata(VALIDATOR_METADATA, true)(target);
  };
}
