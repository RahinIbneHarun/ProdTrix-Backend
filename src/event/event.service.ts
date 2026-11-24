
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/event.entity';
import { EventMember } from './entities/event-member.entity';
import { UserRole } from '../users/enums/user-role.enum';

import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(EventMember)
    private readonly eventMemberRepository: Repository<EventMember>,

    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // Create event
  async create(creatorId: string, createDto: CreateEventDto) {
    this.validateEventDates(createDto.startsAt, createDto.endsAt);

    const event = this.eventRepository.create({
      ...createDto,
      creatorId,
    });

    await this.activityLogsService.createSafely({
      userId: creatorId,
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: event.id,
      details: {
        name: event.name,
        eventType: event.eventType,
        startsAt: event.startsAt,
      },
    });

    return this.eventRepository.save(event);
  }

  // Get all events (Super Admin)
  async getAll(page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.eventRepository.findAndCount({
      relations: { creator: true },
      select: {
        id: true,
        creatorId: true,
        name: true,
        tagline: true,
        description: true,
        coverUrl: true,
        eventType: true,
        startsAt: true,
        endsAt: true,
        location: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Get events visible to the current user
  async getVisibleEvents(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .where('event.visibility = :visibility', {
        visibility: 'public',
      })
      .orWhere('event.creatorId = :userId', { userId })
      .orWhere(
        `EXISTS (
          SELECT 1 FROM event_members em
          WHERE em."eventId" = event.id
          AND em."userId" = :userId
        )`,
        { userId },
      )
      .orderBy('event.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Get event by ID
  async getById(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { creator: true },
      select: {
        id: true,
        creatorId: true,
        name: true,
        tagline: true,
        description: true,
        coverUrl: true,
        eventType: true,
        startsAt: true,
        endsAt: true,
        location: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.visibility !== 'public' &&
      event.creatorId !== currentUserId &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      const membership = await this.eventMemberRepository.findOne({
        where: {
          eventId: id,
          userId: currentUserId,
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'You are not allowed to access this event',
        );
      }
    }

    return event;
  }

  // Update event
  async update(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
    updateDto: UpdateEventDto,
  ) {
    const event = await this.findEventWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    const startsAt = updateDto.startsAt ?? event.startsAt;
    const endsAt = updateDto.endsAt ?? event.endsAt;

    this.validateEventDates(startsAt, endsAt);

    Object.assign(event, updateDto);


    await this.activityLogsService.createSafely({
      userId: currentUserId,
      action: 'EVENT_UPDATED',
      entityType: 'Event',
      entityId: event.id,
      details: {
        name: event.name,
      },
    });

    return this.eventRepository.save(event);
  }

  // Delete event
  async delete(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const event = await this.findEventWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    await this.eventRepository.remove(event);


    await this.activityLogsService.createSafely({
      userId: currentUserId,
      action: 'EVENT_DELETED',
      entityType: 'Event',
      entityId: event.id,
      details: {
        name: event.name,
      },
    });

    return {
      message: 'Event deleted successfully',
    };
  }

  // Find event and verify creator access
  async findEventWithAccess(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.creatorId !== currentUserId &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only the event creator or Super Admin can manage this event',
      );
    }

    return event;
  }

  private validateEventDates(startsAt: Date | string, endsAt: Date | string) {
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw new BadRequestException('Invalid event date');
    }

    if (end <= start) {
      throw new BadRequestException(
        'Event end time must be after start time',
      );
    }
  }
}
