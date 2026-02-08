import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';
import { MembersService } from '../members/members.service';

@Controller('invites')
@UseGuards(AuthGuard)
export class InvitesController {
  constructor(private readonly membersService: MembersService) {}

  @Post('accept')
  accept(@CurrentUser() user: RequestUser, @Body() body: { code: string }) {
    return this.membersService.acceptInvite(body.code, user.id);
  }

  @Post('decline')
  decline(@Body() body: { code: string }) {
    return this.membersService.declineInvite(body.code);
  }
}
