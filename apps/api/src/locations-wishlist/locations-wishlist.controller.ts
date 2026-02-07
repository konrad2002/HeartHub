import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/user-context';
import { LocationsWishlistService } from './locations-wishlist.service';

@Controller('projects/:projectId/locations/wishlist')
@UseGuards(AuthGuard)
export class LocationsWishlistController {
  constructor(private readonly locationsService: LocationsWishlistService) {}

  @Get()
  list(@Param('projectId') projectId: string, @CurrentUser() user: RequestUser) {
    return this.locationsService.list(projectId, user.id);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { name: string; priority: number; notes?: string | null; tags?: string[] },
  ) {
    return this.locationsService.create(projectId, user.id, body);
  }

  @Get(':locationId')
  get(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.locationsService.get(projectId, user.id, locationId);
  }

  @Patch(':locationId')
  update(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { name?: string; priority?: number; notes?: string | null; tags?: string[] },
  ) {
    return this.locationsService.update(projectId, user.id, locationId, body);
  }

  @Delete(':locationId')
  remove(
    @Param('projectId') projectId: string,
    @Param('locationId') locationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.locationsService.remove(projectId, user.id, locationId);
  }
}
