import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [ProjectsModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
