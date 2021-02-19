import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ComplexityValidator } from './validation/complexity.validator';

@Module({
  providers: [ConfigService, ComplexityValidator],
})
export class ComplexityModule {}
