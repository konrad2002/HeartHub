import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { InvitesController } from './invites.controller';

@Module({
  imports: [MembersModule],
  controllers: [InvitesController],
})
export class InvitesModule {}
