import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FollowsService } from './follows.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('follows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
  ) {}

  // POST /follows/:userId
  @Post(':userId')
  followUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: any,
  ) {
    return this.followsService.followUser(
      req.user.id,
      userId,
    );
  }

  // GET /follows
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  getAllFollows(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.followsService.getAllFollows(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // GET /follows/:id
  @Get(':id')
  getFollowById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.followsService.getFollowById(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // DELETE /follows/:userId
  @Delete(':userId')
  unfollowUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: any,
  ) {
    return this.followsService.unfollowUser(
      req.user.id,
      userId,
    );
  }
}