import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberRole } from '@prisma/client';

export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProject(userId: string, data: { name: string; description?: string | null }) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { name: data.name, description: data.description ?? null },
      });
      await tx.projectMember.create({
        data: { projectId: project.id, userId, role: 'admin' },
      });
      return project;
    });
  }

  async getProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, members: { some: { userId } } },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async updateProject(
    userId: string,
    projectId: string,
    data: { name?: string; description?: string | null },
  ) {
    await this.requireAdmin(projectId, userId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { name: data.name, description: data.description ?? undefined },
    });
  }

  async archiveProject(userId: string, projectId: string) {
    await this.requireAdmin(projectId, userId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { archivedAt: new Date() },
    });
  }

  async requireMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException('Not a project member');
    }
    return member;
  }

  async requireAdmin(projectId: string, userId: string) {
    const member = await this.requireMember(projectId, userId);
    if (member.role !== MemberRole.admin) {
      throw new ForbiddenException('Admin role required');
    }
    return member;
  }
}
