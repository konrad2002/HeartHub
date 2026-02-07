import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';
import { MembersService } from './members.service';

@Controller('projects/:projectId')
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('members')
  list(@Param('projectId') projectId: string, @CurrentUser() user: RequestUser) {
    return this.membersService.listMembers(projectId, user.id);
  }

  @Post('invites')
  invite(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { email: string },
  ) {
    return this.membersService.invite(projectId, user.id, body.email);
  }

  @Post('invites/:inviteId/accept')
  accept(
    @Param('projectId') projectId: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.membersService.acceptInvite(projectId, inviteId, user.id, user.email);
  }

  @Post('invites/:inviteId/decline')
  decline(
    @Param('projectId') projectId: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.membersService.declineInvite(projectId, inviteId, user.email);
  }

  @Delete('members/:memberId')
  remove(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.membersService.removeMember(projectId, memberId, user.id);
  }

  @Patch('members/:memberId')
  updateRole(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { role: 'member' | 'admin' },
  ) {
    return this.membersService.updateRole(projectId, memberId, user.id, body.role);
  }
}
