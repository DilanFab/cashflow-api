import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [AuthModule]
})
export class TransactionsModule {}
