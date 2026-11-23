
import { PartialType } from '@nestjs/mapped-types';
import { CreateDrawProjectDto } from './create-draw-project.dto';

export class UpdateDrawProjectDto extends PartialType(
  CreateDrawProjectDto,
) {}
