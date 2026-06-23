import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
  }

  async verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.supabase.auth.getUser(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const user = result.data.user;

      if (!user) throw new UnauthorizedException('Token inválido o expirado');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return user;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Error al verificar el token');
    }
  }
}
