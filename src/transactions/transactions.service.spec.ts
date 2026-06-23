import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      amount: 150.5,
      type: TransactionType.INCOME,
      status: TransactionStatus.RECEIVED,
      categoryId: 'cat-123',
      description: 'Test',
      date: '2026-06-03T12:00:00.000Z',
    };

    it('should create a transaction with the provided userId', async () => {
      const mockCategory = { id: 'cat-123', name: 'Freelance' };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const mockTransaction = { id: 'tx-1', ...dto, userId: 'user-123' };
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create('user-123', dto);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: 150.5,
          type: TransactionType.INCOME,
          status: TransactionStatus.RECEIVED,
          categoryId: 'cat-123',
          userId: 'user-123',
          description: 'Test',
          date: new Date('2026-06-03T12:00:00.000Z'),
        },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.create('user-123', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return transactions for the given userId', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          amount: 100,
          type: TransactionType.INCOME,
          userId: 'user-123',
          category: { id: 'cat-1', name: 'Freelance' },
        },
      ];
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.findAll('user-123');

      expect(result).toEqual(mockTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { category: true },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('getSummary', () => {
    it('should return income, expense, and balance using groupBy', async () => {
      mockPrismaService.transaction.groupBy.mockResolvedValue([
        { type: TransactionType.INCOME, _sum: { amount: 700 } },
        { type: TransactionType.EXPENSE, _sum: { amount: 300 } },
      ]);

      const result = await service.getSummary('user-123');

      expect(result).toEqual({
        totalIncome: 700,
        totalExpense: 300,
        balance: 400,
      });
      expect(mockPrismaService.transaction.groupBy).toHaveBeenCalledWith({
        by: ['type'],
        where: { userId: 'user-123' },
        _sum: { amount: true },
      });
    });

    it('should return zeros when no transactions exist', async () => {
      mockPrismaService.transaction.groupBy.mockResolvedValue([]);

      const result = await service.getSummary('user-123');

      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      });
    });

    it('should handle only income transactions', async () => {
      mockPrismaService.transaction.groupBy.mockResolvedValue([
        { type: TransactionType.INCOME, _sum: { amount: 500 } },
      ]);

      const result = await service.getSummary('user-123');

      expect(result).toEqual({
        totalIncome: 500,
        totalExpense: 0,
        balance: 500,
      });
    });
  });
});
