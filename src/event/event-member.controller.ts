
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { EventMemberService } from './event-member.service';

import { CreateEventMemberDto } from './dtos/create-event-member.dto';
import { UpdateEventMemberStatusDto } from './dtos/update-event-member-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventMemberController {
  constructor(
    private readonly eventMemberService: EventMemberService,
  ) {}

  // Invite a user to an event
  @Post('events/:eventId/members')
  invite(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Req() req: any,
    @Body() createDto: CreateEventMemberDto,
  ) {
    return this.eventMemberService.invite(
      eventId,
      req.user.id,
      req.user.role,
      createDto,
    );
  }

  // Get members of an event
  @Get('events/:eventId/members')
  getMembers(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.eventMemberService.getMembers(
      eventId,
      req.user.id,
      req.user.role,
      Math.max(Number(page) || 1, 1),
      Math.max(Number(limit) || 10, 1),
    );
  }

  // Get current user's event memberships
  @Get('event-members/me')
  getMyMemberships(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.eventMemberService.getMyMemberships(
      req.user.id,
      Math.max(Number(page) || 1, 1),
      Math.max(Number(limit) || 10, 1),
    );
  }

  // Update membership status
  @Patch('events/:eventId/members/:userId')
  updateStatus(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: any,
    @Body() updateDto: UpdateEventMemberStatusDto,
  ) {
    return this.eventMemberService.updateStatus(
      eventId,
      userId,
      req.user.id,
      req.user.role,
      updateDto,
    );
  }

  // Remove member from event
  @Delete('events/:eventId/members/:userId')
  removeMember(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: any,
  ) {
    return this.eventMemberService.removeMember(
      eventId,
      userId,
      req.user.id,
      req.user.role,
    );
  }
}
