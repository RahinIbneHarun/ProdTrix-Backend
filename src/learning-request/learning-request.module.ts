import { Module } from '@nestjs/common';
import { LearningRequestService } from './learning-request.service';
import { LearningRequestController } from './learning-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningRequest } from './entities/learning-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningRequest])],
  controllers: [LearningRequestController],
  providers: [LearningRequestService],
})
export class LearningRequestModule {}
