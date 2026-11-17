import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
  ) {}

  @Get('me/following') // ami jader follow kori
  @UseGuards(JwtAuthGuard)
  getFollowing(@Req() req: any) {
    return this.followsService.getFollowing(req.user.id);
  }
}