import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';
import { MotdService } from './motd.service';

@Controller('projects/:projectId/motd')
@UseGuards(AuthGuard)
export class MotdController {
  constructor(private readonly motdService: MotdService) {}

  @Get()
  list(@Param('projectId') projectId: string, @CurrentUser() user: RequestUser) {
    return this.motdService.listForUser(projectId, user.id);
  }

  @Post()
  set(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { toUserId: string; message: string },
  ) {
    return this.motdService.setMotd(projectId, user.id, body.toUserId, body.message);
  }

  @Patch(':motdId')
  update(
    @Param('projectId') projectId: string,
    @Param('motdId') motdId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { message: string },
  ) {
    return this.motdService.updateMotd(projectId, user.id, motdId, body.message);
  }

  @Delete(':motdId')
  remove(
    @Param('projectId') projectId: string,
    @Param('motdId') motdId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.motdService.removeMotd(projectId, user.id, motdId);
  }
}
