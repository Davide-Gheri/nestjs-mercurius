import { BaseMercuriusModuleOptions } from './base-mercurius-module-options.interface';
import { MercuriusGatewayOptions } from 'mercurius';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface MercuriusGatewayModuleOptions
  extends BaseMercuriusModuleOptions,
    MercuriusGatewayOptions {}

export interface MercuriusGatewayOptionsFactory {
  createMercuriusGatewayOptions():
    | Promise<MercuriusGatewayModuleOptions>
    | MercuriusGatewayModuleOptions;
}

export interface MercuriusGatewayModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MercuriusGatewayOptionsFactory>;
  useClass?: Type<MercuriusGatewayOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MercuriusGatewayModuleOptions> | MercuriusGatewayModuleOptions;
  inject?: any[];
}
