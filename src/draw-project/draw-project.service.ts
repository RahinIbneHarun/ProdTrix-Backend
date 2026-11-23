
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DrawProject } from './entities/draw-project.entity';
import { Post } from '../posts/entities/post.entity';

import { UserRole } from '../users/enums/user-role.enum';

import { CreateDrawProjectDto } from './dtos/create-draw-project.dto';
import { UpdateDrawProjectDto } from './dtos/update-draw-project.dto';
import { UpdateDrawProjectStatusDto } from './dtos/update-draw-project-status.dto';

@Injectable()
export class DrawProjectService {
  constructor(
    @InjectRepository(DrawProject)
    private readonly drawProjectRepository: Repository<DrawProject>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // Create a new draw project
  async create(userId: string, createDto: CreateDrawProjectDto) {
    const project = this.drawProjectRepository.create({
      ...createDto,
      userId,
    });

    return this.drawProjectRepository.save(project);
  }

  // Get all projects (Super Admin)
  async getAll(page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.drawProjectRepository.findAndCount({
      relations: { user: true, post: true },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        previewUrl: true,
        status: true,
        postId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
        post: {
          id: true,
          title: true,
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

  // Get projects belonging to the current user
  async getMyProjects(userId: string, page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.drawProjectRepository.findAndCount({
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

  // Get one project by ID
  async getById(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const project = await this.drawProjectRepository.findOne({
      where: { id },
      relations: { user: true, post: true },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        canvasData: true,
        previewUrl: true,
        status: true,
        postId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
        post: {
          id: true,
          title: true,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Draw project not found');
    }

    this.checkAccess(project.userId, currentUserId, currentUserRole);

    return project;
  }

  // Update project details
  async update(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
    updateDto: UpdateDrawProjectDto,
  ) {
    const project = await this.findProjectWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    Object.assign(project, updateDto);

    return this.drawProjectRepository.save(project);
  }

  // Update project status (Super Admin only)
  async updateStatus(
    id: string,
    updateDto: UpdateDrawProjectStatusDto,
  ) {
    const project = await this.drawProjectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Draw project not found');
    }

    project.status = updateDto.status;

    return this.drawProjectRepository.save(project);
  }

  // Link project to a post
  async linkPost(
    id: string,
    postId: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const project = await this.findProjectWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        title: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // A project should normally be linked to its owner's post.
    if (
      post.userId !== project.userId &&
      currentUserRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You can only link your project to your own post',
      );
    }

    // Check whether this post is already linked to another project.
    const existingProject = await this.drawProjectRepository.findOne({
      where: { postId },
    });

    if (existingProject && existingProject.id !== project.id) {
      throw new ConflictException(
        'This post is already linked to another draw project',
      );
    }

    project.postId = postId;

    return this.drawProjectRepository.save(project);
  }

  // Unlink project from its post
  async unlinkPost(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const project = await this.findProjectWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    if (!project.postId) {
      throw new BadRequestException(
        'This draw project is not linked to any post',
      );
    }

    project.postId = null;

    return this.drawProjectRepository.save(project);
  }

  // Delete project
  async delete(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const project = await this.findProjectWithAccess(
      id,
      currentUserId,
      currentUserRole,
    );

    await this.drawProjectRepository.remove(project);

    return {
      message: 'Draw project deleted successfully',
    };
  }

  // Find project and verify access
  private async findProjectWithAccess(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const project = await this.drawProjectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Draw project not found');
    }

    this.checkAccess(project.userId, currentUserId, currentUserRole);

    return project;
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
        'You are not allowed to access this draw project',
      );
    }
  }
}
