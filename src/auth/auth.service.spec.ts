import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

const mockGetUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  }),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockGetUser.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should return user when token is valid', async () => {
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.verifyToken('valid-token');
      expect(result).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when user is null', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when Supabase call fails', async () => {
      mockGetUser.mockRejectedValue(new Error('Network error'));

      await expect(service.verifyToken('any-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
