import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dtos/create-post.dto';
import { UserRole } from 'src/users/enums/user-role.enum';
import { UpdatePostDto } from './dtos/update-post.dto';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';

@Injectable()
export class PostsService 
{
    constructor(
        @InjectRepository(Post) 
        private readonly postRepository: Repository<Post>,

        private readonly activityLogsService: ActivityLogsService,
    ) {}


    async createPost(userId: string, dto: CreatePostDto) {
        const post = this.postRepository.create({
            ...dto,
            userId,
        });

        const savedPost = await this.postRepository.save(post);

        await this.activityLogsService.create({
            userId,
            action: 'POST_CREATED',
            entityType: 'Post',
            entityId: savedPost.id,
            details: {
            title: savedPost.title,
            },
        });

        return {
            message: 'Post created successfully',
            data: savedPost,
        };
    }

    async getAllPosts(page = 1, limit = 10) {
        // Prevent invalid pagination values
        page = Math.max(1, page);
        limit = Math.min(50, Math.max(1, limit));

        const [posts, total] = await this.postRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: {
            createdAt: 'DESC',
            },
        });

        return {
            message: 'Posts fetched successfully',
            data: posts,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPostById(id: string) {
        const post = await this.postRepository.findOne({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return {
            message: 'Post fetched successfully',
            data: post,
        };
    }

    async updatePost(
        id: string,
        userId: string,
        userRole: UserRole,
        dto: UpdatePostDto,
    ) {
        const post = await this.postRepository.findOne({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const isOwner = post.userId === userId;
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenException(
            'You are not allowed to update this post',
            );
        }

        Object.assign(post, dto);

        const updatedPost = await this.postRepository.save(post);


        await this.activityLogsService.createSafely({
        userId: userId,
        action: 'POST_UPDATED',
        entityType: 'Post',
        entityId: post.id,
        details: {
            title: post.title,
        },
        });


        return {
            message: 'Post updated successfully',
            data: updatedPost,
        };
    }

    async deletePost(
        id: string,
        userId: string,
        userRole: UserRole,
    ) {
        const post = await this.postRepository.findOne({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const isOwner = post.userId === userId;
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenException(
            'You are not allowed to delete this post',
            );
        }

        await this.postRepository.softDelete(id);


        await this.activityLogsService.createSafely({
        userId: userId,
        action: 'POST_DELETED',
        entityType: 'Post',
        entityId: post.id,
        details: {
            title: post.title,
        },
        });


        return {
            message: 'Post deleted successfully',
        };
    }
}
