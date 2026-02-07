import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

export class LocationsWishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(projectId: string, userId: string) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.locationWishlist.findMany({
      where: { projectId },
      orderBy: { priority: 'asc' },
    });
  }

  async create(
    projectId: string,
    userId: string,
    data: { name: string; priority: number; notes?: string | null; tags?: string[] },
  ) {
    await this.projectsService.requireMember(projectId, userId);
    return this.prisma.locationWishlist.create({
      data: {
        projectId,
        authorId: userId,
        name: data.name,
        priority: data.priority,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
      },
    });
  }

  async get(projectId: string, userId: string, locationId: string) {
    await this.projectsService.requireMember(projectId, userId);
    const location = await this.prisma.locationWishlist.findFirst({
      where: { id: locationId, projectId },
    });
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  async update(
    projectId: string,
    userId: string,
    locationId: string,
    data: { name?: string; priority?: number; notes?: string | null; tags?: string[] },
  ) {
    const location = await this.get(projectId, userId, locationId);
    await this.requireAuthorOrAdmin(projectId, userId, location.authorId);
    return this.prisma.locationWishlist.update({
      where: { id: locationId },
      data: {
        name: data.name,
        priority: data.priority,
        notes: data.notes ?? undefined,
        tags: data.tags,
      },
    });
  }

  async remove(projectId: string, userId: string, locationId: string) {
    const location = await this.get(projectId, userId, locationId);
    await this.requireAuthorOrAdmin(projectId, userId, location.authorId);
    return this.prisma.locationWishlist.delete({
      where: { id: locationId },
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
