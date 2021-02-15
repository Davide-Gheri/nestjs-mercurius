import { CustomScalar, Scalar } from '@nestjs/graphql';
import * as crypto from 'crypto';
import { Kind, ValueNode } from 'graphql';

const algo = 'aes-256-ctr';
const key = Buffer.from(
  crypto.createHash('sha256').update('secret').digest().slice(0, 32),
);
const iv = Buffer.from(
  crypto.createHash('sha256').update('secret').digest().slice(0, 16),
);

@Scalar('Hash', () => HashScalar)
export class HashScalar implements CustomScalar<string, string> {
  description = 'Hash scalar';

  parseValue(value: string): string {
    return crypto
      .createDecipheriv(algo, key, iv)
      .update(value, 'base64')
      .toString();
  }

  serialize(value: string): string {
    return crypto
      .createCipheriv(algo, key, iv)
      .update(value)
      .toString('base64');
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null;
  }
}
