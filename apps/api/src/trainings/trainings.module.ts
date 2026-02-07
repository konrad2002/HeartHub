import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';

@Module({
  imports: [ProjectsModule],
  controllers: [TrainingsController],
  providers: [TrainingsService],
})
export class TrainingsModule {}
