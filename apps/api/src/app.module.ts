import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { InvitesModule } from './invites/invites.module';
import { LocationsVisitedModule } from './locations-visited/locations-visited.module';
import { LocationsWishlistModule } from './locations-wishlist/locations-wishlist.module';
import { MembersModule } from './members/members.module';
import { MotdModule } from './motd/motd.module';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TrainingsModule } from './trainings/trainings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    InvitesModule,
    UsersModule,
    ProjectsModule,
    MembersModule,
    MotdModule,
    NotesModule,
    TrainingsModule,
    LocationsVisitedModule,
    LocationsWishlistModule,
  ],
})
export class AppModule {}
