import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventMember } from './entities/event-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventMember])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
