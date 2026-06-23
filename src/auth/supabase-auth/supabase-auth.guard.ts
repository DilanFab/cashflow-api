import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

interface RequestWithUser {
  headers: { authorization?: string };
  user?: { id: string; email: string };
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.authService.verifyToken(token);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    request.user = user;
    return true;
  }
}
