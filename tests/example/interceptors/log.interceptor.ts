import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '../../../lib';
import { tap } from 'rxjs/operators';

export class LogInterceptor implements NestInterceptor {
  private logger = new Logger(LogInterceptor.name, true);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const ctx = GqlExecutionContext.create(context);

    this.logger.warn(
      `Before - ${ctx.getClass().name}@${ctx.getHandler().name}`,
    );

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.warn(
            `After - ${ctx.getClass().name}@${ctx.getHandler().name}`,
          ),
        ),
      );
  }
}
