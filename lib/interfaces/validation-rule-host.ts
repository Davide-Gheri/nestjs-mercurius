import { ASTVisitor, ValidationContext } from 'graphql';

export interface ValidationRuleHost {
  validate(
    params: {
      source: string;
      variables?: Record<string, any>;
      operationName?: string;
    },
    context: ValidationContext,
  ): ASTVisitor;
}
