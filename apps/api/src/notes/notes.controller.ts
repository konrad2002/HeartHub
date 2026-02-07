import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotesService } from './notes.service';
import type { RequestUser } from '../auth/user-context';

@Controller('projects/:projectId/notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.list(projectId, user.id);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { title: string; body: string; pinned?: boolean },
  ) {
    return this.notesService.create(projectId, user.id, body);
  }

  @Get(':noteId')
  get(
    @Param('projectId') projectId: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.get(projectId, user.id, noteId);
  }

  @Patch(':noteId')
  update(
    @Param('projectId') projectId: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { title?: string; body?: string; pinned?: boolean },
  ) {
    return this.notesService.update(projectId, user.id, noteId, body);
  }

  @Delete(':noteId')
  remove(
    @Param('projectId') projectId: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.remove(projectId, user.id, noteId);
  }
}
