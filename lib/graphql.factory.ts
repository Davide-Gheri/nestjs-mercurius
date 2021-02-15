import { Injectable } from '@nestjs/common';
import gql from 'graphql-tag';
import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLSchemaConfig,
  lexicographicSortSchema,
  printSchema,
} from 'graphql';
import { forEach, isEmpty, merge } from 'lodash';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeSchemas } from '@graphql-tools/merge';
import {
  DefinitionsGeneratorOptions,
  GraphQLAstExplorer,
  GraphQLSchemaHost,
} from '@nestjs/graphql';
import { SchemaDirectiveVisitor } from '@graphql-tools/utils';
import {
  ResolversExplorerService,
  ScalarsExplorerService,
} from '@nestjs/graphql/dist/services';
import { GraphQLSchemaBuilder } from '@nestjs/graphql/dist/graphql-schema.builder';
import { extend, removeTempField } from '@nestjs/graphql/dist/utils';
import { MercuriusModuleOptions, ValidationRules } from './interfaces';
import {
  LoadersExplorerService,
  ValidationRuleExplorerService,
} from './services';
import { existsSync, lstatSync, readFileSync } from 'fs';

@Injectable()
export class GraphQLFactory {
  constructor(
    private readonly resolversExplorerService: ResolversExplorerService,
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly graphqlAstExplorer: GraphQLAstExplorer,
    private readonly gqlSchemaBuilder: GraphQLSchemaBuilder,
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    private readonly loaderExplorerService: LoadersExplorerService,
    private readonly validationRuleExplorerService: ValidationRuleExplorerService,
  ) {}

  async mergeOptions(
    options: MercuriusModuleOptions = { typeDefs: [] },
  ): Promise<MercuriusModuleOptions> {
    const resolvers = this.resolversExplorerService.explore();
    const typesResolvers = extend(
      this.scalarsExplorerService.explore(),
      resolvers,
    );

    const transformSchema = async (schema: GraphQLSchema) =>
      options.transformSchema ? await options.transformSchema(schema) : schema;

    if (options.autoSchemaFile) {
      const autoGeneratedSchema: GraphQLSchema = await this.gqlSchemaBuilder.build(
        options.autoSchemaFile,
        options as any,
        this.resolversExplorerService.getAllCtors(),
      );
      const executableSchema = makeExecutableSchema({
        resolvers: extend(typesResolvers, options.resolvers),
        typeDefs: gql`
          ${printSchema(autoGeneratedSchema)}
        `,
        resolverValidationOptions: {
          ...(options.resolverValidationOptions || {}),
          requireResolversForResolveType: false,
        },
      });
      let schema = options.schema
        ? mergeSchemas({
            schemas: [options.schema, executableSchema],
          })
        : executableSchema;

      const autoGeneratedSchemaConfig = autoGeneratedSchema.toConfig();
      const schemaConfig = this.overrideOrExtendResolvers(
        schema.toConfig(),
        autoGeneratedSchemaConfig,
      );

      schema = new GraphQLSchema(schemaConfig);
      if (options.schemaDirectives) {
        SchemaDirectiveVisitor.visitSchemaDirectives(
          schema,
          options.schemaDirectives,
        );
      }

      schema = await transformSchema(schema);
      schema = options.sortSchema ? lexicographicSortSchema(schema) : schema;
      this.gqlSchemaHost.schema = schema;

      return {
        ...options,
        typeDefs: undefined,
        schema,
      };
    }
    if (isEmpty(options.typeDefs)) {
      const schema = await transformSchema(options.schema);
      this.gqlSchemaHost.schema = schema;
      return {
        ...options,
        typeDefs: undefined,
        schema,
      };
    }
    const executableSchema = makeExecutableSchema({
      resolvers: extend(typesResolvers, options.resolvers),
      directiveResolvers: options.directiveResolvers,
      schemaDirectives: options.schemaDirectives as any,
      typeDefs: gql`
        ${options.typeDefs}
      `,
      resolverValidationOptions: options.resolverValidationOptions,
    });
    let schema = options.schema
      ? mergeSchemas({
          schemas: [options.schema, executableSchema],
        })
      : executableSchema;

    removeTempField(schema);
    schema = await transformSchema(schema);
    schema = options.sortSchema ? lexicographicSortSchema(schema) : schema;
    this.gqlSchemaHost.schema = schema;

    return {
      ...options,
      typeDefs: undefined,
      schema,
    };
  }

  mergeValidationRules(existingValidationRules?: ValidationRules) {
    const rules = this.validationRuleExplorerService.explore();
    return (params) => [
      ...(existingValidationRules ? existingValidationRules(params) : []),
      ...rules.map((rule) => (context) => rule.validate(params, context)),
    ];
  }

  overrideOrExtendResolvers(
    executableSchemaConfig: GraphQLSchemaConfig,
    autoGeneratedSchemaConfig: GraphQLSchemaConfig,
  ): GraphQLSchemaConfig {
    const schemaConfig = autoGeneratedSchemaConfig;
    const rootResolverKeys: ('mutation' | 'query' | 'subscription')[] = [
      'mutation',
      'query',
      'subscription',
    ];

    rootResolverKeys
      .filter((key) => executableSchemaConfig[key] && schemaConfig[key])
      .forEach((key) => {
        const executableSchemaFields = executableSchemaConfig[key].getFields();
        const schemaFields = schemaConfig[key].getFields();

        forEach(executableSchemaFields, (value, resolverName) => {
          if (schemaFields[resolverName]) {
            schemaFields[resolverName].resolve =
              executableSchemaFields[resolverName].resolve;
            schemaFields[resolverName].subscribe =
              executableSchemaFields[resolverName].subscribe;
          } else {
            schemaFields[resolverName] = executableSchemaFields[resolverName];
          }
        });
      });

    const getAutoGeneratedTypeByName = (name: string): GraphQLObjectType =>
      schemaConfig.types.find(
        (type) => type.name === name,
      ) as GraphQLObjectType;

    executableSchemaConfig.types
      .filter((type) => type instanceof GraphQLObjectType)
      .forEach((type: GraphQLObjectType) => {
        const fields = type.getFields();
        const autoGeneratedType = getAutoGeneratedTypeByName(type.name);
        if (!autoGeneratedType) {
          return;
        }

        /**
         * Inherit "resolve()" functions from auto-generated interfaces
         */
        const implementedInterfaces = autoGeneratedType.getInterfaces() || [];
        if (implementedInterfaces.length > 0) {
          implementedInterfaces.forEach((interfaceRef) => {
            const interfaceInExecutableSchema = executableSchemaConfig.types.find(
              (type) => type.name === interfaceRef.name,
            ) as GraphQLObjectType;

            forEach(
              interfaceRef.getFields(),
              (value: GraphQLField<unknown, unknown>, key: string) => {
                const fieldInExecutableSchema = interfaceInExecutableSchema.getFields()[
                  key
                ];
                if (!fieldInExecutableSchema) {
                  return;
                }
                if (!fieldInExecutableSchema.resolve) {
                  return;
                }
                const baseClassField = autoGeneratedType.getFields()[key];
                baseClassField &&
                  (baseClassField.resolve = fieldInExecutableSchema.resolve);
              },
            );
          });
        }

        forEach(
          fields,
          (value: GraphQLField<unknown, unknown>, key: string) => {
            if (!value.resolve) {
              return;
            }
            const field = autoGeneratedType.getFields()[key];
            field && (field.resolve = value.resolve);
          },
        );
      });

    return schemaConfig;
  }

  async generateDefinitions(
    typeDefs: string | string[],
    options: MercuriusModuleOptions,
  ) {
    if (isEmpty(typeDefs) || !options.definitions) {
      return;
    }
    const definitionsGeneratorOptions: DefinitionsGeneratorOptions = {
      emitTypenameField: options.definitions.emitTypenameField,
      skipResolverArgs: options.definitions.skipResolverArgs,
      defaultScalarType: options.definitions.defaultScalarType,
      customScalarTypeMapping: options.definitions.customScalarTypeMapping,
      additionalHeader: options.definitions.additionalHeader,
    };
    const tsFile = await this.graphqlAstExplorer.explore(
      gql`
        ${typeDefs}
      `,
      options.definitions.path,
      options.definitions.outputAs,
      definitionsGeneratorOptions,
    );
    if (
      !existsSync(options.definitions.path) ||
      !lstatSync(options.definitions.path).isFile() ||
      readFileSync(options.definitions.path, 'utf8') !== tsFile.getFullText()
    ) {
      await tsFile.save();
    }
  }
}