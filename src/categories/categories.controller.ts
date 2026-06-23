import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CategoriesService } from './categories.service';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async findAll() {
    return this.categoriesService.findAll();
  }
}
