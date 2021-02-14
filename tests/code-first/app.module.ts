import { Module } from '@nestjs/common';
import { MercuriusModule } from '../../lib';
import { DirectionsModule } from './directions/directions.module';
import { RecipesModule } from './recipes/recipes.module';

@Module({
  imports: [
    RecipesModule,
    DirectionsModule,
    MercuriusModule.forRoot({
      autoSchemaFile: true,
      subscription: true,
    }),
  ],
})
export class ApplicationModule {}
