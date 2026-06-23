import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { CreateTransactionDto } from './create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    return await this.prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        status: data.status,
        categoryId: data.categoryId,
        userId,
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
    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });

    const totalIncome = Number(
      grouped.find((g) => g.type === TransactionType.INCOME)?._sum.amount ?? 0,
    );
    const totalExpense = Number(
      grouped.find((g) => g.type === TransactionType.EXPENSE)?._sum.amount ?? 0,
    );

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
