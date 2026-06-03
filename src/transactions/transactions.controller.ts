import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @Post()
  async create(
    @Body()
    createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(createTransactionDto);
  }
  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.transactionsService.findAll(userId);
  }

  @Get('summary')
  async getSummary(@Query('userId') userId: string) {
    return this.transactionsService.getSummary(userId);
  }
}
