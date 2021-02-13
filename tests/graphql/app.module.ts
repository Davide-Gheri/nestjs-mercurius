import { Module } from '@nestjs/common';
import { join } from 'path';
import { MercuriusModule } from '../../lib';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    CatsModule,
    MercuriusModule.forRoot({
      typePaths: [join(__dirname, '**', '*.graphql')],
    }),
  ],
})
export class ApplicationModule {}
