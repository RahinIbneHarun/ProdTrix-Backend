import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';

import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class CommentsService 
{
    constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    ) {}


    private async findCommentWithAccess(
        id: string,
        userId: string,
        userRole: UserRole,
    ) {
        const comment = await this.commentRepository.findOne({
            where: { id },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const isOwner = comment.userId === userId;
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenException(
            'You are not allowed to access this comment',
            );
        }

        return comment;
    }


    async createComment(
        userId: string,
        dto: CreateCommentDto,
    ) {
        // Check whether post exists
        const post = await this.postRepository.findOne({
            where: { id: dto.postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // If this is a reply, validate its parent comment
        if (dto.parentCommentId) {
            const parentComment = await this.commentRepository.findOne({
            where: { id: dto.parentCommentId },
            });

            if (!parentComment) {
            throw new NotFoundException('Parent comment not found');
            }

            // Parent and reply must belong to the same post
            if (parentComment.postId !== dto.postId) {
            throw new BadRequestException(
                'Parent comment must belong to the same post',
            );
            }
        }

        const comment = this.commentRepository.create({
            postId: dto.postId,
            userId,
            parentCommentId: dto.parentCommentId ?? null,
            content: dto.content,
        });

        const savedComment = await this.commentRepository.save(comment);

        return {
            message: dto.parentCommentId
            ? 'Reply added successfully'
            : 'Comment added successfully',
            data: savedComment,
        };
    }

    async getAllComments(
        postId?: string,
        page = 1,
        limit = 10,
    ) {
        page = Math.max(1, page);
        limit = Math.min(50, Math.max(1, limit));

        const [comments, total] =
            await this.commentRepository.findAndCount({
            where: postId ? { postId } : {},// this get method can used for getting all comments in the system and also used to get comments for any particular post
            skip: (page - 1) * limit,
            take: limit,
            order: {
                createdAt: 'DESC',
            },
            });

        return {
            message: 'Comments fetched successfully',
            data: comments,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
    }


    async getCommentById(id: string) {
        const comment = await this.commentRepository.findOne({
            where: { id },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return {
            message: 'Comment fetched successfully',
            data: comment,
        };
    }


    async updateComment(
        id: string,
        userId: string,
        userRole: UserRole,
        dto: UpdateCommentDto,
    ) {
        const comment = await this.findCommentWithAccess(
            id,
            userId,
            userRole,
        );

        Object.assign(comment, dto);

        const updatedComment =
            await this.commentRepository.save(comment);

        return {
            message: 'Comment updated successfully',
            data: updatedComment,
        };
    }


    async deleteComment(
        id: string,
        userId: string,
        userRole: UserRole,
    ) {
        const comment = await this.findCommentWithAccess(
            id,
            userId,
            userRole,
        );

        await this.commentRepository.remove(comment);

        return {
            message: 'Comment deleted successfully',
        };
    }
}
