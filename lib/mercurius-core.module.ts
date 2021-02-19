import { Global, Module } from '@nestjs/common';
import { PubSubHost } from './services';

@Global()
@Module({
  providers: [PubSubHost],
  exports: [PubSubHost],
})
export class MercuriusCoreModule {}
