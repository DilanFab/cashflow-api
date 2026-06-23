import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { AuthService } from '../auth.service';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;

  const mockAuthService = {
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    guard = module.get<SupabaseAuthGuard>(SupabaseAuthGuard);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
      user: undefined as unknown,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no Authorization header', async () => {
      const context = createMockContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is missing from header', async () => {
      const context = createMockContext('Bearer ');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when verifyToken fails', async () => {
      mockAuthService.verifyToken.mockRejectedValue(
        new UnauthorizedException('Token inválido'),
      );
      const context = createMockContext('Bearer invalid-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true and attach user to request when token is valid', async () => {
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      mockAuthService.verifyToken.mockResolvedValue(mockUser);

      const context = createMockContext('Bearer valid-token');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token');

      const request: { user: { id: string; email: string } } = context
        .switchToHttp()
        .getRequest();
      expect(request.user).toEqual(mockUser);
    });
  });
});
