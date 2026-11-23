import { Module } from '@nestjs/common';
import { LearningRequestService } from './learning-request.service';
import { LearningRequestController } from './learning-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningRequest } from './entities/learning-request.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningRequest, User])],
  controllers: [LearningRequestController],
  providers: [LearningRequestService],
})
export class LearningRequestModule {}
