
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

import { EventService } from './event.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Create event
  @Post()
  create(
    @Req() req: any,
    @Body() createDto: CreateEventDto,
  ) {
    return this.eventService.create(req.user.id, createDto);
  }

  // Get events visible to the current user
  // Super Admin gets all events
  @Get()
  getAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.max(Number(limit) || 10, 1);

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.eventService.getAll(
        currentPage,
        currentLimit,
      );
    }

    return this.eventService.getVisibleEvents(
      req.user.id,
      currentPage,
      currentLimit,
    );
  }

  // Get event by ID
  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.eventService.getById(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // Update event
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() updateDto: UpdateEventDto,
  ) {
    return this.eventService.update(
      id,
      req.user.id,
      req.user.role,
      updateDto,
    );
  }

  // Delete event
  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.eventService.delete(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
