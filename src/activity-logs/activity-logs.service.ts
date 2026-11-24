
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivityLog } from './entities/activity-log.entity';
import { UserRole } from '../users/enums/user-role.enum';

import { CreateActivityLogDto } from './dtos/create-activity-log.dto';

import { Logger } from '@nestjs/common';

@Injectable()
export class ActivityLogsService {
    
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}



private readonly logger = new Logger(ActivityLogsService.name);

async createSafely(createDto: CreateActivityLogDto) {
  try {
    return await this.create(createDto);
  } catch (error) {
    this.logger.error(
      `Failed to create activity log: ${createDto.action}`,
      error instanceof Error ? error.stack : String(error),
    );

    return null;
  }
}


  // Create an activity log (used internally by other modules)
  async create(createDto: CreateActivityLogDto) {
    const activityLog = this.activityLogRepository.create({
      ...createDto,
    });

    return this.activityLogRepository.save(activityLog);
  }

  // Get all activity logs (Super Admin)
  async getAll(page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] =
      await this.activityLogRepository.findAndCount({
        relations: { user: true },
        select: {
          id: true,
          userId: true,
          action: true,
          entityType: true,
          entityId: true,
          details: true,
          ipAddress: true,
          createdAt: true,
          user: {
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

  // Get activity logs of the current user
  async getMyLogs(userId: string, page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] =
      await this.activityLogRepository.findAndCount({
        where: { userId },
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

  // Get one activity log by ID
  async getById(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const log = await this.activityLogRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        entityId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Activity log not found');
    }

    if (
      log.userId !== currentUserId &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this activity log',
      );
    }

    return log;
  }
}
