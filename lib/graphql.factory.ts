import { Injectable } from '@nestjs/common';
import {
  GraphQLAstExplorer,
  GraphQLFactory as NestGraphQLFactory,
  GraphQLSchemaHost,
} from '@nestjs/graphql';
import {
  PluginsExplorerService,
  ResolversExplorerService,
  ScalarsExplorerService,
} from '@nestjs/graphql/dist/services';
import { GraphQLSchemaBuilder } from '@nestjs/graphql/dist/graphql-schema.builder';
import { extend } from '@nestjs/graphql/dist/utils';
import { MercuriusModuleOptions, ValidationRules } from './interfaces';
import {
  LoadersExplorerService,
  ValidationRuleExplorerService,
} from './services';

@Injectable()
export class GraphQLFactory extends NestGraphQLFactory {
  constructor(
    resolversExplorerService: ResolversExplorerService,
    scalarsExplorerService: ScalarsExplorerService,
    // FIXME this should be removed since Plugins are not supported by Mercurius
    pluginsExplorerService: PluginsExplorerService,
    graphqlAstExplorer: GraphQLAstExplorer,
    gqlSchemaBuilder: GraphQLSchemaBuilder,
    gqlSchemaHost: GraphQLSchemaHost,
    private readonly loaderExplorerService: LoadersExplorerService,
    private readonly validationRuleExplorerService: ValidationRuleExplorerService,
  ) {
    super(
      resolversExplorerService,
      scalarsExplorerService,
      pluginsExplorerService,
      graphqlAstExplorer,
      gqlSchemaBuilder,
      gqlSchemaHost,
    );
  }

  async mergeOptions(options?: any): Promise<any> {
    const parentOptions = ((await super.mergeOptions(
      options as any,
    )) as unknown) as MercuriusModuleOptions;
    delete (parentOptions as any).plugins;

    parentOptions.loaders = extend(
      parentOptions.loaders || {},
      this.loaderExplorerService.explore(),
    );

    parentOptions.validationRules = this.mergeValidationRules(
      parentOptions.validationRules,
    );

    return parentOptions;
  }

  mergeValidationRules(existingValidationRules?: ValidationRules) {
    const rules = this.validationRuleExplorerService.explore();
    return (params) => [
      ...(existingValidationRules ? existingValidationRules(params) : []),
      ...rules.map((rule) => (context) => rule.validate(params, context)),
    ];
  }
}
