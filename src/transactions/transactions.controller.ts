import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(SupabaseAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.transactionsService.findAll(user.id);
  }

  @Get('summary')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getSummary(@CurrentUser() user: { id: string }) {
    return this.transactionsService.getSummary(user.id);
  }
}
