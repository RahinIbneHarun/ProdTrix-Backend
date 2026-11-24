import { Module } from '@nestjs/common';
import { LearningRequestService } from './learning-request.service';
import { LearningRequestController } from './learning-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningRequest } from './entities/learning-request.entity';
import { User } from 'src/users/entities/user.entity';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([LearningRequest, User]), ActivityLogsModule],
  controllers: [LearningRequestController],
  providers: [LearningRequestService],
})
export class LearningRequestModule {}
