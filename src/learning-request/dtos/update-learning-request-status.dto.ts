
import { IsEnum } from 'class-validator';
import { LearningRequestStatus } from '../enums/learning-request-status.enum';

export class UpdateLearningRequestStatusDto {
  @IsEnum(LearningRequestStatus)
  status: LearningRequestStatus;
}
