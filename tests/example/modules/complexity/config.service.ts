import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get maxComplexity() {
    return 100;
  }
}
