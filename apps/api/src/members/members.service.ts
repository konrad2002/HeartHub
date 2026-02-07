import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async listMembers(projectId: string, userId: string) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(projectId: string, userId: string, email: string) {
    await this.projectsService.requireAdmin(projectId, userId);
    return this.prisma.projectInvite.create({
      data: {
        projectId,
        email: email.toLowerCase(),
        token: randomUUID(),
      },
    });
  }

  async acceptInvite(projectId: string, inviteId: string, userId: string, email: string) {
    const invite = await this.prisma.projectInvite.findFirst({
      where: { id: inviteId, projectId },
    });
    if (!invite || invite.status !== 'pending') {
      throw new NotFoundException('Invite not found');
    }
    if (invite.email !== email.toLowerCase()) {
      throw new ForbiddenException('Invite email mismatch');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId, userId } },
        update: {},
        create: { projectId, userId, role: 'member' },
      });

      return tx.projectInvite.update({
        where: { id: inviteId },
        data: { status: 'accepted' },
      });
    });
  }

  async declineInvite(projectId: string, inviteId: string, email: string) {
    const invite = await this.prisma.projectInvite.findFirst({
      where: { id: inviteId, projectId },
    });
    if (!invite || invite.status !== 'pending') {
      throw new NotFoundException('Invite not found');
    }
    if (invite.email !== email.toLowerCase()) {
      throw new ForbiddenException('Invite email mismatch');
    }

    return this.prisma.projectInvite.update({
      where: { id: inviteId },
      data: { status: 'declined' },
    });
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.projectsService.requireAdmin(projectId, userId);
    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return this.prisma.projectMember.delete({
      where: { id: memberId },
    });
  }

  async updateRole(
    projectId: string,
    memberId: string,
    userId: string,
    role: 'member' | 'admin',
  ) {
    await this.projectsService.requireAdmin(projectId, userId);
    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
    });
  }
}
