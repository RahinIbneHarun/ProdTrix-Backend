import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostMedia } from './entities/post-media.entity';
import { Post } from '../posts/entities/post.entity';
import { CreatePostMediaDto } from './dtos/create-post-media.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdatePostMediaDto } from './dtos/update-post-media.dto';

@Injectable()
export class PostMediaService 
{
    constructor(
    @InjectRepository(PostMedia)
    private readonly postMediaRepository: Repository<PostMedia>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    ) {}


    async createPostMedia(
        userId: string,
        userRole: UserRole,
        dto: CreatePostMediaDto,
        ) {
        // Find the post
        const post = await this.postRepository.findOne({
            where: { id: dto.postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check post ownership
        const isOwner = post.userId === userId;
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenException(
            'You are not allowed to add media to this post',
            );
        }

        // Create media record
        const media = this.postMediaRepository.create({
            ...dto,
            sortOrder: dto.sortOrder ?? 0,
        });

        const savedMedia = await this.postMediaRepository.save(media);

        return {
            message: 'Post media added successfully',
            data: savedMedia,
        };
    }


    //This method is a reusable authorization and validation method. Its purpose is to check whether a user is allowed to access a particular Post Media record.
    private async findMediaWithAccess(
        id: string,
        userId: string,
        userRole: UserRole,
        ) {
        const media = await this.postMediaRepository.findOne({
            where: { id },
            relations: {
            post: true,
            },
        });

        if (!media) {
            throw new NotFoundException('Post media not found');
        }

        const isOwner = media.post.userId === userId;
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenException(
            'You are not allowed to access this media',
            );
        }

        return media;
    }


    async getAllPostMedia(
        userId: string,
        userRole: UserRole,
        page = 1,
        limit = 10,
        ) {
        page = Math.max(1, page);
        limit = Math.min(50, Math.max(1, limit));

        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        const [media, total] =
            await this.postMediaRepository.findAndCount({
            where: isSuperAdmin
                ? {}
                : { post: { userId } },
            relations: {
                post: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            order: {
                createdAt: 'DESC',
            },
            });

        return {
            message: 'Post media fetched successfully',
            data: media,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
    }


    async getPostMediaById(
        id: string,
        userId: string,
        userRole: UserRole,
        ) {
        const media = await this.findMediaWithAccess(
            id,
            userId,
            userRole,
        );

        return {
            message: 'Post media fetched successfully',
            data: media,
        };
    }


    async updatePostMedia(
    id: string,
    userId: string,
    userRole: UserRole,
    dto: UpdatePostMediaDto,
    ) {
        const media = await this.findMediaWithAccess(
            id,
            userId,
            userRole,
        );

        Object.assign(media, dto);

        const updatedMedia =
            await this.postMediaRepository.save(media);

        return {
            message: 'Post media updated successfully',
            data: updatedMedia,
        };
    }


    async deletePostMedia(
        id: string,
        userId: string,
        userRole: UserRole,
    ) {
        const media = await this.findMediaWithAccess(
            id,
            userId,
            userRole,
        );

        await this.postMediaRepository.remove(media);

        return {
            message: 'Post media deleted successfully',
        };
    }
}
