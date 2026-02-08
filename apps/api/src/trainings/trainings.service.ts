import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TrainingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(projectId: string, userId: string, authorId?: string) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.training.findMany({
      where: { projectId, authorId: authorId || undefined },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async create(
    projectId: string,
    userId: string,
    data: {
      title: string;
      date: string;
      duration: number;
      type: string;
      intensity?: number | null;
      notes?: string | null;
      tags?: string[];
    },
  ) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.training.create({
      data: {
        projectId,
        authorId: userId,
        title: data.title,
        date: new Date(data.date),
        duration: data.duration,
        type: data.type,
        intensity: data.intensity ?? null,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
      },
    });
  }

  async get(projectId: string, userId: string, trainingId: string) {
    await this.projectsService.requireMember(projectId, userId);
    const training = await this.prisma.training.findFirst({
      where: { id: trainingId, projectId },
    });
    if (!training) {
      throw new NotFoundException('Training not found');
    }
    return training;
  }

  async update(
    projectId: string,
    userId: string,
    trainingId: string,
    data: {
      title?: string;
      date?: string;
      duration?: number;
      type?: string;
      intensity?: number | null;
      notes?: string | null;
      tags?: string[];
    },
  ) {
    const training = await this.get(projectId, userId, trainingId);
    await this.requireAuthorOrAdmin(projectId, userId, training.authorId);
    return this.prisma.training.update({
      where: { id: trainingId },
      data: {
        title: data.title,
        date: data.date ? new Date(data.date) : undefined,
        duration: data.duration,
        type: data.type,
        intensity: data.intensity ?? undefined,
        notes: data.notes ?? undefined,
        tags: data.tags,
      },
    });
  }

  async remove(projectId: string, userId: string, trainingId: string) {
    const training = await this.get(projectId, userId, trainingId);
    await this.requireAuthorOrAdmin(projectId, userId, training.authorId);
    return this.prisma.training.delete({
      where: { id: trainingId },
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
