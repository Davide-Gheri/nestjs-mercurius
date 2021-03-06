import { Injectable, Logger } from '@nestjs/common';
import { GraphQLSchema } from 'graphql';
import {
  GraphQLAstExplorer,
  GraphQLSchemaHost,
  GraphQLFactory as NestGraphQLFactory,
} from '@nestjs/graphql';
import {
  PluginsExplorerService,
  ResolversExplorerService,
  ScalarsExplorerService,
} from '@nestjs/graphql/dist/services';
import { GraphQLSchemaBuilder } from '@nestjs/graphql/dist/graphql-schema.builder';
import { MercuriusModuleOptions } from '../interfaces';
import { LoadersExplorerService } from '../services';
import { transformFederatedSchema } from '../utils/faderation-factory.util';

@Injectable()
export class GraphQLFactory extends NestGraphQLFactory {
  private readonly logger = new Logger(GraphQLFactory.name);

  constructor(
    resolversExplorerService: ResolversExplorerService,
    scalarsExplorerService: ScalarsExplorerService,
    pluginExplorerService: PluginsExplorerService,
    graphqlAstExplorer: GraphQLAstExplorer,
    gqlSchemaBuilder: GraphQLSchemaBuilder,
    gqlSchemaHost: GraphQLSchemaHost,
    protected readonly loaderExplorerService: LoadersExplorerService,
  ) {
    super(
      resolversExplorerService,
      scalarsExplorerService,
      pluginExplorerService,
      graphqlAstExplorer,
      gqlSchemaBuilder,
      gqlSchemaHost,
    );
  }

  async mergeOptions(options?: any): Promise<any> {
    if (options.federationMetadata) {
      options.buildSchemaOptions = {
        ...options.buildSchemaOptions,
        skipCheck: true,
      };
    }
    const parentOptions = (await super.mergeOptions(
      options as any,
    )) as unknown as MercuriusModuleOptions & {
      plugins: any[];
      schema: GraphQLSchema;
    };
    if (parentOptions.plugins?.length) {
      const pluginNames = parentOptions.plugins
        .map((p) => p.name)
        .filter(Boolean);
      this.logger.warn(
        `Plugins are not supported by Mercurius, ignoring: ${pluginNames.join(
          ', ',
        )}`,
      );
    }
    delete parentOptions.plugins;
    parentOptions.loaders = this.loaderExplorerService.explore();
    if (options.federationMetadata) {
      parentOptions.schema = transformFederatedSchema(parentOptions.schema);
    }

    return parentOptions;
  }
}
