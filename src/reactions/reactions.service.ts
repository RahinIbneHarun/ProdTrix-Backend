import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reaction } from './entities/reaction.entity';
import { Post } from '../posts/entities/post.entity';

import { CreateReactionDto } from './dtos/create-reaction.dto';
import { UpdateReactionDto } from './dtos/update-reaction.dto';

import { UserRole } from '../users/enums/user-role.enum';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';

@Injectable()
export class ReactionsService 
{
    constructor(
        @InjectRepository(Reaction)
        private readonly reactionRepository: Repository<Reaction>,

        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,

        private readonly activityLogsService: ActivityLogsService,
    ) {}

    private async findReactionWithAccess(
        id: string,
        userId: string,
        userRole: UserRole,
        ) {
        const reaction = await this.reactionRepository.findOne({
            where: { id },
        });

        if (!reaction) {
            throw new NotFoundException('Reaction not found');
        }

        const isOwner = reaction.userId === userId;
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenException(
            'You are not allowed to manage this reaction',
            );
        }

        return reaction;
    }


    async createReaction(
        userId: string,
        dto: CreateReactionDto,
        ) {
        // Check whether post exists
        const post = await this.postRepository.findOne({
            where: { id: dto.postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check whether this user already reacted to this post
        const existingReaction = await this.reactionRepository.findOne({
            where: {
            postId: dto.postId,
            userId,
            },
        });

        if (existingReaction) {
            throw new ConflictException(
            'You have already reacted to this post. Update your existing reaction instead.',
            );
        }

        const reaction = this.reactionRepository.create({
            postId: dto.postId,
            userId,
            type: dto.type,
        });

        const savedReaction = await this.reactionRepository.save(reaction);

        await this.activityLogsService.createSafely({
            userId,
            action: 'REACTION_ADDED',
            entityType: 'Reaction',
            entityId: savedReaction.id,
            details: {
                postId: savedReaction.postId,
                reactionType: savedReaction.type,
            },
        });

        return {
            message: 'Reaction added successfully',
            data: savedReaction,
        };
    }


    async getAllReactions(
        postId?: string,
        page = 1,
        limit = 10,
        ) {
        page = Math.max(1, page);
        limit = Math.min(50, Math.max(1, limit));

        const [reactions, total] =
            await this.reactionRepository.findAndCount({
            where: postId ? { postId } : {},
            skip: (page - 1) * limit,
            take: limit,
            order: {
                createdAt: 'DESC',
            },
            });

        return {
            message: 'Reactions fetched successfully',
            data: reactions,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
    }


    async getReactionById(id: string) {
        const reaction = await this.reactionRepository.findOne({
            where: { id },
        });

        if (!reaction) {
            throw new NotFoundException('Reaction not found');
        }

        return {
            message: 'Reaction fetched successfully',
            data: reaction,
        };
    }    


    async updateReaction(
        id: string,
        userId: string,
        userRole: UserRole,
        dto: UpdateReactionDto,
        ) {
        const reaction = await this.findReactionWithAccess(
            id,
            userId,
            userRole,
        );

        Object.assign(reaction, dto);

        const updatedReaction =
            await this.reactionRepository.save(reaction);

        
        await this.activityLogsService.createSafely({
            userId: userId,
            action: 'REACTION_CHANGED',
            entityType: 'Reaction',
            entityId: reaction.id,
            details: {
                postId: reaction.postId,
                newType: reaction.type,
            },
        });


        return {
            message: 'Reaction updated successfully',
            data: updatedReaction,
        };
    }


    async deleteReaction(
        id: string,
        userId: string,
        userRole: UserRole,
        ) {
        const reaction = await this.findReactionWithAccess(
            id,
            userId,
            userRole,
        );

        await this.reactionRepository.remove(reaction);

        await this.activityLogsService.createSafely({
            userId: userId,
            action: 'REACTION_REMOVED',
            entityType: 'Reaction',
            entityId: reaction.id,
            details: {
                postId: reaction.postId,
                reactionType: reaction.type,
            },
        });

        return {
            message: 'Reaction removed successfully',
        };
    }
}
