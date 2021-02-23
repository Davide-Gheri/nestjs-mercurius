import { Inject, Injectable } from '@nestjs/common';
import { BaseExplorerService } from '@nestjs/graphql/dist/services';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { GRAPHQL_MODULE_OPTIONS } from '@nestjs/graphql/dist/graphql.constants';
import { MercuriusModuleOptions } from '../interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { extractHookMetadata } from '../utils/extract-hook-metadata.util';

@Injectable()
export class HookExplorerService extends BaseExplorerService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    @Inject(GRAPHQL_MODULE_OPTIONS)
    private readonly gqlOptions: MercuriusModuleOptions,
  ) {
    super();
  }

  explore() {
    const modules = this.getModules(
      this.modulesContainer,
      this.gqlOptions.include || [],
    );

    return this.flatMap(modules, (instance) => this.filterHooks(instance));
  }

  filterHooks<T = any>(wrapper: InstanceWrapper<T>) {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner.scanFromPrototype(instance, prototype, (name) =>
      extractHookMetadata(instance, prototype, name),
    );
  }
}
