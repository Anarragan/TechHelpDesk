import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Custom exception for business logic errors
 */
export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}

/**
 * Filter to catch and format business logic exceptions
 */
@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name);

  catch(exception: BusinessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    this.logger.warn(
      `Business Exception: ${exception.code} - ${exception.message} - Path: ${request.url}`,
    );

    response.status(exception.statusCode).json({
      success: false,
      statusCode: exception.statusCode,
      errorCode: exception.code,
      message: [exception.message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
