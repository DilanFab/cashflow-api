import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { CreateTransactionDto } from './create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTransactionDto) {
    return await this.prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        status: data.status,
        categoryId: data.categoryId,
        userId: data.userId,
        description: data.description,
        date: new Date(data.date),
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getSummary(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === TransactionType.INCOME) {
        totalIncome += amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        totalExpense += amount;
      }
    });

    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
    };
  }
}
