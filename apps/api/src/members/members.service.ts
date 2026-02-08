import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

const INVITE_CODE_LENGTH = 8;
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateInviteCode = () => {
  const bytes = randomBytes(INVITE_CODE_LENGTH);
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += INVITE_CODE_CHARS[bytes[i] % INVITE_CODE_CHARS.length];
  }
  return code;
};

@Injectable()
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

  async invite(projectId: string, userId: string) {
    await this.projectsService.requireAdmin(projectId, userId);
    const code = generateInviteCode();
    return this.prisma.projectInvite.create({
      data: {
        projectId,
        code,
      },
    });
  }

  async acceptInvite(code: string, userId: string) {
    const invite = await this.prisma.projectInvite.findFirst({
      where: { code, status: 'pending' },
    });
    if (!invite || invite.status !== 'pending') {
      throw new NotFoundException('Invite not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId: invite.projectId, userId } },
        update: {},
        create: { projectId: invite.projectId, userId, role: 'member' },
      });

      return tx.projectInvite.update({
        where: { id: invite.id },
        data: { status: 'accepted' },
      });
    });
  }

  async declineInvite(code: string) {
    const invite = await this.prisma.projectInvite.findFirst({
      where: { code, status: 'pending' },
    });
    if (!invite || invite.status !== 'pending') {
      throw new NotFoundException('Invite not found');
    }

    return this.prisma.projectInvite.update({
      where: { id: invite.id },
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
