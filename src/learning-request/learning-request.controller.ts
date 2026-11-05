import { Controller } from '@nestjs/common';
import { LearningRequestService } from './learning-request.service';

@Controller('learning-request')
export class LearningRequestController {
  constructor(private readonly learningRequestService: LearningRequestService) {}
}
