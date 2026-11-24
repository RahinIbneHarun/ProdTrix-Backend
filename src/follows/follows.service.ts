import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';

import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';

@Injectable()
export class FollowsService {

  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly activityLogsService: ActivityLogsService,
  ) {}


  // ami user hisebe kake follow korbo
  async followUser(
    followerId: string,
    followingId: string,
  ) {
    if (followerId === followingId) {
      throw new BadRequestException(
        'You cannot follow yourself',
      );
    }

    // Check target user
    const targetUser = await this.userRepository.findOne({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        'You cannot follow an inactive user',
      );
    }

    // Check duplicate relationship, mane already follow kina 
    const existingFollow = await this.followRepository.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      throw new ConflictException(
        'You are already following this user',
      );
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
    });


    await this.activityLogsService.createSafely({
      userId: followerId,
      action: 'USER_FOLLOWED',
      entityType: 'Follow',
      entityId: follow.id,
      details: {
        followingId: follow.followingId,
      },
    });


    try {
      const savedFollow = await this.followRepository.save(follow);

      return {
        message: 'User followed successfully',
        data: savedFollow,
      };
    } catch (error:any) {
      // PostgreSQL unique constraint violation
      if (error.code === '23505') {
        throw new ConflictException(
          'You are already following this user',
        );
      }

      throw error;
    }
  }



  async getAllFollows(page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.min(50, Math.max(1, limit));

    const [follows, total] =
      await this.followRepository.findAndCount({
        relations: {
          follower: true,
          following: true,
        },
        select: {
          id: true,
          followerId: true,
          followingId: true,
          createdAt: true,
          follower: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
          following: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      message: 'Follow relationships fetched successfully',
      data: follows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  // jodi amk akjn follow kore, thake ami id diye fecth korte parbo and ami jake follow kori take o id diye ber korte parbo
  async getFollowById(
    id: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const follow = await this.followRepository.findOne({
      where: { id },
      relations: {
        follower: true,
        following: true,
      },
      select: {
        id: true,
        followerId: true,
        followingId: true,
        createdAt: true,
        follower: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
        following: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    const isInvolved =
      follow.followerId === currentUserId ||
      follow.followingId === currentUserId;

    const isSuperAdmin =
      currentUserRole === UserRole.SUPER_ADMIN;

    if (!isInvolved && !isSuperAdmin) {
      throw new ForbiddenException(
        'You are not allowed to access this relationship',
      );
    }

    return {
      message: 'Follow relationship fetched successfully',
      data: follow,
    };
  }



  async unfollowUser(
    followerId: string,
    followingId: string,
  ) {
    const follow = await this.followRepository.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (!follow) {
      throw new NotFoundException(
        'Follow relationship not found',
      );
    }

    await this.followRepository.remove(follow);


    await this.activityLogsService.createSafely({
      userId: followerId,
      action: 'USER_UNFOLLOWED',
      entityType: 'Follow',
      entityId: follow.id,
      details: {
        followingId: follow.followingId,
      },
    });


    return {
      message: 'User unfollowed successfully',
    };
  }



  async getFollowers(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    page = Math.max(1, page);
    limit = Math.min(50, Math.max(1, limit));

    const [follows, total] =
      await this.followRepository.findAndCount({
        where: {
          followingId: userId,
        },
        relations: {
          follower: {
            profile: true,
          },
        },
        select: {
          id: true,
          createdAt: true,
          follower: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profile: {
              avatarUrl: true,
              bio: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      message: 'Followers fetched successfully',
      data: follows.map((follow) => ({
        followedAt: follow.createdAt,
        user: follow.follower,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  async getFollowing(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    page = Math.max(1, page);
    limit = Math.min(50, Math.max(1, limit));

    const [follows, total] =
      await this.followRepository.findAndCount({
        where: {
          followerId: userId,
        },
        relations: {
          following: {
            profile: true,
          },
        },
        select: {
          id: true,
          createdAt: true,
          following: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profile: {
              avatarUrl: true,
              bio: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      message: 'Following list fetched successfully',
      data: follows.map((follow) => ({
        followedAt: follow.createdAt,
        user: follow.following,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  

}