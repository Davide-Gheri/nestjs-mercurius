import { Injectable } from '@nestjs/common';
import { GraphQLHook } from '../../../../lib';

@Injectable()
export class ConfigService {
  get maxComplexity() {
    return 100;
  }

  @GraphQLHook('preParsing')
  async preParse() {}
}
