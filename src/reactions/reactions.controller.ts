import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CreateReactionDto } from './dtos/create-reaction.dto';
import { UpdateReactionDto } from './dtos/update-reaction.dto';

@Controller('reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(
    private readonly reactionsService: ReactionsService,
  ) {}

  // POST /reactions
  @Post()
  createReaction(
    @Req() req: any,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.reactionsService.createReaction(
      req.user.id,
      createReactionDto,
    );
  }

  // GET /reactions
  @Get()
  getAllReactions(
    @Query('postId') postId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reactionsService.getAllReactions(
      postId,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // GET /reactions/:id
  @Get(':id')
  getReactionById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.reactionsService.getReactionById(id);
  }

  // PATCH /reactions/:id
  @Patch(':id')
  updateReaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Body() updateReactionDto: UpdateReactionDto,
  ) {
    return this.reactionsService.updateReaction(
      id,
      req.user.id,
      req.user.role,
      updateReactionDto,
    );
  }

  // DELETE /reactions/:id
  @Delete(':id')
  deleteReaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.reactionsService.deleteReaction(
      id,
      req.user.id,
      req.user.role,
    );
  }
}