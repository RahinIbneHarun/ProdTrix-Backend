import { Controller } from '@nestjs/common';
import { DrawProjectService } from './draw-project.service';

@Controller('draw-project')
export class DrawProjectController {
  constructor(private readonly drawProjectService: DrawProjectService) {}
}
