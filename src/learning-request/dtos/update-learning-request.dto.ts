
import { PartialType } from '@nestjs/mapped-types';
import { CreateLearningRequestDto } from './create-learning-request.dto';

export class UpdateLearningRequestDto extends PartialType(
  CreateLearningRequestDto,
) {}
