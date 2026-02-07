import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';

@Controller('me')
@UseGuards(AuthGuard)
export class UsersController {
  @Get()
  getMe(@CurrentUser() user: RequestUser) {
    return user;
  }
}
