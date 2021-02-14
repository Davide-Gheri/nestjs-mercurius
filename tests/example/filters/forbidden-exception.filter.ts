import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';
import { GqlArgumentsHost } from '../../../lib';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const gqlHost = GqlArgumentsHost.create(host);

    throw exception;
  }
}
