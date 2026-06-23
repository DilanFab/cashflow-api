import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getSummary: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<TransactionsController>(TransactionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction using the authenticated user id', async () => {
      const dto = {
        amount: 100,
        type: TransactionType.INCOME,
        status: TransactionStatus.RECEIVED,
        categoryId: 'cat-1',
        date: '2026-06-03T12:00:00.000Z',
      };
      const mockUser = { id: 'user-123' };
      const mockResult = { id: 'tx-1', ...dto, userId: 'user-123' };
      mockTransactionsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockResult);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(
        'user-123',
        dto,
      );
    });
  });

  describe('findAll', () => {
    it('should return transactions for the authenticated user', async () => {
      const mockUser = { id: 'user-123' };
      const mockTransactions = [{ id: 'tx-1', userId: 'user-123' }];
      mockTransactionsService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionsService.findAll).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getSummary', () => {
    it('should return summary for the authenticated user', async () => {
      const mockUser = { id: 'user-123' };
      const mockSummary = {
        totalIncome: 500,
        totalExpense: 200,
        balance: 300,
      };
      mockTransactionsService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(mockUser);

      expect(result).toEqual(mockSummary);
      expect(mockTransactionsService.getSummary).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });
});
