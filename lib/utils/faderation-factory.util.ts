/**
 * Inspired by the official Mercurius federation `buildFederationSchema`
 * https://github.com/mercurius-js/mercurius/blob/master/lib/federation.js
 *
 */
import {
  extendSchema,
  GraphQLObjectType,
  GraphQLSchema,
  isObjectType,
  parse,
  printSchema,
  visit,
  print,
  GraphQLDirective,
  DirectiveNode,
} from 'graphql';
import { MER_ERR_GQL_GATEWAY_INVALID_SCHEMA } from 'mercurius/lib/errors';
import { loadPackage } from '@nestjs/common/utils/load-package.util';

const federationDirectives = [
  {
    name: 'key',
    typeDef: `directive @key(fields: _FieldSet!) on OBJECT | INTERFACE`,
  },
  {
    name: 'extends',
    typeDef: `directive @extends on OBJECT | INTERFACE`,
  },
  {
    name: 'external',
    typeDef: `directive @external on FIELD_DEFINITION`,
  },
  {
    name: 'requires',
    typeDef: `directive @requires(fields: _FieldSet!) on FIELD_DEFINITION`,
  },
  {
    name: 'provides',
    typeDef: `directive @provides(fields: _FieldSet!) on FIELD_DEFINITION`,
  },
];

export const FEDERATION_SCHEMA = `
  scalar _Any
  scalar _FieldSet
  ${federationDirectives.map((fd) => fd.typeDef).join('\n')}
  type _Service {
    sdl: String
  }
`;

export function gatherDirectives(type) {
  let directives = [];
  for (const node of type.extensionASTNodes || []) {
    if (node.directives) {
      directives = directives.concat(node.directives);
    }
  }

  if (type.astNode && type.astNode.directives) {
    directives = directives.concat(type.astNode.directives);
  }

  return directives;
}

export function typeIncludesDirective(type, directiveName) {
  return gatherDirectives(type).some(
    (directive) => directive.name.value === directiveName,
  );
}

function addTypeNameToResult(result, typename) {
  if (result !== null && typeof result === 'object') {
    Object.defineProperty(result, '__typename', {
      value: typename,
    });
  }
  return result;
}

/**
 * Inspired by https://github.com/mercurius-js/mercurius/blob/master/lib/federation.js#L231
 * Accept a GraphQLSchema to transform instead of a plain string containing a graphql schema
 * @param schema
 */
export function transformFederatedSchema(schema: GraphQLSchema) {
  const schemaString = printWithFederationDirectives(schema);

  schema = extendSchema(schema, parse(FEDERATION_SCHEMA), {
    assumeValidSDL: true,
  });

  if (!schema.getType('Query')) {
    schema = new GraphQLSchema({
      ...schema.toConfig(),
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {},
      }),
    });
  }

  schema = extendSchema(
    schema,
    parse(`
    extend type Query {
      _service: _Service!
    }
  `),
    {
      assumeValid: true,
    },
  );

  const query = schema.getType('Query') as GraphQLObjectType;
  const queryFields = query.getFields();

  queryFields._service = {
    ...queryFields._service,
    resolve: () => ({ sdl: schemaString }),
  };

  const entityTypes = Object.values(schema.getTypeMap()).filter(
    (type) => isObjectType(type) && typeIncludesDirective(type, 'key'),
  );

  if (entityTypes.length > 0) {
    schema = extendSchema(
      schema,
      parse(`
      union _Entity = ${entityTypes.join(' | ')}
      extend type Query {
        _entities(representations: [_Any!]!): [_Entity]!
      }
    `),
      {
        assumeValid: true,
      },
    );

    const query = schema.getType('Query') as GraphQLObjectType;
    const queryFields = query.getFields();
    queryFields._entities = {
      ...queryFields._entities,
      resolve: (_source, { representations }, context, info) => {
        return representations.map((reference) => {
          const { __typename } = reference;

          const type = info.schema.getType(__typename);
          if (!type || !isObjectType(type)) {
            throw new MER_ERR_GQL_GATEWAY_INVALID_SCHEMA(__typename);
          }

          const resolveReference = (type as any).resolveReference
            ? (type as any).resolveReference
            : function defaultResolveReference() {
                return reference;
              };

          const result = resolveReference(reference, {}, context, info);

          if (result && 'then' in result && typeof result.then === 'function') {
            return result.then((x) => addTypeNameToResult(x, __typename));
          }

          return addTypeNameToResult(result, __typename);
        });
      },
    };
  }

  return schema;
}

function isFederationDirective(
  directive: GraphQLDirective | DirectiveNode,
): boolean {
  const name =
    typeof directive.name === 'string' ? directive.name : directive.name.value;
  return federationDirectives.some((fd) => fd.name === name);
}

function printWithFederationDirectives(schema: GraphQLSchema) {
  const sdl = printSchema(schema);
  let currentType: GraphQLObjectType;
  const modifiedAST = visit(parse(sdl), {
    ObjectTypeDefinition(node) {
      currentType = schema.getType(node.name.value) as GraphQLObjectType;

      return {
        ...node,
        directives: currentType.astNode?.directives.filter(
          isFederationDirective,
        ),
      };
    },
    InterfaceTypeDefinition(node) {
      currentType = schema.getType(node.name.value) as GraphQLObjectType;

      return {
        ...node,
        directives: currentType.astNode?.directives.filter(
          isFederationDirective,
        ),
      };
    },
    FieldDefinition(node) {
      const fieldDef = currentType.getFields()[node.name.value];

      return {
        ...node,
        directives: fieldDef.astNode?.directives.filter(isFederationDirective),
      };
    },
    Field(node) {
      const fieldDef = currentType.getFields()[node.name.value];

      return {
        ...node,
        directives: fieldDef.astNode?.directives.filter(isFederationDirective),
      };
    },
  });
  return print(modifiedAST);
}
