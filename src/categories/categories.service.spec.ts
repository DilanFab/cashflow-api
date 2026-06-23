import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '@prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Freelance', type: TransactionType.INCOME },
        { id: 'cat-2', name: 'Gasolina', type: TransactionType.EXPENSE },
      ];
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no categories exist', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
