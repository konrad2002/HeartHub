import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.projectsService.listProjects(user.id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() body: { name: string; description?: string }) {
    return this.projectsService.createProject(user.id, body);
  }

  @Get(':projectId')
  get(@CurrentUser() user: RequestUser, @Param('projectId') projectId: string) {
    return this.projectsService.getProject(user.id, projectId);
  }

  @Patch(':projectId')
  update(
    @CurrentUser() user: RequestUser,
    @Param('projectId') projectId: string,
    @Body() body: { name?: string; description?: string | null },
  ) {
    return this.projectsService.updateProject(user.id, projectId, body);
  }

  @Post(':projectId/archive')
  archive(@CurrentUser() user: RequestUser, @Param('projectId') projectId: string) {
    return this.projectsService.archiveProject(user.id, projectId);
  }
}
