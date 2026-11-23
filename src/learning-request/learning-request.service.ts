
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LearningRequest } from './entities/learning-request.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

import { CreateLearningRequestDto } from './dtos/create-learning-request.dto';
import { UpdateLearningRequestDto } from './dtos/update-learning-request.dto';
import { UpdateLearningRequestStatusDto } from './dtos/update-learning-request-status.dto';

@Injectable()
export class LearningRequestService {
  constructor(
    @InjectRepository(LearningRequest)
    private readonly learningRequestRepository: Repository<LearningRequest>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a learning request
  async create(
    userId: string,
    createDto: CreateLearningRequestDto,
  ) {
    const learningRequest = this.learningRequestRepository.create({
      ...createDto,
      userId,
    });

    return this.learningRequestRepository.save(learningRequest);
  }

  // Get all requests (Super Admin)
  async getAll(page = 1, limit = 10) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] =
      await this.learningRequestRepository.findAndCount({
        relations: { user: true },
        select: {
          id: true,
          chapter: true,
          lesson: true,
          topic: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
      });

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Get requests belonging to the current user
  async getMyRequests(userId: string, page = 1, limit = 10) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] =
      await this.learningRequestRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
      });

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Get one request by ID
  async getById(id: string, currentUserId: string, currentUserRole: UserRole) {
    const request = await this.learningRequestRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        id: true,
        chapter: true,
        lesson: true,
        topic: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Learning request not found');
    }

    this.checkAccess(request.userId, currentUserId, currentUserRole);

    return request;
  }

  // Update request details
  async update(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
    updateDto: UpdateLearningRequestDto,
  ) {
    const request = await this.findRequestWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    Object.assign(request, updateDto);

    return this.learningRequestRepository.save(request);
  }

  // Update request status (Super Admin only)
  async updateStatus(
    id: string,
    updateDto: UpdateLearningRequestStatusDto,
  ) {
    const request = await this.learningRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Learning request not found');
    }

    request.status = updateDto.status;

    return this.learningRequestRepository.save(request);
  }

  // Delete request
  async delete(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const request = await this.findRequestWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    await this.learningRequestRepository.remove(request);

    return {
      message: 'Learning request deleted successfully',
    };
  }

  // Find request and verify access
  private async findRequestWithAccess(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const request = await this.learningRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Learning request not found');
    }

    this.checkAccess(request.userId, currentUserId, currentUserRole);

    return request;
  }

  private checkAccess(
    ownerId: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    if (
      ownerId !== currentUserId &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this learning request',
      );
    }
  }
}
