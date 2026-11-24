import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UserStatus } from './enums/user-status.enum';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Profile) 
        private readonly profileRepository: Repository<Profile>,

        private readonly activityLogsService: ActivityLogsService,
    ){}

    async get() {
        const users = await this.userRepository.find();
        return{
            message:"All Users",
            data: users
        }
    }

    async getByEmail(email: string){
        const user = await this.userRepository.findOneBy({email});

        // if(!user){
        //     throw new NotFoundException("User not found");
        // }
        return user;
    }

    async create(createUserDto: CreateUserDto){
        const user = await this.userRepository.create(createUserDto);

        await this.userRepository.save(user);
        return{
            message:"User created successfully",
            data: user
        }
    }

    async getMe(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            emailVerifiedAt: true,
            createdAt: true,
            updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'User profile fetched successfully',
            data: user,
        };
    }
    
    async getById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
            profile: true,
            },
            select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            profile: {
                avatarUrl: true,
                coverUrl: true,
                bio: true,
                timezone: true,
                birthday: true,
                sex: true,
                homeLocation: true,
                currentLocation: true,
            },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'Public profile fetched successfully',
            data: user,
        };
    }

    async updateProfile(id: string, dto: UpdateProfileDto) {
        return this.userRepository.manager.transaction(
            async (manager) => {
            const userRepo = manager.getRepository(User);
            const profileRepo = manager.getRepository(Profile);

            const user = await userRepo.findOne({
                where: { id: id },
                relations: { profile: true },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Update User entity
            if (dto.firstName !== undefined) {
                user.firstName = dto.firstName;
            }

            if (dto.lastName !== undefined) {
                user.lastName = dto.lastName;
            }

            await userRepo.save(user);

            // Update Profile entity
            let profile = user.profile;

            if (!profile) {
                profile = profileRepo.create({ user });
            }

            const {
                firstName,
                lastName,
                ...profileData
            } = dto;

            Object.assign(profile, profileData);

            await profileRepo.save(profile);

            const { passwordHash, ...safeUser } = user;


            await this.activityLogsService.createSafely({
            userId: user.id,
            action: 'PROFILE_UPDATED',
            entityType: 'User',
            entityId: user.id,
            details: {
                updatedFields: Object.keys(dto),
            },
            });


            return {
                message: 'Profile updated successfully',
                data: {
                ...safeUser,
                profile,
                },
            };
            },
        );
    }

    async deactivateUser(userId: string) {
        const user = await this.userRepository.findOneBy({
            id: userId,
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.status === UserStatus.DEACTIVATED) {
            throw new BadRequestException('Account is already deactivated');
        }

        user.status = UserStatus.DEACTIVATED;

        await this.userRepository.save(user);

        await this.activityLogsService.createSafely({
            userId,
            action: 'ACCOUNT_DEACTIVATED',
            entityType: 'User',
            entityId: userId,
        });

        return {
            message: 'Your account has been deactivated successfully',
        };
    }


    async updateUserStatus(
        id: string,
        status: UserStatus,
        ) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.status = status;

        const updatedUser = await this.userRepository.save(user);

        return {
            message: 'User status updated successfully',
            data: {
            id: updatedUser.id,
            email: updatedUser.email,
            status: updatedUser.status,
            },
        };
}

    
}
