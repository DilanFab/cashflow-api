import {
  IsNumber,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsPositive,
} from 'class-validator';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  amount: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
