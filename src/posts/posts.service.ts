import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dtos/create-post.dto';
import { UserRole } from 'src/users/enums/user-role.enum';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostsService 
{
    constructor(@InjectRepository(Post) private readonly postRepository: Repository<Post>,){}


    async createPost(userId: string, dto: CreatePostDto) {
        const post = this.postRepository.create({
            ...dto,
            userId,
        });

        const savedPost = await this.postRepository.save(post);

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

        return {
            message: 'Post deleted successfully',
        };
    }
}
