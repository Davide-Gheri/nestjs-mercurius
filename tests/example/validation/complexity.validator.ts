import { ASTVisitor, ValidationContext } from 'graphql';
import QueryComplexity from 'graphql-query-complexity/dist/QueryComplexity';
import {
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-query-complexity';
import { ValidationRule } from '../../../lib';
import { ValidationRuleHost } from '../../../lib';

@ValidationRule()
export class ComplexityValidator implements ValidationRuleHost {
  validate(
    params: {
      source: string;
      variables?: Record<string, any>;
      operationName?: string;
    },
    context: ValidationContext,
  ): ASTVisitor {
    return new QueryComplexity(context, {
      maximumComplexity: 100,
      variables: params.variables,
      operationName: params.operationName,
      estimators: [
        fieldExtensionsEstimator(),
        simpleEstimator({ defaultComplexity: 1 }),
      ],
      onComplete(complexity) {
        console.log('Test validator complexity:', complexity);
      },
    });
  }
}
