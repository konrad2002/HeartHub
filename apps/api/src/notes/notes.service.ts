import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(projectId: string, userId: string) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.note.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    projectId: string,
    userId: string,
    data: { title: string; body: string; pinned?: boolean },
  ) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.note.create({
      data: {
        projectId,
        authorId: userId,
        title: data.title,
        body: data.body,
        pinned: data.pinned ?? false,
      },
    });
  }

  async get(projectId: string, userId: string, noteId: string) {
    await this.projectsService.requireMember(projectId, userId);
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, projectId },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async update(
    projectId: string,
    userId: string,
    noteId: string,
    data: { title?: string; body?: string; pinned?: boolean },
  ) {
    const note = await this.get(projectId, userId, noteId);
    await this.requireAuthorOrAdmin(projectId, userId, note.authorId);
    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: data.title,
        body: data.body,
        pinned: data.pinned,
      },
    });
  }

  async remove(projectId: string, userId: string, noteId: string) {
    const note = await this.get(projectId, userId, noteId);
    await this.requireAuthorOrAdmin(projectId, userId, note.authorId);
    return this.prisma.note.delete({
      where: { id: noteId },
    });
  }

  private async requireAuthorOrAdmin(projectId: string, userId: string, authorId: string) {
    if (userId === authorId) {
      return;
    }
    const member = await this.projectsService.requireMember(projectId, userId);
    if (member.role !== 'admin') {
      throw new ForbiddenException('Author or admin required');
    }
  }
}
