import { Inject, Injectable } from '@nestjs/common';
import { BaseExplorerService } from '@nestjs/graphql/dist/services';
import { GRAPHQL_MODULE_OPTIONS } from '@nestjs/graphql/dist/graphql.constants';
import { MercuriusModuleOptions } from '../interfaces';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { VALIDATOR_METADATA } from '../constants';
import { ValidationRuleHost } from '../interfaces';

@Injectable()
export class ValidationRuleExplorerService extends BaseExplorerService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
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
    return this.flatMap<ValidationRuleHost>(modules, (instance) =>
      this.filterValidationRules(instance),
    );
  }

  filterValidationRules<T = any>(wrapper: InstanceWrapper<T>) {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    const metadata = Reflect.getMetadata(
      VALIDATOR_METADATA,
      instance.constructor,
    );
    return metadata ? instance : undefined;
  }
}
