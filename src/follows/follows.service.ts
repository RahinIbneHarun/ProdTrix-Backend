import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async getFollowing(userId: string) {
    const follows = await this.followRepository.find({
      where: {
        follower: {
          id: userId,
        },
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
    };
  }
}