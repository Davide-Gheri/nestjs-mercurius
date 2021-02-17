import { Module } from '@nestjs/common';
import { MercuriusGatewayModule } from '../../../lib';

@Module({
  imports: [
    MercuriusGatewayModule.forRootAsync({
      useFactory: () => ({
        graphiql: 'playground',
        subscription: true,
        gateway: {
          services: [
            {
              name: 'user',
              url: 'http://localhost:3001/graphql',
              wsUrl: 'ws://localhost:3001/graphql',
              mandatory: true,
            },
            {
              name: 'post',
              url: 'http://localhost:3002/graphql',
              wsUrl: 'ws://localhost:3002/graphql',
              mandatory: true,
            },
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
