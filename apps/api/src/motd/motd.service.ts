import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class MotdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async listForUser(projectId: string, userId: string) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.motd.findMany({
      where: { projectId, toUserId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async setMotd(
    projectId: string,
    fromUserId: string,
    toUserId: string,
    message: string,
  ) {
    await this.projectsService.requireMember(projectId, fromUserId);
    const targetMember = await this.prisma.projectMember.findFirst({
      where: { projectId, userId: toUserId },
    });
    if (!targetMember) {
      throw new NotFoundException('Target user not in project');
    }
    return this.prisma.motd.upsert({
      where: {
        projectId_fromUserId_toUserId: {
          projectId,
          fromUserId,
          toUserId,
        },
      },
      create: { projectId, fromUserId, toUserId, message },
      update: { message },
    });
  }

  async updateMotd(projectId: string, userId: string, motdId: string, message: string) {
    const motd = await this.prisma.motd.findFirst({
      where: { id: motdId, projectId },
    });
    if (!motd) {
      throw new NotFoundException('MOTD not found');
    }
    await this.requireAuthorOrAdmin(projectId, userId, motd.fromUserId);
    return this.prisma.motd.update({
      where: { id: motdId },
      data: { message },
    });
  }

  async removeMotd(projectId: string, userId: string, motdId: string) {
    const motd = await this.prisma.motd.findFirst({
      where: { id: motdId, projectId },
    });
    if (!motd) {
      throw new NotFoundException('MOTD not found');
    }
    await this.requireAuthorOrAdmin(projectId, userId, motd.fromUserId);
    return this.prisma.motd.delete({
      where: { id: motdId },
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
