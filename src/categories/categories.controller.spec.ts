import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TransactionType } from '@prisma/client';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAll: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Freelance', type: TransactionType.INCOME },
        { id: 'cat-2', name: 'Gasolina', type: TransactionType.EXPENSE },
      ];
      mockCategoriesService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockCategoriesService.findAll).toHaveBeenCalled();
    });
  });
});
