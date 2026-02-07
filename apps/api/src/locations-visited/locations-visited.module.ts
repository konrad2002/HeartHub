import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { LocationsVisitedController } from './locations-visited.controller';
import { LocationsVisitedService } from './locations-visited.service';

@Module({
  imports: [ProjectsModule],
  controllers: [LocationsVisitedController],
  providers: [LocationsVisitedService],
})
export class LocationsVisitedModule {}
