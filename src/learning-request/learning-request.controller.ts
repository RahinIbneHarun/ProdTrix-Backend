
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

import { LearningRequestService } from './learning-request.service';

import { CreateLearningRequestDto } from './dtos/create-learning-request.dto';
import { UpdateLearningRequestDto } from './dtos/update-learning-request.dto';
import { UpdateLearningRequestStatusDto } from './dtos/update-learning-request-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('learning-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningRequestController {
  constructor(
    private readonly learningRequestService: LearningRequestService,
  ) {}

  // Create a learning request
  @Post()
  create(
    @Req() req: any,
    @Body() createDto: CreateLearningRequestDto,
  ) {
    return this.learningRequestService.create(
      req.user.id,
      createDto,
    );
  }

  // Get all requests for Super Admin,
  // or only the current user's requests for other users
  @Get()
  getAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.max(Number(limit) || 10, 1);

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.learningRequestService.getAll(
        currentPage,
        currentLimit,
      );
    }

    return this.learningRequestService.getMyRequests(
      req.user.id,
      currentPage,
      currentLimit,
    );
  }

  // Update request status (Super Admin only)
  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateLearningRequestStatusDto,
    @Req() req: any,
  ) {
    return this.learningRequestService.updateStatus(id, req.user.id, updateDto);
  }

  // Get request by ID
  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.learningRequestService.getById(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // Update request
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() updateDto: UpdateLearningRequestDto,
  ) {
    return this.learningRequestService.update(
      id,
      req.user.id,
      req.user.role,
      updateDto,
    );
  }

  // Delete request
  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.learningRequestService.delete(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
