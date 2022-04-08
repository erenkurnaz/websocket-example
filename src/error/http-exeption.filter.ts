import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService<IConfig>,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    let errorResponse;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const mode = this.config.get('mode');

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (mode === 'dev')
      errorResponse = {
        httpStatus,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        errorName: exception?.name,
        message: exception?.message,
      };

    if (mode === 'prod')
      errorResponse = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        message: exception.message,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };

    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
