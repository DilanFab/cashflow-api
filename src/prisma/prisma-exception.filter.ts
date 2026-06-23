import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const statusMap: Record<string, HttpStatus> = {
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
      P2003: HttpStatus.BAD_REQUEST,
    };

    const status =
      statusMap[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
