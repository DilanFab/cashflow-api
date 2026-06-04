import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import {AuthService} from '../auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService){

  }
  async canActivate(
    context: ExecutionContext 
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if(!token) throw new UnauthorizedException("Token no proporcionado");
    await this.authService.verifyToken(token);
    return true;
  }
}
