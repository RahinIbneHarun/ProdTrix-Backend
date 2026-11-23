
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventMember } from './entities/event-member.entity';
import { Event } from './entities/event.entity';
import { User } from '../users/entities/user.entity';

import { UserRole } from '../users/enums/user-role.enum';
import { EventMemberStatus } from './enums/event-member-status.enum';

import { CreateEventMemberDto } from './dtos/create-event-member.dto';
import { UpdateEventMemberStatusDto } from './dtos/update-event-member-status.dto';

@Injectable()
export class EventMemberService {
  constructor(
    @InjectRepository(EventMember)
    private readonly eventMemberRepository: Repository<EventMember>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Invite a user to an event
  async invite(
    eventId: string,
    creatorId: string,
    creatorRole: UserRole,
    createDto: CreateEventMemberDto,
  ) {
    await this.findEventWithAccess(
      eventId,
      creatorId,
      creatorRole,
    );

    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.eventMemberRepository.findOne({
      where: {
        eventId,
        userId: createDto.userId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This user is already an event member',
      );
    }

    const member = this.eventMemberRepository.create({
      eventId,
      userId: createDto.userId,
    });

    return this.eventMemberRepository.save(member);
  }

  // List members of an event
  async getMembers(
    eventId: string,
    currentUserId: string,
    currentUserRole: UserRole,
    page = 1,
    limit = 10,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isCreator = event.creatorId === currentUserId;
    const isSuperAdmin =
      currentUserRole === UserRole.SUPER_ADMIN;

    const currentMembership =
      await this.eventMemberRepository.findOne({
        where: {
          eventId,
          userId: currentUserId,
        },
      });

    if (!isCreator && !isSuperAdmin && !currentMembership) {
      throw new ForbiddenException(
        'You are not allowed to view this event members list',
      );
    }

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] =
      await this.eventMemberRepository.findAndCount({
        where: { eventId },
        relations: { user: true },
        select: {
          eventId: true,
          userId: true,
          status: true,
          joinedAt: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        order: { joinedAt: 'DESC' },
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

  // Get events where the current user is a member
  async getMyMemberships(userId: string, page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] =
      await this.eventMemberRepository.findAndCount({
        where: { userId },
        relations: { event: true },
        order: { joinedAt: 'DESC' },
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

  // Update membership status
  async updateStatus(
    eventId: string,
    userId: string,
    currentUserId: string,
    currentUserRole: UserRole,
    updateDto: UpdateEventMemberStatusDto,
  ) {
    const member = await this.eventMemberRepository.findOne({
      where: { eventId, userId },
    });

    if (!member) {
      throw new NotFoundException('Event membership not found');
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isSuperAdmin =
      currentUserRole === UserRole.SUPER_ADMIN;
    const isCreator = event.creatorId === currentUserId;
    const isMember = userId === currentUserId;

    // A user can only respond to their own invitation.
    // The creator or Super Admin can manage any member's status.
    if (!isMember && !isCreator && !isSuperAdmin) {
      throw new ForbiddenException(
        'You are not allowed to update this membership',
      );
    }

    member.status = updateDto.status;

    return this.eventMemberRepository.save(member);
  }

  // Remove a member from an event
  async removeMember(
    eventId: string,
    userId: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const event = await this.findEventWithAccess(
      eventId,
      currentUserId,
      currentUserRole,
    );

    const member = await this.eventMemberRepository.findOne({
      where: { eventId, userId },
    });

    if (!member) {
      throw new NotFoundException('Event membership not found');
    }

    await this.eventMemberRepository.remove(member);

    return {
      message: 'Event member removed successfully',
    };
  }

  // Find event and verify creator access
  private async findEventWithAccess(
    eventId: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.creatorId !== currentUserId &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only the event creator or Super Admin can manage members',
      );
    }

    return event;
  }
}
