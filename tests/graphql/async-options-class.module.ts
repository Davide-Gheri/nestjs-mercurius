import { Module } from '@nestjs/common';
import { join } from 'path';
import { MercuriusModule, MercuriusModuleOptions, MercuriusOptionsFactory } from '../../lib';
import { CatsModule } from './cats/cats.module';

class ConfigService implements MercuriusOptionsFactory {
  createMercuriusOptions(): MercuriusModuleOptions {
    return {
      typePaths: [join(__dirname, '**', '*.graphql')],
    };
  }
}

@Module({
  imports: [
    CatsModule,
    MercuriusModule.forRootAsync({
      useClass: ConfigService,
    }),
  ],
})
export class AsyncClassApplicationModule {}
