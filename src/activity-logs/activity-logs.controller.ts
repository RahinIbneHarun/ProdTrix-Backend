
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ActivityLogsService } from './activity-logs.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // Get all activity logs (Super Admin only)
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.activityLogsService.getAll(
      Math.max(Number(page) || 1, 1),
      Math.max(Number(limit) || 10, 1),
    );
  }

  // Get current user's activity logs
  @Get('me')
  getMyLogs(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.activityLogsService.getMyLogs(
      req.user.id,
      Math.max(Number(page) || 1, 1),
      Math.max(Number(limit) || 10, 1),
    );
  }

  // Get activity log by ID
  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.activityLogsService.getById(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
