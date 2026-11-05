import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){}

    async get() {
        const users = await this.userRepository.find();
        return{
            message:"All Users",
            data: users
        }
    }

    async getById(id: string) {
        const user = await this.userRepository.findOneBy({ id });
        if(!user){
            throw new NotFoundException("User not found");
        }
        return{
            message:"User Found",
            data: user
        }
    }
}
