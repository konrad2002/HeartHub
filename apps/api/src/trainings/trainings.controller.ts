import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';
import { TrainingsService } from './trainings.service';

@Controller('projects/:projectId/trainings')
@UseGuards(AuthGuard)
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  list(@Param('projectId') projectId: string, @CurrentUser() user: RequestUser) {
    return this.trainingsService.list(projectId, user.id);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      title: string;
      date: string;
      duration: number;
      type: string;
      intensity?: number | null;
      notes?: string | null;
      tags?: string[];
    },
  ) {
    return this.trainingsService.create(projectId, user.id, body);
  }

  @Get(':trainingId')
  get(
    @Param('projectId') projectId: string,
    @Param('trainingId') trainingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.trainingsService.get(projectId, user.id, trainingId);
  }

  @Patch(':trainingId')
  update(
    @Param('projectId') projectId: string,
    @Param('trainingId') trainingId: string,
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      title?: string;
      date?: string;
      duration?: number;
      type?: string;
      intensity?: number | null;
      notes?: string | null;
      tags?: string[];
    },
  ) {
    return this.trainingsService.update(projectId, user.id, trainingId, body);
  }

  @Delete(':trainingId')
  remove(
    @Param('projectId') projectId: string,
    @Param('trainingId') trainingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.trainingsService.remove(projectId, user.id, trainingId);
  }
}
