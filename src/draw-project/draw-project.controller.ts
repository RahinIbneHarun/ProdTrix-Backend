
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

import { DrawProjectService } from './draw-project.service';

import { CreateDrawProjectDto } from './dtos/create-draw-project.dto';
import { UpdateDrawProjectDto } from './dtos/update-draw-project.dto';
import { UpdateDrawProjectStatusDto } from './dtos/update-draw-project-status.dto';
import { LinkDrawProjectPostDto } from './dtos/link-draw-project-post.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('draw-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DrawProjectController {
  constructor(
    private readonly drawProjectService: DrawProjectService,
  ) {}

  // Create a project
  @Post()
  create(
    @Req() req: any,
    @Body() createDto: CreateDrawProjectDto,
  ) {
    return this.drawProjectService.create(
      req.user.id,
      createDto,
    );
  }

  // Get all projects for Super Admin,
  // or only the current user's projects for other users
  @Get()
  getAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.max(Number(limit) || 10, 1);

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.drawProjectService.getAll(
        currentPage,
        currentLimit,
      );
    }

    return this.drawProjectService.getMyProjects(
      req.user.id,
      currentPage,
      currentLimit,
    );
  }

  // Update project status (Super Admin only)
  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req:any,
    @Body() updateDto: UpdateDrawProjectStatusDto,
  ) {
    return this.drawProjectService.updateStatus(id, req.user.id ,updateDto);
  }

  // Link project to a post
  @Patch(':id/post')
  linkPost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() linkDto: LinkDrawProjectPostDto,
  ) {
    return this.drawProjectService.linkPost(
      id,
      linkDto.postId,
      req.user.id,
      req.user.role,
    );
  }

  // Unlink project from its post
  @Delete(':id/post')
  unlinkPost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.drawProjectService.unlinkPost(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // Get project by ID
  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.drawProjectService.getById(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // Update project
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() updateDto: UpdateDrawProjectDto,
  ) {
    return this.drawProjectService.update(
      id,
      req.user.id,
      req.user.role,
      updateDto,
    );
  }

  // Delete project
  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.drawProjectService.delete(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
