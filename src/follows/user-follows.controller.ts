//These endpoints belong to the user profile API, so create a separate controller:
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FollowsService } from './follows.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserFollowsController {
  constructor(
    private readonly followsService: FollowsService,
  ) {}

  // GET /users/:id/followers
  @Get(':id/followers')
  getFollowers(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.followsService.getFollowers(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // GET /users/:id/following
  @Get(':id/following')
  getFollowing(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.followsService.getFollowing(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }
}