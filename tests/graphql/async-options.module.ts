import { Module } from '@nestjs/common';
import { join } from 'path';
import { MercuriusModule } from '../../lib';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    CatsModule,
    MercuriusModule.forRootAsync({
      useFactory: async () => ({
        typePaths: [join(__dirname, '**', '*.graphql')],
      }),
    }),
  ],
})
export class AsyncApplicationModule {}
