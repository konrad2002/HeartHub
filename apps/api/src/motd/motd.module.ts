import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { MotdController } from './motd.controller';
import { MotdService } from './motd.service';

@Module({
  imports: [ProjectsModule],
  controllers: [MotdController],
  providers: [MotdService],
})
export class MotdModule {}
