
import { IsEnum } from 'class-validator';
import { DrawProjectStatus } from '../enums/draw-project-status.enum';

export class UpdateDrawProjectStatusDto {
  @IsEnum(DrawProjectStatus)
  status: DrawProjectStatus;
}
