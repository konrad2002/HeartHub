import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { LocationsWishlistController } from './locations-wishlist.controller';
import { LocationsWishlistService } from './locations-wishlist.service';

@Module({
  imports: [ProjectsModule],
  controllers: [LocationsWishlistController],
  providers: [LocationsWishlistService],
})
export class LocationsWishlistModule {}
