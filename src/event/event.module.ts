import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventMember } from './entities/event-member.entity';
import { User } from 'src/users/entities/user.entity';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventMember, User]), ActivityLogsModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
