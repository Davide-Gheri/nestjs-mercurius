import { ASTVisitor, ValidationContext } from 'graphql';
import QueryComplexity from 'graphql-query-complexity/dist/QueryComplexity';
import {
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-query-complexity';
import { ValidationRuleHost, ValidationRule } from '../../../../../lib';
import { ConfigService } from '../config.service';

@ValidationRule()
export class ComplexityValidator implements ValidationRuleHost {
  constructor(private readonly configService: ConfigService) {}

  validate(
    params: {
      source: string;
      variables?: Record<string, any>;
      operationName?: string;
    },
    context: ValidationContext,
  ): ASTVisitor {
    return new QueryComplexity(context, {
      maximumComplexity: this.configService.maxComplexity,
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
