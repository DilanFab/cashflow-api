import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth/supabase-auth.guard';

@Module({
  providers: [AuthService, SupabaseAuthGuard],
  exports: [SupabaseAuthGuard, AuthService]
})
export class AuthModule {}
